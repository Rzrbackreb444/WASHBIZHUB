/**
 * CONTENT INDEXING HOOKS
 * 
 * Automatic IndexNow submission when content is created or updated.
 * Uses fire-and-forget pattern to avoid blocking API responses.
 * 
 * Features:
 * - Blog post indexing on create/update
 * - Listing indexing on create/update
 * - Resource indexing on create/update
 * - Batch submission with rate limiting
 * - Comprehensive logging
 */

import { submitViaIndexNow } from "./auto-indexing";

const BASE_URL = process.env.REPLIT_DEV_DOMAIN 
  ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
  : "https://washbizhub.com";

interface IndexingResult {
  url: string;
  success: boolean;
  message: string;
  timestamp: Date;
}

const indexingLog: IndexingResult[] = [];
const MAX_LOG_SIZE = 1000;

const pendingBatch: string[] = [];
let batchTimeout: NodeJS.Timeout | null = null;
const BATCH_DELAY_MS = 5000;
const MAX_BATCH_SIZE = 10;

/**
 * Add result to indexing log with size limit
 */
function logIndexingResult(result: IndexingResult): void {
  indexingLog.unshift(result);
  if (indexingLog.length > MAX_LOG_SIZE) {
    indexingLog.pop();
  }
}

/**
 * Get recent indexing log entries
 */
export function getIndexingLog(limit: number = 100): IndexingResult[] {
  return indexingLog.slice(0, limit);
}

/**
 * Process pending batch of URLs
 */
async function processBatch(): Promise<void> {
  if (pendingBatch.length === 0) return;

  const apiKey = process.env.INDEXNOW_API_KEY;
  if (!apiKey) {
    console.log("⚠️ INDEXNOW_API_KEY not configured - skipping batch submission");
    pendingBatch.length = 0;
    return;
  }

  const urlsToSubmit = pendingBatch.splice(0, MAX_BATCH_SIZE);
  console.log(`📤 Processing IndexNow batch: ${urlsToSubmit.length} URLs`);

  for (const url of urlsToSubmit) {
    try {
      const result = await submitViaIndexNow(url, apiKey);
      const indexResult: IndexingResult = {
        url,
        success: result.success,
        message: result.message,
        timestamp: new Date(),
      };
      logIndexingResult(indexResult);

      if (result.success) {
        console.log(`✅ IndexNow submitted: ${url}`);
      } else {
        console.log(`❌ IndexNow failed: ${url} - ${result.message}`);
      }

      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      logIndexingResult({
        url,
        success: false,
        message: errorMsg,
        timestamp: new Date(),
      });
      console.error(`❌ IndexNow error for ${url}:`, errorMsg);
    }
  }

  if (pendingBatch.length > 0) {
    batchTimeout = setTimeout(processBatch, BATCH_DELAY_MS);
  } else {
    batchTimeout = null;
  }
}

/**
 * Queue URL for batch submission
 */
function queueForIndexing(url: string): void {
  if (!pendingBatch.includes(url)) {
    pendingBatch.push(url);
    console.log(`📋 Queued for IndexNow: ${url} (batch size: ${pendingBatch.length})`);
  }

  if (!batchTimeout) {
    batchTimeout = setTimeout(processBatch, BATCH_DELAY_MS);
  }

  if (pendingBatch.length >= MAX_BATCH_SIZE && batchTimeout) {
    clearTimeout(batchTimeout);
    processBatch();
  }
}

/**
 * Submit URL immediately (fire-and-forget)
 */
async function submitImmediate(url: string): Promise<void> {
  const apiKey = process.env.INDEXNOW_API_KEY;
  if (!apiKey) {
    console.log(`⚠️ INDEXNOW_API_KEY not configured - skipping: ${url}`);
    return;
  }

  try {
    console.log(`📤 Submitting to IndexNow: ${url}`);
    const result = await submitViaIndexNow(url, apiKey);
    
    logIndexingResult({
      url,
      success: result.success,
      message: result.message,
      timestamp: new Date(),
    });

    if (result.success) {
      console.log(`✅ IndexNow submitted successfully: ${url}`);
    } else {
      console.log(`❌ IndexNow submission failed: ${url} - ${result.message}`);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    logIndexingResult({
      url,
      success: false,
      message: errorMsg,
      timestamp: new Date(),
    });
    console.error(`❌ IndexNow error for ${url}:`, errorMsg);
  }
}

/**
 * Trigger IndexNow submission when a blog post is created or updated
 * Uses fire-and-forget pattern - does not block the response
 */
export function triggerBlogIndexing(
  blogId: string | number,
  slug?: string,
  options: { immediate?: boolean } = {}
): void {
  const url = slug 
    ? `${BASE_URL}/blog/${slug}`
    : `${BASE_URL}/blog/${blogId}`;

  console.log(`📰 Blog indexing triggered: ${url}`);

  if (options.immediate) {
    submitImmediate(url).catch(err => {
      console.error("Blog indexing error:", err);
    });
  } else {
    queueForIndexing(url);
  }
}

/**
 * Trigger IndexNow submission when a listing is created or updated
 * Uses fire-and-forget pattern - does not block the response
 */
export function triggerListingIndexing(
  listingId: string | number,
  slug?: string,
  options: { immediate?: boolean } = {}
): void {
  const url = slug
    ? `${BASE_URL}/listings/${slug}`
    : `${BASE_URL}/listings/${listingId}`;

  console.log(`🏢 Listing indexing triggered: ${url}`);

  if (options.immediate) {
    submitImmediate(url).catch(err => {
      console.error("Listing indexing error:", err);
    });
  } else {
    queueForIndexing(url);
  }
}

/**
 * Trigger IndexNow submission when a resource is created or updated
 * Uses fire-and-forget pattern - does not block the response
 */
export function triggerResourceIndexing(
  resourceId: string | number,
  slug?: string,
  options: { immediate?: boolean } = {}
): void {
  const url = slug
    ? `${BASE_URL}/resources/${slug}`
    : `${BASE_URL}/resources/${resourceId}`;

  console.log(`📚 Resource indexing triggered: ${url}`);

  if (options.immediate) {
    submitImmediate(url).catch(err => {
      console.error("Resource indexing error:", err);
    });
  } else {
    queueForIndexing(url);
  }
}

/**
 * Trigger IndexNow submission for any custom URL
 * Uses fire-and-forget pattern - does not block the response
 */
export function triggerCustomIndexing(
  path: string,
  options: { immediate?: boolean } = {}
): void {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

  console.log(`🔗 Custom indexing triggered: ${url}`);

  if (options.immediate) {
    submitImmediate(url).catch(err => {
      console.error("Custom indexing error:", err);
    });
  } else {
    queueForIndexing(url);
  }
}

/**
 * Submit multiple URLs in batch
 * Useful for bulk operations
 */
export function triggerBatchIndexing(urls: string[]): void {
  console.log(`📦 Batch indexing triggered: ${urls.length} URLs`);
  
  for (const url of urls) {
    const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
    queueForIndexing(fullUrl);
  }
}

/**
 * Get current pending batch size
 */
export function getPendingBatchSize(): number {
  return pendingBatch.length;
}

/**
 * Force process pending batch immediately
 */
export async function flushPendingBatch(): Promise<void> {
  if (batchTimeout) {
    clearTimeout(batchTimeout);
    batchTimeout = null;
  }
  await processBatch();
}
