/**
 * INDEXING SCHEDULER
 * 
 * Automatically schedules URL submission to search engines on server startup
 * and at regular intervals. This ensures all content gets indexed.
 * 
 * Features:
 * - Startup backfill of all sitemap URLs
 * - Regular queue processing (every 5 minutes)
 * - Daily full sitemap re-submission
 * - IndexNow for real-time content updates
 * - Google Indexing API for priority URLs
 */

import { 
  addToQueue, 
  processQueue, 
  submitFromSitemap,
  submitToIndexNow,
  submitToGoogle,
  getQueueStatus,
  getSubmissionHistory,
} from './auto-indexing';

const BASE_URL = 'https://washbizhub.com';

// Scheduler intervals
const QUEUE_PROCESS_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const DAILY_BACKFILL_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const HEALTH_CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

// Scheduler state
let isSchedulerRunning = false;
let queueProcessorInterval: NodeJS.Timeout | null = null;
let dailyBackfillInterval: NodeJS.Timeout | null = null;
let healthCheckInterval: NodeJS.Timeout | null = null;
let lastBackfillTime: Date | null = null;
let lastQueueProcessTime: Date | null = null;

// Indexing health metrics
interface IndexingHealth {
  schedulerRunning: boolean;
  lastBackfillTime: Date | null;
  lastQueueProcessTime: Date | null;
  totalUrlsSubmitted: number;
  failedSubmissions: number;
  queueLength: number;
  recentSubmissions: number;
}

let healthMetrics: IndexingHealth = {
  schedulerRunning: false,
  lastBackfillTime: null,
  lastQueueProcessTime: null,
  totalUrlsSubmitted: 0,
  failedSubmissions: 0,
  queueLength: 0,
  recentSubmissions: 0,
};

/**
 * Get priority URLs that should always be indexed first
 * These are high-value pages that drive the most traffic
 */
function getPriorityUrls(): string[] {
  return [
    `${BASE_URL}/`,
    `${BASE_URL}/pricing`,
    `${BASE_URL}/cleanbi-explorer`,
    `${BASE_URL}/cleanbi-auto`,
    `${BASE_URL}/calculators`,
    `${BASE_URL}/laundromat-listings`,
    `${BASE_URL}/buy-laundromat`,
    `${BASE_URL}/marketplace`,
    `${BASE_URL}/blog`,
    `${BASE_URL}/error-codes`,
    `${BASE_URL}/funding`,
    `${BASE_URL}/consultation`,
    `${BASE_URL}/service-guy-ai`,
    `${BASE_URL}/equipment-marketplace`,
    `${BASE_URL}/brokers`,
    `${BASE_URL}/laundromats-for-sale`,
    `${BASE_URL}/laundromat-valuation`,
    `${BASE_URL}/laundromat-for-sale`,
    `${BASE_URL}/how-to-start-laundromat`,
  ];
}

/**
 * Submit priority URLs to Google Indexing API
 * These are our most important pages that need immediate indexing
 */
async function submitPriorityToGoogle(): Promise<{ succeeded: number; failed: number }> {
  const priorityUrls = getPriorityUrls();
  let succeeded = 0;
  let failed = 0;
  
  console.log(`\n🎯 Submitting ${priorityUrls.length} priority URLs to Google Indexing API...\n`);
  
  for (const url of priorityUrls) {
    try {
      const result = await submitToGoogle(url);
      if (result.success) {
        succeeded++;
      } else {
        failed++;
        console.log(`⚠️ Google indexing failed for ${url}: ${result.message}`);
      }
      // Rate limit: 200 requests per minute for Google Indexing API
      await new Promise(resolve => setTimeout(resolve, 350));
    } catch (error) {
      failed++;
      console.error(`❌ Error submitting to Google: ${url}`, error);
    }
  }
  
  console.log(`✅ Google priority submission complete: ${succeeded} succeeded, ${failed} failed`);
  
  return { succeeded, failed };
}

/**
 * Perform full sitemap backfill via IndexNow
 * Submits all URLs from sitemap to search engines
 */
async function performSitemapBackfill(): Promise<void> {
  console.log('\n📊 Starting full sitemap backfill...\n');
  
  try {
    const sitemapUrl = `${BASE_URL}/sitemap.xml`;
    const result = await submitFromSitemap(sitemapUrl, { skipDeduplication: false });
    
    healthMetrics.totalUrlsSubmitted += result.succeeded;
    healthMetrics.failedSubmissions += result.failed;
    lastBackfillTime = new Date();
    healthMetrics.lastBackfillTime = lastBackfillTime;
    
    console.log(`\n✨ Sitemap backfill complete:`);
    console.log(`   Total URLs: ${result.total}`);
    console.log(`   Succeeded: ${result.succeeded}`);
    console.log(`   Failed: ${result.failed}`);
    console.log(`   Deduplicated: ${result.deduplicated}\n`);
  } catch (error) {
    console.error('❌ Sitemap backfill failed:', error);
  }
}

/**
 * Process the indexing queue
 * Runs periodically to submit queued URLs
 */
async function runQueueProcessor(): Promise<void> {
  try {
    const stats = getQueueStatus();
    if (stats.queueLength === 0) {
      return; // Nothing to process
    }
    
    console.log(`\n📤 Processing indexing queue (${stats.queueLength} URLs)...\n`);
    
    const result = await processQueue();
    
    healthMetrics.totalUrlsSubmitted += result.succeeded;
    healthMetrics.failedSubmissions += result.failed;
    healthMetrics.queueLength = result.remaining;
    lastQueueProcessTime = new Date();
    healthMetrics.lastQueueProcessTime = lastQueueProcessTime;
    
    if (result.processed > 0) {
      console.log(`✅ Queue processed: ${result.succeeded} succeeded, ${result.failed} failed`);
    }
  } catch (error) {
    console.error('❌ Queue processing error:', error);
  }
}

/**
 * Run health check and update metrics
 */
function runHealthCheck(): void {
  const stats = getQueueStatus();
  const recent = getSubmissionHistory();
  
  healthMetrics.queueLength = stats.queueLength;
  healthMetrics.recentSubmissions = recent.length;
  healthMetrics.schedulerRunning = isSchedulerRunning;
  
  // Log health status periodically
  console.log(`\n📊 Indexing Health Check:`);
  console.log(`   Scheduler Running: ${healthMetrics.schedulerRunning}`);
  console.log(`   Queue Length: ${healthMetrics.queueLength}`);
  console.log(`   Total Submitted: ${healthMetrics.totalUrlsSubmitted}`);
  console.log(`   Failed: ${healthMetrics.failedSubmissions}`);
  console.log(`   Last Backfill: ${healthMetrics.lastBackfillTime?.toISOString() || 'Never'}`);
  console.log(`   Last Queue Process: ${healthMetrics.lastQueueProcessTime?.toISOString() || 'Never'}\n`);
}

/**
 * Start the indexing scheduler
 * Should be called once on server startup
 */
export async function startIndexingScheduler(): Promise<void> {
  if (isSchedulerRunning) {
    console.log('⚠️ Indexing scheduler already running');
    return;
  }
  
  console.log('\n🚀 Starting Indexing Scheduler...\n');
  isSchedulerRunning = true;
  healthMetrics.schedulerRunning = true;
  
  // Initial priority submission to Google (most important URLs)
  try {
    await submitPriorityToGoogle();
  } catch (error) {
    console.error('⚠️ Priority Google submission failed (will retry):', error);
  }
  
  // Initial full sitemap backfill (runs once on startup)
  // Delay by 30 seconds to let server fully initialize
  setTimeout(async () => {
    try {
      await performSitemapBackfill();
    } catch (error) {
      console.error('⚠️ Initial backfill failed (will retry daily):', error);
    }
  }, 30 * 1000);
  
  // Schedule queue processor to run every 5 minutes
  queueProcessorInterval = setInterval(async () => {
    await runQueueProcessor();
  }, QUEUE_PROCESS_INTERVAL_MS);
  
  // Schedule daily full sitemap backfill
  dailyBackfillInterval = setInterval(async () => {
    console.log('\n🔄 Running daily sitemap backfill...\n');
    await performSitemapBackfill();
  }, DAILY_BACKFILL_INTERVAL_MS);
  
  // Schedule hourly health check
  healthCheckInterval = setInterval(() => {
    runHealthCheck();
  }, HEALTH_CHECK_INTERVAL_MS);
  
  console.log('✅ Indexing Scheduler started successfully');
  console.log(`   Queue processor: every ${QUEUE_PROCESS_INTERVAL_MS / 60000} minutes`);
  console.log(`   Daily backfill: every ${DAILY_BACKFILL_INTERVAL_MS / 3600000} hours`);
  console.log(`   Health check: every ${HEALTH_CHECK_INTERVAL_MS / 60000} minutes\n`);
}

/**
 * Stop the indexing scheduler
 */
export function stopIndexingScheduler(): void {
  if (!isSchedulerRunning) {
    console.log('⚠️ Indexing scheduler not running');
    return;
  }
  
  if (queueProcessorInterval) {
    clearInterval(queueProcessorInterval);
    queueProcessorInterval = null;
  }
  
  if (dailyBackfillInterval) {
    clearInterval(dailyBackfillInterval);
    dailyBackfillInterval = null;
  }
  
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }
  
  isSchedulerRunning = false;
  healthMetrics.schedulerRunning = false;
  
  console.log('🛑 Indexing Scheduler stopped');
}

/**
 * Get current indexing health metrics
 */
export function getIndexingHealth(): IndexingHealth {
  const stats = getQueueStatus();
  const recent = getSubmissionHistory();
  
  return {
    ...healthMetrics,
    queueLength: stats.queueLength,
    recentSubmissions: recent.length,
  };
}

/**
 * Trigger immediate backfill (for admin use)
 */
export async function triggerImmediateBackfill(): Promise<{
  success: boolean;
  message: string;
  stats?: { total: number; succeeded: number; failed: number };
}> {
  try {
    console.log('\n⚡ Triggering immediate backfill...\n');
    
    const sitemapUrl = `${BASE_URL}/sitemap.xml`;
    const result = await submitFromSitemap(sitemapUrl, { skipDeduplication: true });
    
    healthMetrics.totalUrlsSubmitted += result.succeeded;
    healthMetrics.failedSubmissions += result.failed;
    lastBackfillTime = new Date();
    healthMetrics.lastBackfillTime = lastBackfillTime;
    
    return {
      success: true,
      message: `Backfill complete: ${result.succeeded} succeeded, ${result.failed} failed`,
      stats: {
        total: result.total,
        succeeded: result.succeeded,
        failed: result.failed,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Backfill failed: ${message}`,
    };
  }
}

/**
 * Queue new content for indexing
 * Call this when new content is created/updated
 */
export function queueContentForIndexing(urls: string[], priority: number = 0): {
  added: number;
  skipped: number;
  queueLength: number;
} {
  return addToQueue(urls, priority);
}

/**
 * Submit new content immediately via IndexNow
 * For high-priority new content that needs instant indexing
 */
export async function submitNewContent(urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  
  console.log(`\n⚡ Submitting ${urls.length} new URLs for instant indexing...\n`);
  await submitToIndexNow(urls);
  
  healthMetrics.totalUrlsSubmitted += urls.length;
}
