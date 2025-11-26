import type { Express } from "express";
import { db } from "./db";
import { blogPosts, listings } from "@shared/schema";
import { eq, desc, isNotNull } from "drizzle-orm";

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * MAXIMUM SEO/AEO SITEMAP SYSTEM
 * 
 * Features:
 * - Dynamic blog post inclusion (all 320+ CLEANBI blogs)
 * - Dynamic listing inclusion
 * - Proper priority hierarchy
 * - Full page coverage
 * - Split sitemaps for large sites (sitemap index)
 */

export function registerSitemapRoutes(app: Express) {
  
  // Main sitemap index (for large sites with 50k+ URLs)
  app.get('/sitemap_index.xml', async (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const host = req.headers.host || 'washbizhub.com';
    const baseUrl = `${protocol}://${host}`;
    const today = new Date().toISOString().split('T')[0];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-blogs.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-listings.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  });

  // Core pages sitemap
  app.get('/sitemap.xml', async (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const host = req.headers.host || 'washbizhub.com';
    const baseUrl = `${protocol}://${host}`;
    const today = new Date().toISOString().split('T')[0];

    // Fetch all published blogs from database for inclusion
    let blogUrls: SitemapUrl[] = [];
    try {
      const blogs = await db.select({
        slug: blogPosts.slug,
        createdAt: blogPosts.createdAt,
      }).from(blogPosts)
        .where(eq(blogPosts.published, true))
        .orderBy(desc(blogPosts.createdAt))
        .limit(1000);

      blogUrls = blogs.map(blog => ({
        loc: `/blog/${blog.slug}`,
        lastmod: blog.createdAt ? new Date(blog.createdAt).toISOString().split('T')[0] : today,
        changefreq: 'weekly' as const,
        priority: 0.7
      }));
    } catch (error) {
      console.error('Sitemap: Failed to fetch blogs:', error);
    }

    // Fetch all active listings
    let listingUrls: SitemapUrl[] = [];
    try {
      const allListings = await db.select({
        id: listings.id,
        createdAt: listings.createdAt,
      }).from(listings)
        .where(eq(listings.status, 'active'))
        .orderBy(desc(listings.createdAt))
        .limit(500);

      listingUrls = allListings.map(listing => ({
        loc: `/listing/${listing.id}`,
        lastmod: listing.createdAt ? new Date(listing.createdAt).toISOString().split('T')[0] : today,
        changefreq: 'daily' as const,
        priority: 0.8
      }));
    } catch (error) {
      console.error('Sitemap: Failed to fetch listings:', error);
    }

    const coreUrls: SitemapUrl[] = [
      // Highest Priority - Core pages
      { loc: '/', lastmod: today, changefreq: 'daily', priority: 1.0 },
      
      // CLEANBI - Main revenue driver
      { loc: '/cleanbi-auto', lastmod: today, changefreq: 'daily', priority: 1.0 },
      { loc: '/cleanbi', lastmod: today, changefreq: 'daily', priority: 0.95 },
      
      // High Priority - Revenue pages
      { loc: '/marketplace', lastmod: today, changefreq: 'daily', priority: 0.95 },
      { loc: '/superstore', lastmod: today, changefreq: 'daily', priority: 0.9 },
      { loc: '/courses', lastmod: today, changefreq: 'weekly', priority: 0.9 },
      { loc: '/book', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/pricing', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      
      // Tools & Calculators
      { loc: '/tools', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      { loc: '/calculator', lastmod: today, changefreq: 'monthly', priority: 0.8 },
      { loc: '/roi-calculator', lastmod: today, changefreq: 'monthly', priority: 0.8 },
      { loc: '/calculators', lastmod: today, changefreq: 'monthly', priority: 0.8 },
      { loc: '/funding-matcher', lastmod: today, changefreq: 'weekly', priority: 0.8 },
      
      // Resources
      { loc: '/resources', lastmod: today, changefreq: 'weekly', priority: 0.8 },
      { loc: '/vendors', lastmod: today, changefreq: 'weekly', priority: 0.75 },
      { loc: '/blog', lastmod: today, changefreq: 'daily', priority: 0.85 },
      { loc: '/templates', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      
      // Design & Website
      { loc: '/design-studio', lastmod: today, changefreq: 'monthly', priority: 0.75 },
      { loc: '/website-builder', lastmod: today, changefreq: 'monthly', priority: 0.7 },
      { loc: '/website-templates', lastmod: today, changefreq: 'weekly', priority: 0.65 },
      
      // Superstore categories
      { loc: '/superstore/compare', lastmod: today, changefreq: 'weekly', priority: 0.8 },
      { loc: '/buyers-guides', lastmod: today, changefreq: 'monthly', priority: 0.75 },
      { loc: '/superstore?category=washers', lastmod: today, changefreq: 'daily', priority: 0.8 },
      { loc: '/superstore?category=dryers', lastmod: today, changefreq: 'daily', priority: 0.8 },
      { loc: '/superstore?category=folding-tables', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/superstore?category=carts', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/superstore?category=supplies', lastmod: today, changefreq: 'daily', priority: 0.7 },
      { loc: '/superstore?category=vending', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/superstore?category=arcade', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      
      // Info pages
      { loc: '/about', lastmod: today, changefreq: 'monthly', priority: 0.6 },
      { loc: '/contact', lastmod: today, changefreq: 'monthly', priority: 0.6 },
      { loc: '/faq', lastmod: today, changefreq: 'monthly', priority: 0.65 },
      
      // Legal pages
      { loc: '/privacy-policy', lastmod: today, changefreq: 'monthly', priority: 0.4 },
      { loc: '/terms-of-service', lastmod: today, changefreq: 'monthly', priority: 0.4 },
    ];

    // Combine all URLs
    const allUrls = [...coreUrls, ...blogUrls, ...listingUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${allUrls.map(url => `  <url>
    <loc>${baseUrl}${url.loc}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}${url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : ''}${url.priority ? `\n    <priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(xml);
  });

  // Dedicated blogs sitemap (for very large blog counts)
  app.get('/sitemap-blogs.xml', async (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const host = req.headers.host || 'washbizhub.com';
    const baseUrl = `${protocol}://${host}`;
    const today = new Date().toISOString().split('T')[0];

    let blogUrls: SitemapUrl[] = [];
    try {
      const blogs = await db.select({
        slug: blogPosts.slug,
        title: blogPosts.title,
        createdAt: blogPosts.createdAt,
        category: blogPosts.category,
      }).from(blogPosts)
        .where(eq(blogPosts.published, true))
        .orderBy(desc(blogPosts.createdAt));

      blogUrls = blogs.map(blog => {
        // Higher priority for CLEANBI blogs
        const isCleanbi = blog.slug?.includes('cleanbi') || blog.category === 'business_scoring' || blog.category === 'real_estate';
        return {
          loc: `/blog/${blog.slug}`,
          lastmod: blog.createdAt ? new Date(blog.createdAt).toISOString().split('T')[0] : today,
          changefreq: 'weekly' as const,
          priority: isCleanbi ? 0.8 : 0.7
        };
      });
    } catch (error) {
      console.error('Sitemap-blogs: Failed to fetch blogs:', error);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${blogUrls.map(url => `  <url>
    <loc>${baseUrl}${url.loc}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}${url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : ''}${url.priority ? `\n    <priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  });

  // Dedicated listings sitemap
  app.get('/sitemap-listings.xml', async (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const host = req.headers.host || 'washbizhub.com';
    const baseUrl = `${protocol}://${host}`;
    const today = new Date().toISOString().split('T')[0];

    let listingUrls: SitemapUrl[] = [];
    try {
      const allListings = await db.select({
        id: listings.id,
        createdAt: listings.createdAt,
      }).from(listings)
        .where(eq(listings.status, 'active'))
        .orderBy(desc(listings.createdAt));

      listingUrls = allListings.map(listing => ({
        loc: `/listing/${listing.id}`,
        lastmod: listing.createdAt ? new Date(listing.createdAt).toISOString().split('T')[0] : today,
        changefreq: 'daily' as const,
        priority: 0.85
      }));
    } catch (error) {
      console.error('Sitemap-listings: Failed to fetch listings:', error);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${listingUrls.map(url => `  <url>
    <loc>${baseUrl}${url.loc}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}${url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : ''}${url.priority ? `\n    <priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=1800'); // Cache for 30 mins (listings change more)
    res.send(xml);
  });

  // Enhanced robots.txt with all sitemaps
  app.get('/robots.txt', (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const host = req.headers.host || 'washbizhub.com';
    const baseUrl = `${protocol}://${host}`;
    
    const robotsTxt = `# WashBizHub Robots.txt
# Maximum SEO/AEO Configuration

User-agent: *
Allow: /

# Primary Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Additional Sitemaps
Sitemap: ${baseUrl}/sitemap-blogs.xml
Sitemap: ${baseUrl}/sitemap-listings.xml
Sitemap: ${baseUrl}/sitemap_index.xml

# Disallow admin and private areas
Disallow: /admin
Disallow: /api/
Disallow: /_next/
Disallow: /static/

# Allow specific API endpoints for SEO tools
Allow: /api/blog
Allow: /api/listings

# Crawl delay (reasonable for SEO bots)
Crawl-delay: 1

# AI/LLM Crawlers (AEO optimization)
User-agent: GPTBot
Allow: /
Crawl-delay: 2

User-agent: ChatGPT-User
Allow: /
Crawl-delay: 2

User-agent: Claude-Web
Allow: /
Crawl-delay: 2

User-agent: Anthropic-AI
Allow: /
Crawl-delay: 2

User-agent: PerplexityBot
Allow: /
Crawl-delay: 2

User-agent: Google-Extended
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Yandexbot
Allow: /
Crawl-delay: 2`;

    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });
}
