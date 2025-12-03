/**
 * VISIBILITY AUTOMATION ENGINE
 * 
 * Automatically fulfills visibility add-on orders after payment:
 * - Auto-blog generation for listings
 * - IndexNow submission
 * - Google Indexing API submission
 * - Social cards generation
 */

import { db } from "./db";
import { visibilityJobs, visibilityOrders, listings, blogPosts } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface ListingData {
  id: string;
  title: string;
  description: string | null;
  city: string | null;
  state: string | null;
  price: string | null;
  brokerName: string | null;
}

// ==================== AUTO-BLOG GENERATION ====================

interface GeneratedBlog {
  title: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
}

export async function generateListingBlog(listing: ListingData): Promise<GeneratedBlog> {
  console.log(`📝 Generating auto-blog for listing: ${listing.title}`);
  
  const location = [listing.city, listing.state].filter(Boolean).join(', ') || 'this location';
  
  const prompt = `You are an expert real estate and laundromat industry writer. Write a compelling, SEO-optimized blog post promoting a laundromat listing for sale.

Listing Details:
- Title: ${listing.title}
- Location: ${location}
- Price: ${listing.price || 'Contact for pricing'}
- Description: ${listing.description || 'Premium laundromat opportunity'}

Write a 600-800 word blog post that:
1. Highlights the investment opportunity
2. Discusses the location benefits and market potential
3. Explains why laundromats are great investments
4. Includes a clear call-to-action to contact consult@washbizhub.com
5. Uses WashBizHub as the platform name
6. Mentions CLEANBI as the property analysis tool

Return ONLY valid JSON in this format:
{
  "title": "SEO-optimized blog title (50-60 chars)",
  "metaTitle": "Meta title for SEO (50-60 chars)",
  "metaDescription": "Compelling meta description (150-160 chars)",
  "excerpt": "Brief summary for preview cards (150 chars)",
  "content": "Full HTML content with h2, h3, p, ul, strong tags",
  "slug": "url-friendly-slug-with-dashes"
}`;

  try {
    // Try Anthropic first
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title,
        content: parsed.content,
        excerpt: parsed.excerpt,
        metaTitle: parsed.metaTitle,
        metaDescription: parsed.metaDescription,
        slug: parsed.slug || generateSlug(parsed.title),
      };
    }
    throw new Error('Could not parse Anthropic response');
  } catch (error) {
    console.log('Anthropic failed, falling back to Gemini...');
    
    // Fallback to Gemini
    const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title,
        content: parsed.content,
        excerpt: parsed.excerpt,
        metaTitle: parsed.metaTitle,
        metaDescription: parsed.metaDescription,
        slug: parsed.slug || generateSlug(parsed.title),
      };
    }
    throw new Error('Could not parse Gemini response');
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60);
}

// ==================== INDEXNOW SUBMISSION ====================

export async function submitToIndexNow(url: string): Promise<{ success: boolean; message: string }> {
  console.log(`🔍 Submitting to IndexNow: ${url}`);
  
  const indexNowKey = process.env.INDEXNOW_KEY || 'washbizhub-indexnow-key';
  const baseUrl = process.env.BASE_URL || 'https://washbizhub.com';
  
  try {
    // Submit to Bing/IndexNow
    const response = await fetch('https://www.bing.com/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: new URL(baseUrl).hostname,
        key: indexNowKey,
        keyLocation: `${baseUrl}/${indexNowKey}.txt`,
        urlList: [url]
      })
    });

    if (response.ok || response.status === 200 || response.status === 202) {
      console.log(`✅ IndexNow submission successful for: ${url}`);
      return { success: true, message: 'Submitted to IndexNow successfully' };
    } else {
      const errorText = await response.text();
      console.log(`⚠️ IndexNow response: ${response.status} - ${errorText}`);
      return { success: true, message: `IndexNow returned ${response.status}` };
    }
  } catch (error: any) {
    console.error(`❌ IndexNow error: ${error.message}`);
    return { success: false, message: error.message };
  }
}

// ==================== GOOGLE INDEXING API ====================

export async function submitToGoogleIndexing(url: string): Promise<{ success: boolean; message: string }> {
  console.log(`🔍 Submitting to Google Indexing API: ${url}`);
  
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  
  if (!serviceAccountJson) {
    console.log('⚠️ Google Service Account not configured');
    return { success: false, message: 'Google Service Account not configured' };
  }

  try {
    const credentials = JSON.parse(serviceAccountJson);
    let { client_email, private_key } = credentials;
    
    if (!client_email || !private_key) {
      return { success: false, message: 'Invalid service account credentials' };
    }
    
    // Normalize private key
    private_key = private_key.replace(/\\n/g, '\n');
    
    // Create JWT
    const jwt = require('jsonwebtoken');
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: client_email,
      scope: "https://www.googleapis.com/auth/indexing",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    };
    
    const token = jwt.sign(payload, private_key, { algorithm: 'RS256' });
    
    // Get access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: token
      })
    });
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    if (!accessToken) {
      return { success: false, message: 'Failed to get Google access token' };
    }
    
    // Submit to Indexing API
    const indexingResponse = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        url: url,
        type: "URL_UPDATED"
      })
    });
    
    if (indexingResponse.ok) {
      console.log(`✅ Google Indexing API submission successful for: ${url}`);
      return { success: true, message: 'Submitted to Google Indexing API' };
    } else {
      const errorData = await indexingResponse.json();
      console.log(`⚠️ Google Indexing API response:`, errorData);
      return { success: false, message: errorData.error?.message || 'Google API error' };
    }
  } catch (error: any) {
    console.error(`❌ Google Indexing error: ${error.message}`);
    return { success: false, message: error.message };
  }
}

// ==================== SOCIAL CARDS GENERATION ====================

interface SocialCardData {
  title: string;
  description: string;
  price: string;
  location: string;
  imageUrl?: string;
}

export async function generateSocialCards(listing: ListingData): Promise<{ success: boolean; cards: any }> {
  console.log(`🎨 Generating social cards for listing: ${listing.title}`);
  
  const location = [listing.city, listing.state].filter(Boolean).join(', ') || 'Premium Location';
  
  // Generate Open Graph and Twitter card data
  const socialCards = {
    openGraph: {
      title: listing.title,
      description: listing.description?.substring(0, 200) || 'Premium laundromat opportunity available on WashBizHub',
      type: 'website',
      url: `https://washbizhub.com/buy-laundromat/${listing.id}`,
      siteName: 'WashBizHub',
      locale: 'en_US',
      image: {
        url: `https://washbizhub.com/api/og-image/listing/${listing.id}`,
        width: 1200,
        height: 630,
        alt: listing.title,
      }
    },
    twitter: {
      card: 'summary_large_image',
      site: '@washbizhub',
      title: listing.title,
      description: listing.description?.substring(0, 200) || 'Premium laundromat opportunity',
      image: `https://washbizhub.com/api/og-image/listing/${listing.id}`,
    },
    structured: {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      name: listing.title,
      description: listing.description,
      price: listing.price,
      address: {
        "@type": "PostalAddress",
        addressLocality: listing.city,
        addressRegion: listing.state,
        addressCountry: "US"
      },
      url: `https://washbizhub.com/buy-laundromat/${listing.id}`,
      broker: listing.brokerName ? {
        "@type": "Organization",
        name: listing.brokerName
      } : undefined
    }
  };
  
  // Update listing with social card metadata
  try {
    await db.update(listings)
      .set({
        socialCardsGenerated: true,
        socialCardsData: JSON.stringify(socialCards),
      })
      .where(eq(listings.id, listing.id));
    
    console.log(`✅ Social cards generated for listing: ${listing.title}`);
    return { success: true, cards: socialCards };
  } catch (error: any) {
    console.error(`❌ Social cards error: ${error.message}`);
    return { success: false, cards: null };
  }
}

// ==================== JOB FULFILLMENT ENGINE ====================

export async function processVisibilityJob(jobId: string): Promise<{ success: boolean; result: any }> {
  console.log(`🔧 Processing visibility job: ${jobId}`);
  
  // Get job details
  const [job] = await db.select()
    .from(visibilityJobs)
    .where(eq(visibilityJobs.id, jobId))
    .limit(1);
  
  if (!job) {
    return { success: false, result: { error: 'Job not found' } };
  }
  
  if (job.status === 'completed') {
    return { success: true, result: { message: 'Job already completed' } };
  }
  
  // Mark job as processing
  await db.update(visibilityJobs)
    .set({ status: 'processing', startedAt: new Date() })
    .where(eq(visibilityJobs.id, jobId));
  
  // Get listing data
  const [listing] = await db.select()
    .from(listings)
    .where(eq(listings.id, job.listingId))
    .limit(1);
  
  if (!listing) {
    await db.update(visibilityJobs)
      .set({ status: 'failed', errorMessage: 'Listing not found' })
      .where(eq(visibilityJobs.id, jobId));
    return { success: false, result: { error: 'Listing not found' } };
  }
  
  const baseUrl = process.env.BASE_URL || 'https://washbizhub.com';
  const listingUrl = `${baseUrl}/buy-laundromat/${listing.id}`;
  
  let result: any = {};
  
  try {
    switch (job.jobType) {
      case 'carousel':
        // Carousel is handled immediately in webhook, just mark complete
        result = { message: 'Carousel feature already enabled' };
        break;
        
      case 'auto-blog':
        const blog = await generateListingBlog({
          id: listing.id,
          title: listing.title || 'Laundromat Listing',
          description: listing.description,
          city: listing.city,
          state: listing.state,
          price: listing.price,
          brokerName: listing.brokerName,
        });
        
        // Save blog post to database
        const [savedBlog] = await db.insert(blogPosts).values({
          title: blog.title,
          slug: blog.slug,
          content: blog.content,
          excerpt: blog.excerpt,
          metaTitle: blog.metaTitle,
          metaDescription: blog.metaDescription,
          category: 'listings',
          authorName: 'WashBizHub AI',
          published: true,
          tenantId: listing.tenantId,
          sourceListingId: listing.id,
        }).returning();
        
        result = { blogId: savedBlog?.id, slug: blog.slug, title: blog.title };
        
        // Also submit the blog post to IndexNow
        const blogUrl = `${baseUrl}/blog/${blog.slug}`;
        await submitToIndexNow(blogUrl);
        break;
        
      case 'index-now':
        result = await submitToIndexNow(listingUrl);
        break;
        
      case 'google-indexing':
        result = await submitToGoogleIndexing(listingUrl);
        break;
        
      case 'social-cards':
        result = await generateSocialCards({
          id: listing.id,
          title: listing.title || 'Laundromat Listing',
          description: listing.description,
          city: listing.city,
          state: listing.state,
          price: listing.price,
          brokerName: listing.brokerName,
        });
        break;
        
      default:
        result = { error: 'Unknown job type' };
    }
    
    // Mark job as completed
    await db.update(visibilityJobs)
      .set({ 
        status: 'completed', 
        completedAt: new Date(),
        resultData: JSON.stringify(result)
      })
      .where(eq(visibilityJobs.id, jobId));
    
    console.log(`✅ Visibility job ${job.jobType} completed for listing ${listing.id}`);
    return { success: true, result };
    
  } catch (error: any) {
    console.error(`❌ Visibility job failed: ${error.message}`);
    
    await db.update(visibilityJobs)
      .set({ 
        status: 'failed', 
        errorMessage: error.message,
        retryCount: (job.retryCount || 0) + 1
      })
      .where(eq(visibilityJobs.id, jobId));
    
    return { success: false, result: { error: error.message } };
  }
}

// Process all pending jobs for an order
export async function processOrderJobs(orderId: string): Promise<void> {
  console.log(`📋 Processing all jobs for order: ${orderId}`);
  
  const jobs = await db.select()
    .from(visibilityJobs)
    .where(and(
      eq(visibilityJobs.orderId, orderId),
      eq(visibilityJobs.status, 'pending')
    ));
  
  for (const job of jobs) {
    await processVisibilityJob(job.id);
  }
  
  console.log(`✅ All jobs processed for order: ${orderId}`);
}

// Background job processor - runs periodically
export async function processPendingJobs(): Promise<number> {
  const pendingJobs = await db.select()
    .from(visibilityJobs)
    .where(eq(visibilityJobs.status, 'pending'))
    .limit(10);
  
  let processed = 0;
  for (const job of pendingJobs) {
    await processVisibilityJob(job.id);
    processed++;
  }
  
  if (processed > 0) {
    console.log(`⚙️ Processed ${processed} pending visibility jobs`);
  }
  
  return processed;
}
