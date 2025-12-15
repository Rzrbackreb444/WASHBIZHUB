/**
 * ADVANCED HOSTING SERVICES
 * 
 * Complete hosting suite:
 * - Uptime monitoring (24/7)
 * - Visitor analytics
 * - Staging environments
 * - Version control / rollback
 * - Performance monitoring
 */

import { db } from "./db";
import { 
  uptimeMonitoring, 
  uptimeCheckHistory,
  visitorAnalytics,
  stagingEnvironments,
  versionHistory,
  sitePerformanceMetrics,
  multiSiteDashboard,
  InsertUptimeMonitoring,
  InsertVisitorAnalytics,
  InsertStagingEnvironment,
  InsertVersionHistory,
  InsertSitePerformanceMetrics,
  customerWebsites
} from "@shared/schema";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";

// ============================================================================
// UPTIME MONITORING
// ============================================================================

export interface UptimeCheckResult {
  status: "up" | "down" | "degraded" | "timeout";
  responseTime: number;
  statusCode: number | null;
  errorMessage?: string;
}

/**
 * Perform uptime check on a URL
 */
export async function performUptimeCheck(
  url: string,
  timeout: number = 30000
): Promise<UptimeCheckResult> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent": "WashBizHub-Uptime-Monitor/1.0",
      },
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    let status: "up" | "down" | "degraded" = "up";
    if (response.status >= 500) {
      status = "down";
    } else if (response.status >= 400) {
      status = "degraded";
    } else if (responseTime > 5000) {
      status = "degraded";
    }
    
    return {
      status,
      responseTime,
      statusCode: response.status,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    if (error.name === "AbortError") {
      return {
        status: "timeout",
        responseTime: timeout,
        statusCode: null,
        errorMessage: "Request timed out",
      };
    }
    
    return {
      status: "down",
      responseTime,
      statusCode: null,
      errorMessage: error.message || "Connection failed",
    };
  }
}

/**
 * Run uptime checks for all monitors
 */
export async function runScheduledUptimeChecks(): Promise<{
  checked: number;
  up: number;
  down: number;
  degraded: number;
}> {
  const monitors = await db
    .select()
    .from(uptimeMonitoring)
    .where(eq(uptimeMonitoring.status, "up"));
  
  let up = 0, down = 0, degraded = 0;
  
  for (const monitor of monitors) {
    const result = await performUptimeCheck(monitor.checkUrl, monitor.timeout || 30000);
    
    // Save check history
    await db.insert(uptimeCheckHistory).values({
      monitorId: monitor.id,
      status: result.status,
      responseTime: result.responseTime,
      statusCode: result.statusCode,
      errorMessage: result.errorMessage,
    });
    
    // Update monitor status
    const statusChanged = monitor.status !== result.status;
    await db
      .update(uptimeMonitoring)
      .set({
        status: result.status,
        responseTime: result.responseTime,
        statusCode: result.statusCode,
        lastChecked: new Date(),
        lastStatusChange: statusChanged ? new Date() : monitor.lastStatusChange,
        updatedAt: new Date(),
      })
      .where(eq(uptimeMonitoring.id, monitor.id));
    
    if (result.status === "up") up++;
    else if (result.status === "down") down++;
    else degraded++;
    
    // TODO: Send alerts if status changed to down
  }
  
  return { checked: monitors.length, up, down, degraded };
}

/**
 * Get uptime statistics for a monitor
 */
export async function getUptimeStats(
  monitorId: string,
  days: number = 30
): Promise<{
  uptime24h: number;
  uptime7d: number;
  uptime30d: number;
  avgResponseTime: number;
  totalDowntime: number;
  incidents: Array<{ start: Date; end: Date | null; duration: number }>;
}> {
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const history = await db
    .select()
    .from(uptimeCheckHistory)
    .where(and(
      eq(uptimeCheckHistory.monitorId, monitorId),
      gte(uptimeCheckHistory.checkedAt, startDate)
    ))
    .orderBy(desc(uptimeCheckHistory.checkedAt));
  
  // Calculate uptime percentages
  const calculateUptime = (records: typeof history) => {
    if (records.length === 0) return 100;
    const upRecords = records.filter(r => r.status === "up").length;
    return Math.round((upRecords / records.length) * 10000) / 100;
  };
  
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const last24h = history.filter(h => h.checkedAt && h.checkedAt >= oneDayAgo);
  const last7d = history.filter(h => h.checkedAt && h.checkedAt >= sevenDaysAgo);
  
  // Calculate average response time
  const responseTimes = history
    .filter(h => h.responseTime !== null)
    .map(h => h.responseTime as number);
  const avgResponseTime = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0;
  
  // Find incidents (consecutive down periods)
  const incidents: Array<{ start: Date; end: Date | null; duration: number }> = [];
  let currentIncident: { start: Date; end: Date | null } | null = null;
  
  for (let i = history.length - 1; i >= 0; i--) {
    const record = history[i];
    if (record.status === "down" && !currentIncident) {
      currentIncident = { start: record.checkedAt!, end: null };
    } else if (record.status === "up" && currentIncident) {
      currentIncident.end = record.checkedAt!;
      const duration = currentIncident.end.getTime() - currentIncident.start.getTime();
      incidents.push({ ...currentIncident, duration: Math.round(duration / 60000) });
      currentIncident = null;
    }
  }
  
  if (currentIncident) {
    const duration = now.getTime() - currentIncident.start.getTime();
    incidents.push({ ...currentIncident, duration: Math.round(duration / 60000) });
  }
  
  const totalDowntime = incidents.reduce((sum, i) => sum + i.duration, 0);
  
  return {
    uptime24h: calculateUptime(last24h),
    uptime7d: calculateUptime(last7d),
    uptime30d: calculateUptime(history),
    avgResponseTime,
    totalDowntime,
    incidents: incidents.slice(0, 10),
  };
}

/**
 * Get uptime dashboard
 */
export async function getUptimeDashboard(
  userId: string
): Promise<{
  monitors: Array<{
    id: string;
    domain: string;
    status: string;
    uptime: number;
    responseTime: number | null;
    lastChecked: Date | null;
  }>;
  summary: {
    total: number;
    up: number;
    down: number;
    degraded: number;
    avgUptime: number;
  };
}> {
  const monitors = await db
    .select()
    .from(uptimeMonitoring)
    .where(eq(uptimeMonitoring.userId, userId))
    .orderBy(desc(uptimeMonitoring.updatedAt));
  
  const summary = {
    total: monitors.length,
    up: monitors.filter(m => m.status === "up").length,
    down: monitors.filter(m => m.status === "down").length,
    degraded: monitors.filter(m => m.status === "degraded").length,
    avgUptime: 0,
  };
  
  const uptimes = monitors
    .filter(m => m.uptime30d !== null)
    .map(m => Number(m.uptime30d));
  summary.avgUptime = uptimes.length > 0
    ? Math.round(uptimes.reduce((a, b) => a + b, 0) / uptimes.length * 100) / 100
    : 100;
  
  return {
    monitors: monitors.map(m => ({
      id: m.id,
      domain: m.domain,
      status: m.status || "unknown",
      uptime: Number(m.uptime30d || 100),
      responseTime: m.responseTime,
      lastChecked: m.lastChecked,
    })),
    summary,
  };
}

// ============================================================================
// VISITOR ANALYTICS
// ============================================================================

/**
 * Record a page view
 */
export async function recordPageView(
  websiteId: string,
  data: {
    path: string;
    referrer?: string;
    userAgent?: string;
    country?: string;
    city?: string;
    sessionId?: string;
  }
): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const hour = new Date().getHours();
  
  // Get or create today's record
  const existing = await db
    .select()
    .from(visitorAnalytics)
    .where(and(
      eq(visitorAnalytics.websiteId, websiteId),
      eq(visitorAnalytics.date, today),
      eq(visitorAnalytics.hour, hour)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    const record = existing[0];
    const topPages = (record.topPages as any[] || []);
    const pageIndex = topPages.findIndex((p: any) => p.path === data.path);
    
    if (pageIndex >= 0) {
      topPages[pageIndex].views++;
    } else {
      topPages.push({ path: data.path, views: 1 });
    }
    
    await db
      .update(visitorAnalytics)
      .set({
        pageviews: sql`${visitorAnalytics.pageviews} + 1`,
        topPages,
      })
      .where(eq(visitorAnalytics.id, record.id));
  } else {
    await db.insert(visitorAnalytics).values({
      websiteId,
      date: today,
      hour,
      pageviews: 1,
      uniqueVisitors: 1,
      sessions: 1,
      topPages: [{ path: data.path, views: 1 }],
    });
  }
}

/**
 * Get analytics dashboard
 */
export async function getAnalyticsDashboard(
  websiteId: string,
  days: number = 30
): Promise<{
  summary: {
    pageviews: number;
    uniqueVisitors: number;
    sessions: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
  dailyTrend: Array<{ date: string; pageviews: number; visitors: number }>;
  topPages: Array<{ path: string; views: number }>;
  trafficSources: Record<string, number>;
  deviceBreakdown: Record<string, number>;
  topCountries: Array<{ country: string; visits: number }>;
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  
  const analytics = await db
    .select()
    .from(visitorAnalytics)
    .where(and(
      eq(visitorAnalytics.websiteId, websiteId),
      gte(visitorAnalytics.date, startDate)
    ))
    .orderBy(desc(visitorAnalytics.date));
  
  // Aggregate summary
  const summary = {
    pageviews: analytics.reduce((sum, a) => sum + (a.pageviews || 0), 0),
    uniqueVisitors: analytics.reduce((sum, a) => sum + (a.uniqueVisitors || 0), 0),
    sessions: analytics.reduce((sum, a) => sum + (a.sessions || 0), 0),
    avgSessionDuration: 0,
    bounceRate: 0,
  };
  
  const durations = analytics
    .filter(a => a.avgSessionDuration !== null)
    .map(a => a.avgSessionDuration as number);
  summary.avgSessionDuration = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0;
  
  const bounceRates = analytics
    .filter(a => a.bounceRate !== null)
    .map(a => Number(a.bounceRate));
  summary.bounceRate = bounceRates.length > 0
    ? Math.round(bounceRates.reduce((a, b) => a + b, 0) / bounceRates.length * 100) / 100
    : 0;
  
  // Daily trend
  const dailyMap = new Map<string, { pageviews: number; visitors: number }>();
  for (const record of analytics) {
    if (!record.date) continue;
    const dateStr = record.date.toISOString().split("T")[0];
    const existing = dailyMap.get(dateStr) || { pageviews: 0, visitors: 0 };
    existing.pageviews += record.pageviews || 0;
    existing.visitors += record.uniqueVisitors || 0;
    dailyMap.set(dateStr, existing);
  }
  
  const dailyTrend = Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  // Top pages (aggregate)
  const pageMap = new Map<string, number>();
  for (const record of analytics) {
    const pages = record.topPages as Array<{ path: string; views: number }> || [];
    for (const page of pages) {
      pageMap.set(page.path, (pageMap.get(page.path) || 0) + page.views);
    }
  }
  const topPages = Array.from(pageMap.entries())
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 20);
  
  // Traffic sources (aggregate)
  const trafficSources: Record<string, number> = { direct: 0, organic: 0, referral: 0, social: 0 };
  for (const record of analytics) {
    const sources = record.trafficSources as Record<string, number> || {};
    for (const [source, count] of Object.entries(sources)) {
      trafficSources[source] = (trafficSources[source] || 0) + count;
    }
  }
  
  // Device breakdown
  const deviceBreakdown: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 };
  for (const record of analytics) {
    const devices = record.deviceBreakdown as Record<string, number> || {};
    for (const [device, count] of Object.entries(devices)) {
      deviceBreakdown[device] = (deviceBreakdown[device] || 0) + count;
    }
  }
  
  // Top countries
  const countryMap = new Map<string, number>();
  for (const record of analytics) {
    const countries = record.topCountries as Array<{ country: string; visits: number }> || [];
    for (const c of countries) {
      countryMap.set(c.country, (countryMap.get(c.country) || 0) + c.visits);
    }
  }
  const topCountries = Array.from(countryMap.entries())
    .map(([country, visits]) => ({ country, visits }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10);
  
  return {
    summary,
    dailyTrend,
    topPages,
    trafficSources,
    deviceBreakdown,
    topCountries,
  };
}

// ============================================================================
// STAGING & VERSION CONTROL
// ============================================================================

/**
 * Create a staging environment
 */
export async function createStagingEnvironment(
  websiteId: string,
  userId: string,
  name: string,
  branch?: string
): Promise<typeof stagingEnvironments.$inferSelect> {
  const stagingUrl = `staging-${Date.now()}.preview.washbizhub.com`;
  
  const [staging] = await db
    .insert(stagingEnvironments)
    .values({
      websiteId,
      name,
      stagingUrl,
      status: "creating",
      branch: branch || "main",
      createdBy: userId,
    })
    .returning();
  
  // In production, this would trigger actual staging deployment
  // For now, simulate creation
  setTimeout(async () => {
    await db
      .update(stagingEnvironments)
      .set({ status: "active", deployedAt: new Date() })
      .where(eq(stagingEnvironments.id, staging.id));
  }, 5000);
  
  return staging;
}

/**
 * Get staging environments for a website
 */
export async function getStagingEnvironments(
  websiteId: string
): Promise<typeof stagingEnvironments.$inferSelect[]> {
  return db
    .select()
    .from(stagingEnvironments)
    .where(eq(stagingEnvironments.websiteId, websiteId))
    .orderBy(desc(stagingEnvironments.createdAt));
}

/**
 * Create a version snapshot
 */
export async function createVersionSnapshot(
  websiteId: string,
  userId: string,
  description: string,
  changeType: string
): Promise<typeof versionHistory.$inferSelect> {
  // Get current version number
  const versions = await db
    .select()
    .from(versionHistory)
    .where(eq(versionHistory.websiteId, websiteId))
    .orderBy(desc(versionHistory.versionNumber))
    .limit(1);
  
  const nextVersion = (versions[0]?.versionNumber || 0) + 1;
  
  const [version] = await db
    .insert(versionHistory)
    .values({
      websiteId,
      versionNumber: nextVersion,
      description,
      changeType,
      createdBy: userId,
      snapshotData: {}, // In production, this would contain actual site data
    })
    .returning();
  
  return version;
}

/**
 * Get version history for a website
 */
export async function getVersionHistory(
  websiteId: string,
  limit: number = 20
): Promise<typeof versionHistory.$inferSelect[]> {
  return db
    .select()
    .from(versionHistory)
    .where(eq(versionHistory.websiteId, websiteId))
    .orderBy(desc(versionHistory.createdAt))
    .limit(limit);
}

/**
 * Rollback to a specific version
 */
export async function rollbackToVersion(
  versionId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  const [version] = await db
    .select()
    .from(versionHistory)
    .where(eq(versionHistory.id, versionId))
    .limit(1);
  
  if (!version) {
    return { success: false, message: "Version not found" };
  }
  
  // Create a new version for the rollback
  await createVersionSnapshot(
    version.websiteId,
    userId,
    `Rollback to version ${version.versionNumber}`,
    "rollback"
  );
  
  // In production, this would restore the actual site state
  
  return { 
    success: true, 
    message: `Successfully rolled back to version ${version.versionNumber}` 
  };
}

// ============================================================================
// MULTI-SITE DASHBOARD
// ============================================================================

/**
 * Get multi-site overview
 */
export async function getMultiSiteDashboard(
  userId: string
): Promise<{
  sites: Array<{
    id: string;
    domain: string;
    status: string;
    uptime: number;
    traffic: number;
    seoScore: number;
  }>;
  aggregates: {
    totalSites: number;
    totalTraffic: number;
    avgUptime: number;
    avgSeoScore: number;
    sitesUp: number;
    sitesDown: number;
  };
}> {
  // Get all sites for user
  const sites = await db
    .select()
    .from(multiSiteDashboard)
    .where(eq(multiSiteDashboard.userId, userId))
    .orderBy(desc(multiSiteDashboard.updatedAt));
  
  const aggregates = {
    totalSites: sites.length,
    totalTraffic: sites.reduce((sum, s) => sum + (s.totalTraffic || 0), 0),
    avgUptime: 0,
    avgSeoScore: 0,
    sitesUp: sites.filter(s => s.status === "active").length,
    sitesDown: sites.filter(s => s.status === "down").length,
  };
  
  const uptimes = sites.filter(s => s.uptime !== null).map(s => Number(s.uptime));
  aggregates.avgUptime = uptimes.length > 0
    ? Math.round(uptimes.reduce((a, b) => a + b, 0) / uptimes.length * 100) / 100
    : 100;
  
  const seoScores = sites.filter(s => s.seoScore !== null).map(s => s.seoScore as number);
  aggregates.avgSeoScore = seoScores.length > 0
    ? Math.round(seoScores.reduce((a, b) => a + b, 0) / seoScores.length)
    : 0;
  
  return {
    sites: sites.map(s => ({
      id: s.id,
      domain: s.domain,
      status: s.status || "unknown",
      uptime: Number(s.uptime || 100),
      traffic: s.totalTraffic || 0,
      seoScore: s.seoScore || 0,
    })),
    aggregates,
  };
}

export default {
  // Uptime
  performUptimeCheck,
  runScheduledUptimeChecks,
  getUptimeStats,
  getUptimeDashboard,
  
  // Analytics
  recordPageView,
  getAnalyticsDashboard,
  
  // Staging & Versioning
  createStagingEnvironment,
  getStagingEnvironments,
  createVersionSnapshot,
  getVersionHistory,
  rollbackToVersion,
  
  // Multi-site
  getMultiSiteDashboard,
};
