/**
 * GOOGLE SEARCH CONSOLE INTEGRATION
 * 
 * Real ranking data & analytics integration:
 * - Search performance queries
 * - Index coverage status
 * - URL inspection
 * - Sitemap management
 * - Rich results status
 */

import { db } from "./db";
import { searchConsoleData, InsertSearchConsoleData, seoProjects } from "@shared/schema";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";
import { google } from "googleapis";

// Initialize Google APIs
const searchconsole = google.searchconsole("v1");

// OAuth2 client for authenticated requests
function getAuthClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return auth;
}

export interface SearchPerformanceMetrics {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchQueryData {
  query: string;
  page: string;
  country: string;
  device: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  date: Date;
}

export interface IndexCoverageData {
  type: string;
  status: string;
  count: number;
  examples: string[];
}

/**
 * Fetch search performance data from Google Search Console
 */
export async function fetchSearchPerformance(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string,
  dimensions: string[] = ["query", "page", "country", "device"]
): Promise<SearchQueryData[]> {
  try {
    const auth = getAuthClient(accessToken);
    
    const response = await searchconsole.searchanalytics.query({
      auth,
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions,
        rowLimit: 1000,
        startRow: 0,
      },
    });

    const rows = response.data.rows || [];
    
    return rows.map((row) => ({
      query: dimensions.includes("query") ? (row.keys?.[dimensions.indexOf("query")] || "") : "",
      page: dimensions.includes("page") ? (row.keys?.[dimensions.indexOf("page")] || "") : "",
      country: dimensions.includes("country") ? (row.keys?.[dimensions.indexOf("country")] || "") : "",
      device: dimensions.includes("device") ? (row.keys?.[dimensions.indexOf("device")] || "") : "",
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
      date: new Date(endDate),
    }));
  } catch (error) {
    console.error("Failed to fetch search performance:", error);
    throw error;
  }
}

/**
 * Fetch index coverage data
 */
export async function fetchIndexCoverage(
  accessToken: string,
  siteUrl: string
): Promise<IndexCoverageData[]> {
  try {
    const auth = getAuthClient(accessToken);
    
    // Note: Index coverage API requires specific permissions
    // This is a simplified implementation
    const response = await searchconsole.urlInspection.index.inspect({
      auth,
      requestBody: {
        inspectionUrl: siteUrl,
        siteUrl,
      },
    });

    const result = response.data.inspectionResult;
    
    return [{
      type: "coverage",
      status: result?.indexStatusResult?.verdict || "unknown",
      count: 1,
      examples: [result?.indexStatusResult?.coverageState || ""],
    }];
  } catch (error) {
    console.error("Failed to fetch index coverage:", error);
    return [];
  }
}

/**
 * Inspect a specific URL
 */
export async function inspectUrl(
  accessToken: string,
  siteUrl: string,
  inspectionUrl: string
): Promise<{
  isIndexed: boolean;
  indexStatus: string;
  lastCrawled: string | null;
  crawlable: boolean;
  mobileUsability: string;
  richResults: string[];
}> {
  try {
    const auth = getAuthClient(accessToken);
    
    const response = await searchconsole.urlInspection.index.inspect({
      auth,
      requestBody: {
        inspectionUrl,
        siteUrl,
      },
    });

    const result = response.data.inspectionResult;
    const indexResult = result?.indexStatusResult;
    const mobileResult = result?.mobileUsabilityResult;
    const richResultsResult = result?.richResultsResult;

    return {
      isIndexed: indexResult?.verdict === "PASS",
      indexStatus: indexResult?.coverageState || "unknown",
      lastCrawled: indexResult?.lastCrawlTime || null,
      crawlable: indexResult?.robotsTxtState === "ALLOWED",
      mobileUsability: mobileResult?.verdict || "unknown",
      richResults: richResultsResult?.detectedItems?.map((item) => item.richResultType || "") || [],
    };
  } catch (error) {
    console.error("Failed to inspect URL:", error);
    throw error;
  }
}

/**
 * Get list of verified sites
 */
export async function getVerifiedSites(accessToken: string): Promise<Array<{
  siteUrl: string;
  permissionLevel: string;
}>> {
  try {
    const auth = getAuthClient(accessToken);
    
    const response = await searchconsole.sites.list({ auth });
    
    return (response.data.siteEntry || []).map((site) => ({
      siteUrl: site.siteUrl || "",
      permissionLevel: site.permissionLevel || "unknown",
    }));
  } catch (error) {
    console.error("Failed to get verified sites:", error);
    return [];
  }
}

/**
 * Get sitemaps for a site
 */
export async function getSitemaps(
  accessToken: string,
  siteUrl: string
): Promise<Array<{
  path: string;
  type: string;
  lastSubmitted: string | null;
  lastDownloaded: string | null;
  isPending: boolean;
  warnings: number;
  errors: number;
}>> {
  try {
    const auth = getAuthClient(accessToken);
    
    const response = await searchconsole.sitemaps.list({
      auth,
      siteUrl,
    });
    
    return (response.data.sitemap || []).map((sitemap) => ({
      path: sitemap.path || "",
      type: sitemap.type || "unknown",
      lastSubmitted: sitemap.lastSubmitted || null,
      lastDownloaded: sitemap.lastDownloaded || null,
      isPending: sitemap.isPending || false,
      warnings: sitemap.warnings ? Number(sitemap.warnings) : 0,
      errors: sitemap.errors ? Number(sitemap.errors) : 0,
    }));
  } catch (error) {
    console.error("Failed to get sitemaps:", error);
    return [];
  }
}

/**
 * Submit a sitemap
 */
export async function submitSitemap(
  accessToken: string,
  siteUrl: string,
  sitemapPath: string
): Promise<boolean> {
  try {
    const auth = getAuthClient(accessToken);
    
    await searchconsole.sitemaps.submit({
      auth,
      siteUrl,
      feedpath: sitemapPath,
    });
    
    return true;
  } catch (error) {
    console.error("Failed to submit sitemap:", error);
    return false;
  }
}

/**
 * Sync search console data to database
 */
export async function syncSearchConsoleData(
  accessToken: string,
  siteUrl: string,
  projectId?: string,
  userId?: string,
  daysBack: number = 28
): Promise<{
  synced: number;
  totals: SearchPerformanceMetrics;
}> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  console.log(`🔄 Syncing Search Console data for ${siteUrl} (${startStr} to ${endStr})`);

  const data = await fetchSearchPerformance(accessToken, siteUrl, startStr, endStr);
  
  let synced = 0;
  const totals = { clicks: 0, impressions: 0, ctr: 0, position: 0 };

  for (const row of data) {
    try {
      await db.insert(searchConsoleData).values({
        projectId,
        userId,
        siteUrl,
        query: row.query,
        page: row.page,
        country: row.country,
        device: row.device,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr.toFixed(4),
        position: row.position.toFixed(2),
        dataDate: row.date,
      });
      
      synced++;
      totals.clicks += row.clicks;
      totals.impressions += row.impressions;
    } catch (error) {
      // Handle duplicates silently
    }
  }

  totals.ctr = totals.impressions > 0 ? totals.clicks / totals.impressions : 0;
  totals.position = data.length > 0
    ? data.reduce((sum, r) => sum + r.position, 0) / data.length
    : 0;

  console.log(`✅ Synced ${synced} search console records`);

  return { synced, totals };
}

/**
 * Get search console dashboard data
 */
export async function getSearchConsoleDashboard(
  siteUrl: string,
  userId?: string,
  daysBack: number = 28
): Promise<{
  totals: SearchPerformanceMetrics;
  topQueries: Array<{ query: string; clicks: number; impressions: number; ctr: number; position: number }>;
  topPages: Array<{ page: string; clicks: number; impressions: number; ctr: number; position: number }>;
  deviceBreakdown: Record<string, SearchPerformanceMetrics>;
  countryBreakdown: Array<{ country: string; clicks: number }>;
  trend: Array<{ date: string; clicks: number; impressions: number }>;
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const conditions = [
    eq(searchConsoleData.siteUrl, siteUrl),
    gte(searchConsoleData.dataDate, startDate),
  ];

  if (userId) {
    conditions.push(eq(searchConsoleData.userId, userId));
  }

  const data = await db
    .select()
    .from(searchConsoleData)
    .where(and(...conditions))
    .orderBy(desc(searchConsoleData.dataDate));

  // Calculate totals
  const totals = {
    clicks: data.reduce((sum, r) => sum + (r.clicks || 0), 0),
    impressions: data.reduce((sum, r) => sum + (r.impressions || 0), 0),
    ctr: 0,
    position: 0,
  };
  totals.ctr = totals.impressions > 0 ? totals.clicks / totals.impressions : 0;
  totals.position = data.length > 0
    ? data.reduce((sum, r) => sum + Number(r.position || 0), 0) / data.length
    : 0;

  // Top queries
  const queryMap = new Map<string, { clicks: number; impressions: number; positionSum: number; count: number }>();
  for (const row of data) {
    if (!row.query) continue;
    const existing = queryMap.get(row.query) || { clicks: 0, impressions: 0, positionSum: 0, count: 0 };
    existing.clicks += row.clicks || 0;
    existing.impressions += row.impressions || 0;
    existing.positionSum += Number(row.position || 0);
    existing.count++;
    queryMap.set(row.query, existing);
  }
  const topQueries = Array.from(queryMap.entries())
    .map(([query, stats]) => ({
      query,
      clicks: stats.clicks,
      impressions: stats.impressions,
      ctr: stats.impressions > 0 ? stats.clicks / stats.impressions : 0,
      position: stats.count > 0 ? stats.positionSum / stats.count : 0,
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 20);

  // Top pages
  const pageMap = new Map<string, { clicks: number; impressions: number; positionSum: number; count: number }>();
  for (const row of data) {
    if (!row.page) continue;
    const existing = pageMap.get(row.page) || { clicks: 0, impressions: 0, positionSum: 0, count: 0 };
    existing.clicks += row.clicks || 0;
    existing.impressions += row.impressions || 0;
    existing.positionSum += Number(row.position || 0);
    existing.count++;
    pageMap.set(row.page, existing);
  }
  const topPages = Array.from(pageMap.entries())
    .map(([page, stats]) => ({
      page,
      clicks: stats.clicks,
      impressions: stats.impressions,
      ctr: stats.impressions > 0 ? stats.clicks / stats.impressions : 0,
      position: stats.count > 0 ? stats.positionSum / stats.count : 0,
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 20);

  // Device breakdown
  const deviceBreakdown: Record<string, SearchPerformanceMetrics> = {};
  for (const row of data) {
    const device = row.device || "unknown";
    if (!deviceBreakdown[device]) {
      deviceBreakdown[device] = { clicks: 0, impressions: 0, ctr: 0, position: 0 };
    }
    deviceBreakdown[device].clicks += row.clicks || 0;
    deviceBreakdown[device].impressions += row.impressions || 0;
  }
  for (const device of Object.keys(deviceBreakdown)) {
    const d = deviceBreakdown[device];
    d.ctr = d.impressions > 0 ? d.clicks / d.impressions : 0;
  }

  // Country breakdown
  const countryMap = new Map<string, number>();
  for (const row of data) {
    const country = row.country || "unknown";
    countryMap.set(country, (countryMap.get(country) || 0) + (row.clicks || 0));
  }
  const countryBreakdown = Array.from(countryMap.entries())
    .map(([country, clicks]) => ({ country, clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  // Daily trend
  const trendMap = new Map<string, { clicks: number; impressions: number }>();
  for (const row of data) {
    if (!row.dataDate) continue;
    const dateStr = row.dataDate.toISOString().split("T")[0];
    const existing = trendMap.get(dateStr) || { clicks: 0, impressions: 0 };
    existing.clicks += row.clicks || 0;
    existing.impressions += row.impressions || 0;
    trendMap.set(dateStr, existing);
  }
  const trend = Array.from(trendMap.entries())
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totals,
    topQueries,
    topPages,
    deviceBreakdown,
    countryBreakdown,
    trend,
  };
}

/**
 * Get query position changes
 */
export async function getQueryPositionChanges(
  siteUrl: string,
  userId?: string
): Promise<Array<{
  query: string;
  currentPosition: number;
  previousPosition: number;
  change: number;
  direction: "up" | "down" | "stable";
}>> {
  // Compare last 7 days vs previous 7 days
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const conditions = [eq(searchConsoleData.siteUrl, siteUrl)];
  if (userId) {
    conditions.push(eq(searchConsoleData.userId, userId));
  }

  // Get current period
  const currentData = await db
    .select()
    .from(searchConsoleData)
    .where(and(
      ...conditions,
      gte(searchConsoleData.dataDate, sevenDaysAgo)
    ));

  // Get previous period
  const previousData = await db
    .select()
    .from(searchConsoleData)
    .where(and(
      ...conditions,
      gte(searchConsoleData.dataDate, fourteenDaysAgo),
      lte(searchConsoleData.dataDate, sevenDaysAgo)
    ));

  // Aggregate by query
  const currentPositions = new Map<string, { sum: number; count: number }>();
  for (const row of currentData) {
    if (!row.query) continue;
    const existing = currentPositions.get(row.query) || { sum: 0, count: 0 };
    existing.sum += Number(row.position || 0);
    existing.count++;
    currentPositions.set(row.query, existing);
  }

  const previousPositions = new Map<string, { sum: number; count: number }>();
  for (const row of previousData) {
    if (!row.query) continue;
    const existing = previousPositions.get(row.query) || { sum: 0, count: 0 };
    existing.sum += Number(row.position || 0);
    existing.count++;
    previousPositions.set(row.query, existing);
  }

  // Calculate changes
  const changes = [];
  for (const [query, current] of currentPositions) {
    const previous = previousPositions.get(query);
    const currentPos = current.count > 0 ? current.sum / current.count : 0;
    const previousPos = previous && previous.count > 0 ? previous.sum / previous.count : currentPos;
    const change = previousPos - currentPos; // Positive = improvement (lower position is better)

    changes.push({
      query,
      currentPosition: Math.round(currentPos * 10) / 10,
      previousPosition: Math.round(previousPos * 10) / 10,
      change: Math.round(change * 10) / 10,
      direction: change > 0.5 ? "up" as const : change < -0.5 ? "down" as const : "stable" as const,
    });
  }

  return changes
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 50);
}

export default {
  fetchSearchPerformance,
  fetchIndexCoverage,
  inspectUrl,
  getVerifiedSites,
  getSitemaps,
  submitSitemap,
  syncSearchConsoleData,
  getSearchConsoleDashboard,
  getQueryPositionChanges,
};
