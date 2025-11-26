/**
 * AUTO-INDEX TRIGGER SYSTEM
 * 
 * Automatically submits new/updated content to all search engines:
 * - Google (via Indexing API)
 * - Bing, Yahoo, Yandex, DuckDuckGo (via IndexNow)
 * 
 * Triggers on:
 * - New blog post creation
 * - Blog post updates
 * - New listing creation
 * - Listing updates
 * - New page creation
 */

import { submitToGoogle, submitViaIndexNow } from './auto-indexing';

const BASE_URL = process.env.VITE_BASE_URL || 'https://washbizhub.com';
const INDEXNOW_API_KEY = process.env.INDEXNOW_API_KEY;

interface IndexResult {
  url: string;
  google: { success: boolean; message: string };
  indexNow: { success: boolean; message: string };
}

/**
 * Submit a single URL to all search engines
 */
export async function indexUrl(path: string): Promise<IndexResult> {
  const url = `${BASE_URL}${path}`;
  
  console.log(`🔍 Auto-indexing: ${url}`);
  
  // Submit to Google
  const googleResult = await submitToGoogle(url);
  
  // Submit via IndexNow (Bing, Yahoo, Yandex, DuckDuckGo)
  let indexNowResult = { success: false, message: 'IndexNow API key not configured' };
  if (INDEXNOW_API_KEY) {
    indexNowResult = await submitViaIndexNow(url, INDEXNOW_API_KEY);
  }
  
  const result: IndexResult = {
    url,
    google: googleResult,
    indexNow: indexNowResult,
  };
  
  if (googleResult.success || indexNowResult.success) {
    console.log(`✅ Successfully submitted to search engines: ${url}`);
  } else {
    console.log(`⚠️ Indexing had issues for: ${url}`);
  }
  
  return result;
}

/**
 * Submit multiple URLs to all search engines
 */
export async function indexUrls(paths: string[]): Promise<IndexResult[]> {
  const results: IndexResult[] = [];
  
  // Process in batches of 10 to avoid rate limits
  const BATCH_SIZE = 10;
  for (let i = 0; i < paths.length; i += BATCH_SIZE) {
    const batch = paths.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map(path => indexUrl(path)));
    results.push(...batchResults);
    
    // Small delay between batches
    if (i + BATCH_SIZE < paths.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

/**
 * Auto-index a new blog post
 */
export async function indexBlogPost(slug: string): Promise<IndexResult> {
  return indexUrl(`/blog/${slug}`);
}

/**
 * Auto-index a new listing
 */
export async function indexListing(id: number | string): Promise<IndexResult> {
  return indexUrl(`/listing/${id}`);
}

/**
 * Auto-index a core page
 */
export async function indexPage(path: string): Promise<IndexResult> {
  return indexUrl(path);
}

/**
 * Batch index all CLEANBI blogs
 */
export async function indexAllCleanbiBlogs(): Promise<{ total: number; results: IndexResult[] }> {
  // This would be called to index all the 320 CLEANBI blogs
  const { db } = await import('./db');
  const { blogPosts } = await import('@shared/schema');
  const { eq, like } = await import('drizzle-orm');
  
  const blogs = await db.select({ slug: blogPosts.slug })
    .from(blogPosts)
    .where(like(blogPosts.slug, '%cleanbi%'));
  
  const paths = blogs.map(b => `/blog/${b.slug}`);
  const results = await indexUrls(paths);
  
  return {
    total: results.length,
    results,
  };
}

/**
 * Batch index all core pages
 */
export async function indexAllCorePages(): Promise<{ total: number; results: IndexResult[] }> {
  const corePages = [
    '/',
    '/cleanbi-auto',
    '/cleanbi',
    '/marketplace',
    '/superstore',
    '/courses',
    '/book',
    '/resources',
    '/tools',
    '/calculator',
    '/roi-calculator',
    '/calculators',
    '/funding-matcher',
    '/vendors',
    '/blog',
    '/templates',
    '/design-studio',
    '/website-builder',
    '/pricing',
    '/about',
    '/contact',
    '/faq',
  ];
  
  const results = await indexUrls(corePages);
  
  return {
    total: results.length,
    results,
  };
}

/**
 * Full site re-index (use sparingly)
 */
export async function reindexEntireSite(): Promise<{
  corePages: number;
  blogs: number;
  listings: number;
  total: number;
}> {
  console.log('🚀 Starting full site re-index...');
  
  // Index core pages
  const coreResult = await indexAllCorePages();
  console.log(`✅ Indexed ${coreResult.total} core pages`);
  
  // Index all blogs
  const { db } = await import('./db');
  const { blogPosts, listings } = await import('@shared/schema');
  const { eq } = await import('drizzle-orm');
  
  const blogs = await db.select({ slug: blogPosts.slug })
    .from(blogPosts)
    .where(eq(blogPosts.published, true));
  
  const blogPaths = blogs.map(b => `/blog/${b.slug}`);
  const blogResults = await indexUrls(blogPaths);
  console.log(`✅ Indexed ${blogResults.length} blogs`);
  
  // Index all active listings
  const allListings = await db.select({ id: listings.id })
    .from(listings)
    .where(eq(listings.status, 'active'));
  
  const listingPaths = allListings.map(l => `/listing/${l.id}`);
  const listingResults = await indexUrls(listingPaths);
  console.log(`✅ Indexed ${listingResults.length} listings`);
  
  const total = coreResult.total + blogResults.length + listingResults.length;
  console.log(`🎉 Full site re-index complete: ${total} URLs submitted`);
  
  return {
    corePages: coreResult.total,
    blogs: blogResults.length,
    listings: listingResults.length,
    total,
  };
}
