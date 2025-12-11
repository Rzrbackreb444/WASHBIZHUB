import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { auditLogs } from "@shared/schema";

export type AuditLogLevel = "all" | "errors-only" | "security-events";

interface AuditLogConfig {
  level: AuditLogLevel;
  excludePaths: string[];
  sensitiveFields: string[];
}

const defaultConfig: AuditLogConfig = {
  level: "all",
  excludePaths: [
    "/api/health",
    "/api/status",
    "/api/metrics",
    "/_next",
    "/static",
    "/favicon.ico",
  ],
  sensitiveFields: [
    "password",
    "passwordHash",
    "token",
    "accessToken",
    "refreshToken",
    "apiKey",
    "secret",
    "authorization",
    "cookie",
    "creditCard",
    "ssn",
  ],
};

let currentConfig: AuditLogConfig = { ...defaultConfig };

export function configureAuditLog(config: Partial<AuditLogConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}

function shouldLog(statusCode: number, path: string): boolean {
  if (currentConfig.excludePaths.some((p) => path.startsWith(p))) {
    return false;
  }

  switch (currentConfig.level) {
    case "errors-only":
      return statusCode >= 400;
    case "security-events":
      return (
        statusCode >= 400 ||
        path.includes("/auth") ||
        path.includes("/login") ||
        path.includes("/password") ||
        path.includes("/admin")
      );
    case "all":
    default:
      return true;
  }
}

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return (typeof forwarded === "string" ? forwarded : forwarded[0])
      .split(",")[0]
      .trim();
  }
  return req.socket.remoteAddress || "unknown";
}

function getUserId(req: Request): string | null {
  const user = req.user as any;
  return user?.claims?.sub || user?.id || null;
}

function sanitizeUserAgent(userAgent: string | undefined): string {
  if (!userAgent) return "unknown";
  return userAgent.substring(0, 500);
}

async function writeAuditLog(data: {
  userId: string | null;
  ipAddress: string;
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number;
  userAgent: string;
}): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId: data.userId,
      ipAddress: data.ipAddress,
      endpoint: data.endpoint,
      method: data.method,
      statusCode: data.statusCode,
      duration: data.duration,
      userAgent: data.userAgent,
    });
  } catch (error) {
    console.error("[AUDIT_LOG] Failed to write audit log:", error);
  }
}

export function auditLogMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const originalEnd = res.end;
    const endpoint = req.originalUrl || req.url;
    const method = req.method;
    const ipAddress = getClientIp(req);
    const userAgent = sanitizeUserAgent(req.headers["user-agent"]);

    res.end = function (this: Response, ...args: any[]): Response {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      if (shouldLog(statusCode, endpoint)) {
        const userId = getUserId(req);
        setImmediate(() => {
          writeAuditLog({
            userId,
            ipAddress,
            endpoint: endpoint.substring(0, 2048),
            method,
            statusCode,
            duration,
            userAgent,
          });
        });
      }

      return originalEnd.apply(this, args as any);
    };

    next();
  };
}

export async function getAuditLogs(options: {
  userId?: string;
  ipAddress?: string;
  startDate?: Date;
  endDate?: Date;
  statusCode?: number;
  limit?: number;
  offset?: number;
}) {
  const { eq, and, gte, lte, desc } = await import("drizzle-orm");
  
  const conditions = [];
  if (options.userId) {
    conditions.push(eq(auditLogs.userId, options.userId));
  }
  if (options.ipAddress) {
    conditions.push(eq(auditLogs.ipAddress, options.ipAddress));
  }
  if (options.startDate) {
    conditions.push(gte(auditLogs.createdAt, options.startDate));
  }
  if (options.endDate) {
    conditions.push(lte(auditLogs.createdAt, options.endDate));
  }
  if (options.statusCode) {
    conditions.push(eq(auditLogs.statusCode, options.statusCode));
  }

  const query = db
    .select()
    .from(auditLogs)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(auditLogs.createdAt))
    .limit(options.limit || 100)
    .offset(options.offset || 0);

  return query;
}

export async function cleanupOldAuditLogs(daysToKeep: number = 90): Promise<number> {
  const { lt } = await import("drizzle-orm");
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await db
    .delete(auditLogs)
    .where(lt(auditLogs.createdAt, cutoffDate));

  return (result as any).rowCount || 0;
}
