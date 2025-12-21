import type { Express, Request } from "express";
import { db } from "./db";
import { blogPosts, listings, courses, forumTopics, vendors, diagnosticCodes, users } from "@shared/schema";
import { eq, desc, and, isNotNull, or } from "drizzle-orm";

const ALLOWED_DOMAINS = ["washbizhub.com", "washbizhub.xyz"];
const DEFAULT_BASE_URL = "https://washbizhub.com";

// All 50 US states for programmatic SEO
const US_STATES = [
  "alabama", "alaska", "arizona", "arkansas", "california", "colorado", "connecticut",
  "delaware", "florida", "georgia", "hawaii", "idaho", "illinois", "indiana", "iowa",
  "kansas", "kentucky", "louisiana", "maine", "maryland", "massachusetts", "michigan",
  "minnesota", "mississippi", "missouri", "montana", "nebraska", "nevada", "new-hampshire",
  "new-jersey", "new-mexico", "new-york", "north-carolina", "north-dakota", "ohio",
  "oklahoma", "oregon", "pennsylvania", "rhode-island", "south-carolina", "south-dakota",
  "tennessee", "texas", "utah", "vermont", "virginia", "washington", "west-virginia",
  "wisconsin", "wyoming"
];

// Major metro areas for city landing pages
const MAJOR_METROS = [
  { city: "los-angeles", state: "california" },
  { city: "new-york-city", state: "new-york" },
  { city: "chicago", state: "illinois" },
  { city: "houston", state: "texas" },
  { city: "phoenix", state: "arizona" },
  { city: "philadelphia", state: "pennsylvania" },
  { city: "san-antonio", state: "texas" },
  { city: "san-diego", state: "california" },
  { city: "dallas", state: "texas" },
  { city: "san-jose", state: "california" },
  { city: "austin", state: "texas" },
  { city: "jacksonville", state: "florida" },
  { city: "fort-worth", state: "texas" },
  { city: "columbus", state: "ohio" },
  { city: "charlotte", state: "north-carolina" },
  { city: "san-francisco", state: "california" },
  { city: "indianapolis", state: "indiana" },
  { city: "seattle", state: "washington" },
  { city: "denver", state: "colorado" },
  { city: "boston", state: "massachusetts" },
  { city: "el-paso", state: "texas" },
  { city: "detroit", state: "michigan" },
  { city: "nashville", state: "tennessee" },
  { city: "portland", state: "oregon" },
  { city: "memphis", state: "tennessee" },
  { city: "oklahoma-city", state: "oklahoma" },
  { city: "las-vegas", state: "nevada" },
  { city: "louisville", state: "kentucky" },
  { city: "baltimore", state: "maryland" },
  { city: "milwaukee", state: "wisconsin" },
  { city: "albuquerque", state: "new-mexico" },
  { city: "tucson", state: "arizona" },
  { city: "fresno", state: "california" },
  { city: "sacramento", state: "california" },
  { city: "atlanta", state: "georgia" },
  { city: "miami", state: "florida" },
  { city: "tampa", state: "florida" },
  { city: "orlando", state: "florida" },
  { city: "pittsburgh", state: "pennsylvania" },
  { city: "cleveland", state: "ohio" },
];

function getBaseUrl(req: Request): string {
  const host = req.get('host') || '';
  if (host.includes('washbizhub.xyz')) {
    return 'https://washbizhub.xyz';
  }
  if (host.includes('washbizhub.com')) {
    return 'https://washbizhub.com';
  }
  return DEFAULT_BASE_URL;
}

const staticPages = [
  { url: "/", priority: 1.0, changefreq: "daily" },
  { url: "/pricing", priority: 0.9, changefreq: "weekly" },
  { url: "/cleanbi-auto", priority: 0.9, changefreq: "weekly" },
  { url: "/cleanbi-explorer", priority: 0.9, changefreq: "weekly" },
  { url: "/cleanbi-reports", priority: 0.8, changefreq: "weekly" },
  { url: "/calculators", priority: 0.9, changefreq: "weekly" },
  { url: "/calculators-suite", priority: 0.8, changefreq: "weekly" },
  { url: "/valuation-calculator", priority: 0.8, changefreq: "monthly" },
  { url: "/roi-calculator", priority: 0.8, changefreq: "monthly" },
  { url: "/roi-calculator-advanced", priority: 0.8, changefreq: "monthly" },
  { url: "/utility-calculator", priority: 0.8, changefreq: "monthly" },
  { url: "/labor-calculator", priority: 0.8, changefreq: "monthly" },
  { url: "/loan-calculator", priority: 0.8, changefreq: "monthly" },
  { url: "/tpd-calculator", priority: 0.8, changefreq: "monthly" },
  { url: "/blog", priority: 0.8, changefreq: "daily" },
  { url: "/courses", priority: 0.8, changefreq: "weekly" },
  { url: "/academy", priority: 0.7, changefreq: "weekly" },
  { url: "/laundromat-listings", priority: 0.9, changefreq: "daily" },
  { url: "/equipment-marketplace", priority: 0.8, changefreq: "daily" },
  { url: "/directory", priority: 0.8, changefreq: "weekly" },
  { url: "/funding", priority: 0.9, changefreq: "weekly" },
  { url: "/funding-matcher", priority: 0.8, changefreq: "weekly" },
  { url: "/startup-funding", priority: 0.8, changefreq: "weekly" },
  { url: "/acquisitions-funding", priority: 0.8, changefreq: "weekly" },
  { url: "/equipment-financing", priority: 0.8, changefreq: "weekly" },
  { url: "/equipment-builder", priority: 0.9, changefreq: "weekly" },
  { url: "/distributor-locator", priority: 0.8, changefreq: "weekly" },
  { url: "/working-capital-financing", priority: 0.8, changefreq: "weekly" },
  { url: "/real-estate-financing", priority: 0.8, changefreq: "weekly" },
  { url: "/gokapital", priority: 0.8, changefreq: "monthly" },
  { url: "/funding/preferred-funding-group", priority: 0.8, changefreq: "monthly" },
  { url: "/funding/gokapital", priority: 0.8, changefreq: "monthly" },
  { url: "/funding/south-end-capital", priority: 0.8, changefreq: "monthly" },
  { url: "/funding/rok-financial", priority: 0.8, changefreq: "monthly" },
  { url: "/funding/advance-funds-network", priority: 0.8, changefreq: "monthly" },
  { url: "/funding/david-allen-capital", priority: 0.8, changefreq: "monthly" },
  { url: "/funding/national-business-capital", priority: 0.8, changefreq: "monthly" },
  { url: "/sba-readiness", priority: 0.7, changefreq: "monthly" },
  { url: "/business-plan-generator", priority: 0.7, changefreq: "monthly" },
  { url: "/design-studio", priority: 0.7, changefreq: "monthly" },
  { url: "/design-studio-pro", priority: 0.7, changefreq: "monthly" },
  { url: "/service-guy-ai", priority: 0.7, changefreq: "monthly" },
  { url: "/error-codes", priority: 0.8, changefreq: "weekly" },
  { url: "/forum", priority: 0.7, changefreq: "daily" },
  { url: "/about-us", priority: 0.6, changefreq: "monthly" },
  { url: "/why-washbizhub", priority: 0.6, changefreq: "monthly" },
  { url: "/help-center", priority: 0.7, changefreq: "weekly" },
  { url: "/referral-program", priority: 0.6, changefreq: "monthly" },
  { url: "/score-history", priority: 0.5, changefreq: "weekly" },
  { url: "/products", priority: 0.7, changefreq: "weekly" },
  { url: "/pos", priority: 0.6, changefreq: "monthly" },
  { url: "/subscribe", priority: 0.7, changefreq: "monthly" },
  { url: "/auth", priority: 0.3, changefreq: "monthly" },
  { url: "/brokers", priority: 0.8, changefreq: "weekly" },
  { url: "/buy-laundromat", priority: 0.9, changefreq: "daily" },
  { url: "/marketplace", priority: 0.9, changefreq: "daily" },
  { url: "/equipment-hub", priority: 0.8, changefreq: "weekly" },
  { url: "/consultation", priority: 0.8, changefreq: "monthly" },
  { url: "/cleanbi-anywhere", priority: 0.8, changefreq: "weekly" },
  { url: "/ai-consultation-council", priority: 0.8, changefreq: "monthly" },
  { url: "/larry-larsen", priority: 0.7, changefreq: "monthly" },
  { url: "/cleanbi-market-report", priority: 0.8, changefreq: "weekly" },
  { url: "/cleanbi-methodology", priority: 0.8, changefreq: "monthly" },
  // SEO Landing Pages
  { url: "/laundromat-valuation", priority: 0.8, changefreq: "monthly" },
  { url: "/laundromat-for-sale", priority: 0.9, changefreq: "daily" },
  { url: "/laundromat-due-diligence", priority: 0.8, changefreq: "monthly" },
  { url: "/laundromat-location-analysis", priority: 0.8, changefreq: "monthly" },
  { url: "/laundromat-roi-calculator", priority: 0.8, changefreq: "monthly" },
  { url: "/laundromat-equipment-repair", priority: 0.8, changefreq: "monthly" },
  { url: "/how-to-start-laundromat", priority: 0.8, changefreq: "monthly" },
  { url: "/laundromat-financing", priority: 0.8, changefreq: "monthly" },
  { url: "/laundromat-business-plan", priority: 0.8, changefreq: "monthly" },
  { url: "/buy-coin-laundry", priority: 0.8, changefreq: "monthly" },
  // Seller Pages
  { url: "/sell-laundromat", priority: 0.8, changefreq: "weekly" },
  { url: "/list-your-laundromat", priority: 0.8, changefreq: "weekly" },
  { url: "/sell-your-laundromat", priority: 0.8, changefreq: "weekly" },
  // Tools & Calculators
  { url: "/tools", priority: 0.7, changefreq: "weekly" },
  { url: "/calculator", priority: 0.7, changefreq: "monthly" },
  { url: "/cleanbi-calculator", priority: 0.8, changefreq: "monthly" },
  { url: "/ltv-calculator", priority: 0.7, changefreq: "monthly" },
  { url: "/cac-calculator", priority: 0.7, changefreq: "monthly" },
  { url: "/equipment-appraiser", priority: 0.7, changefreq: "monthly" },
  { url: "/utility-bill-auditor", priority: 0.7, changefreq: "monthly" },
  { url: "/utility-bill-scanner", priority: 0.7, changefreq: "monthly" },
  { url: "/what-if-analysis", priority: 0.7, changefreq: "monthly" },
  { url: "/smart-location-scout", priority: 0.7, changefreq: "monthly" },
  { url: "/competitor-intelligence", priority: 0.7, changefreq: "monthly" },
  { url: "/qr-generator", priority: 0.6, changefreq: "monthly" },
  // Operator Tools
  { url: "/operator-dashboard", priority: 0.7, changefreq: "weekly" },
  { url: "/command-center", priority: 0.7, changefreq: "weekly" },
  { url: "/pos-system", priority: 0.7, changefreq: "monthly" },
  { url: "/pos-command-center", priority: 0.7, changefreq: "monthly" },
  { url: "/iot-dashboard", priority: 0.7, changefreq: "monthly" },
  { url: "/machine-booking", priority: 0.7, changefreq: "monthly" },
  { url: "/website-builder", priority: 0.7, changefreq: "monthly" },
  // Equipment
  { url: "/equipment", priority: 0.8, changefreq: "weekly" },
  // Funding
  { url: "/funding-marketplace", priority: 0.8, changefreq: "weekly" },
  // Legal Pages
  { url: "/privacy-policy", priority: 0.4, changefreq: "monthly" },
  { url: "/terms-of-service", priority: 0.4, changefreq: "monthly" },
  { url: "/legal-disclaimer", priority: 0.4, changefreq: "monthly" },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDate(date: Date | string | null): string {
  if (!date) return new Date().toISOString().split('T')[0];
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function registerSitemapRoutes(app: Express) {
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const BASE_URL = getBaseUrl(req);
      
      const [blogs, allListings, allCourses, topics, errorCodes, brokerUsers] = await Promise.all([
        db.select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt })
          .from(blogPosts)
          .where(eq(blogPosts.status, "published"))
          .orderBy(desc(blogPosts.createdAt))
          .limit(500),
        db.select({ id: listings.id, updatedAt: listings.updatedAt })
          .from(listings)
          .where(eq(listings.status, "active"))
          .orderBy(desc(listings.createdAt))
          .limit(500),
        db.select({ id: courses.id, createdAt: courses.createdAt })
          .from(courses)
          .where(eq(courses.published, true))
          .limit(100),
        db.select({ id: forumTopics.id, updatedAt: forumTopics.updatedAt })
          .from(forumTopics)
          .orderBy(desc(forumTopics.createdAt))
          .limit(200),
        db.select({ slug: diagnosticCodes.slug, manufacturer: diagnosticCodes.manufacturer })
          .from(diagnosticCodes)
          .limit(2500),
        db.select({ id: users.id })
          .from(users)
          .where(eq(users.role, "broker"))
          .limit(100),
      ]);

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
`;

      for (const page of staticPages) {
        xml += `  <url>
    <loc>${BASE_URL}${escapeXml(page.url)}</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
      }

      for (const post of blogs) {
        xml += `  <url>
    <loc>${BASE_URL}/blog/${escapeXml(post.slug)}</loc>
    <lastmod>${formatDate(post.updatedAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }

      for (const listing of allListings) {
        xml += `  <url>
    <loc>${BASE_URL}/laundromat-listings/${escapeXml(listing.id)}</loc>
    <lastmod>${formatDate(listing.updatedAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }

      for (const course of allCourses) {
        xml += `  <url>
    <loc>${BASE_URL}/courses/${escapeXml(course.id)}</loc>
    <lastmod>${formatDate(course.createdAt)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }

      for (const topic of topics) {
        xml += `  <url>
    <loc>${BASE_URL}/forum/topic/${escapeXml(topic.id)}</loc>
    <lastmod>${formatDate(topic.updatedAt)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.5</priority>
  </url>
`;
      }

      // Error codes for programmatic SEO
      for (const code of errorCodes) {
        if (code.slug) {
          xml += `  <url>
    <loc>${BASE_URL}/error-codes/${escapeXml(code.slug)}</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
        }
      }

      // Broker storefronts
      for (const broker of brokerUsers) {
        xml += `  <url>
    <loc>${BASE_URL}/broker/${escapeXml(broker.id)}</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }

      // State landing pages for programmatic SEO (50 states)
      xml += `  <url>
    <loc>${BASE_URL}/laundromats-for-sale</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
      for (const state of US_STATES) {
        xml += `  <url>
    <loc>${BASE_URL}/laundromats-for-sale/${escapeXml(state)}</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      }

      xml += `</urlset>`;

      res.header("Content-Type", "application/xml");
      res.header("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (error) {
      console.error("Sitemap generation error:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  app.get("/robots.txt", (req, res) => {
    const BASE_URL = getBaseUrl(req);
    const robotsTxt = `# WashBizHub Robots.txt
# https://washbizhub.com
# The #1 Laundromat Resource & Educational Hub

User-agent: *
Allow: /

# Sitemaps - All content indexed
Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/sitemap_index.xml
Sitemap: ${BASE_URL}/sitemap-blogs.xml
Sitemap: ${BASE_URL}/sitemap-listings.xml
Sitemap: ${BASE_URL}/sitemap-error-codes.xml
Sitemap: ${BASE_URL}/sitemap-resources.xml
Sitemap: ${BASE_URL}/sitemap-courses.xml
Sitemap: ${BASE_URL}/sitemap-forum.xml
Sitemap: ${BASE_URL}/sitemap-vendors.xml
Sitemap: ${BASE_URL}/sitemap-states.xml

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /auth
Disallow: /account/
Disallow: /dashboard/
Disallow: /settings
Disallow: /vault

# Disallow legacy WordPress paths (site migrated from WordPress)
Disallow: /wp-admin
Disallow: /wp-admin/
Disallow: /wp-content
Disallow: /wp-content/
Disallow: /wp-includes
Disallow: /wp-includes/
Disallow: /wp-json
Disallow: /wp-json/
Disallow: /wp-login
Disallow: /wp-login.php
Disallow: /xmlrpc.php
Disallow: /?p=
Disallow: /?page_id=
Disallow: /?cat=
Disallow: /?tag=

# Allow important crawlers
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

# AI Crawlers (AEO optimization)
User-agent: GPTBot
Allow: /
Crawl-delay: 2

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

# Rate limit aggressive bots
User-agent: AhrefsBot
Crawl-delay: 10

User-agent: SemrushBot
Crawl-delay: 10

User-agent: MJ12bot
Crawl-delay: 10

# Crawl-delay for other bots
User-agent: *
Crawl-delay: 1
`;

    res.header("Content-Type", "text/plain");
    res.header("Cache-Control", "public, max-age=3600");
    res.send(robotsTxt);
  });

  // New sitemap-index.xml that references all individual sitemaps
  app.get("/sitemap-index.xml", async (req, res) => {
    const BASE_URL = getBaseUrl(req);
    const today = formatDate(new Date());
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap-static.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-blog.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-listings.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-error-codes.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-locations.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-community.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=3600");
    res.send(xml);
  });

  // Sitemap for static pages (high-priority core pages)
  app.get("/sitemap-static.xml", async (req, res) => {
    const BASE_URL = getBaseUrl(req);
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
    for (const page of staticPages) {
      xml += `  <url>
    <loc>${BASE_URL}${escapeXml(page.url)}</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }
    xml += `</urlset>`;
    
    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=3600");
    res.send(xml);
  });

  // Sitemap for blog posts
  app.get("/sitemap-blog.xml", async (req, res) => {
    try {
      const BASE_URL = getBaseUrl(req);
      
      const blogs = await db.select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt })
        .from(blogPosts)
        .where(eq(blogPosts.status, "published"))
        .orderBy(desc(blogPosts.createdAt))
        .limit(1000);

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/blog</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
      for (const post of blogs) {
        xml += `  <url>
    <loc>${BASE_URL}/blog/${escapeXml(post.slug)}</loc>
    <lastmod>${formatDate(post.updatedAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }
      xml += `</urlset>`;
      
      res.header("Content-Type", "application/xml");
      res.header("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (error) {
      console.error("Blog sitemap error:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  // Sitemap for laundromat listings
  app.get("/sitemap-listings.xml", async (req, res) => {
    try {
      const BASE_URL = getBaseUrl(req);
      
      const [allListings, allCourses, brokerUsers] = await Promise.all([
        db.select({ id: listings.id, updatedAt: listings.updatedAt })
          .from(listings)
          .where(eq(listings.status, "active"))
          .orderBy(desc(listings.createdAt))
          .limit(1000),
        db.select({ id: courses.id, createdAt: courses.createdAt })
          .from(courses)
          .where(eq(courses.published, true))
          .limit(200),
        db.select({ id: users.id })
          .from(users)
          .where(eq(users.role, "broker"))
          .limit(200),
      ]);

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/laundromat-listings</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/marketplace</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/brokers</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      for (const listing of allListings) {
        xml += `  <url>
    <loc>${BASE_URL}/laundromat-listings/${escapeXml(listing.id)}</loc>
    <lastmod>${formatDate(listing.updatedAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }
      for (const course of allCourses) {
        xml += `  <url>
    <loc>${BASE_URL}/courses/${escapeXml(course.id)}</loc>
    <lastmod>${formatDate(course.createdAt)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }
      for (const broker of brokerUsers) {
        xml += `  <url>
    <loc>${BASE_URL}/broker/${escapeXml(broker.id)}</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }
      xml += `</urlset>`;
      
      res.header("Content-Type", "application/xml");
      res.header("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (error) {
      console.error("Listings sitemap error:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  // Sitemap for error codes (programmatic SEO - can be large)
  app.get("/sitemap-error-codes.xml", async (req, res) => {
    try {
      const BASE_URL = getBaseUrl(req);
      
      const errorCodes = await db.select({ slug: diagnosticCodes.slug })
        .from(diagnosticCodes)
        .limit(5000);

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/error-codes</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      for (const code of errorCodes) {
        if (code.slug) {
          xml += `  <url>
    <loc>${BASE_URL}/error-codes/${escapeXml(code.slug)}</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
        }
      }
      xml += `</urlset>`;
      
      res.header("Content-Type", "application/xml");
      res.header("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (error) {
      console.error("Error codes sitemap error:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  // Sitemap for location pages (states + metros - programmatic SEO)
  app.get("/sitemap-locations.xml", async (req, res) => {
    const BASE_URL = getBaseUrl(req);
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/laundromats-for-sale</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
    // State landing pages
    for (const state of US_STATES) {
      xml += `  <url>
    <loc>${BASE_URL}/laundromats-for-sale/${escapeXml(state)}</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }
    // Metro/city landing pages
    for (const metro of MAJOR_METROS) {
      xml += `  <url>
    <loc>${BASE_URL}/laundromats-for-sale/${escapeXml(metro.state)}/${escapeXml(metro.city)}</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.75</priority>
  </url>
`;
    }
    xml += `</urlset>`;
    
    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=3600");
    res.send(xml);
  });

  // Sitemap for community content (forum, courses)
  app.get("/sitemap-community.xml", async (req, res) => {
    try {
      const BASE_URL = getBaseUrl(req);
      
      const topics = await db.select({ id: forumTopics.id, updatedAt: forumTopics.updatedAt })
        .from(forumTopics)
        .orderBy(desc(forumTopics.createdAt))
        .limit(500);

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/forum</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${BASE_URL}/courses</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/academy</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      for (const topic of topics) {
        xml += `  <url>
    <loc>${BASE_URL}/forum/topic/${escapeXml(topic.id)}</loc>
    <lastmod>${formatDate(topic.updatedAt)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.5</priority>
  </url>
`;
      }
      xml += `</urlset>`;
      
      res.header("Content-Type", "application/xml");
      res.header("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (error) {
      console.error("Community sitemap error:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  console.log("✅ Sitemap routes registered (6 sitemaps + index)");
}
