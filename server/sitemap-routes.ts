import type { Express, Request } from "express";
import { db } from "./db";
import { blogPosts, listings, courses, forumTopics, vendors, diagnosticCodes, users } from "@shared/schema";
import { eq, desc, and, isNotNull, or } from "drizzle-orm";

const ALLOWED_DOMAINS = ["washbizhub.com", "washbizhub.xyz"];
const DEFAULT_BASE_URL = "https://washbizhub.com";

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
        db.select({ id: courses.id, updatedAt: courses.updatedAt })
          .from(courses)
          .where(eq(courses.isPublished, true))
          .limit(100),
        db.select({ id: forumTopics.id, updatedAt: forumTopics.updatedAt })
          .from(forumTopics)
          .orderBy(desc(forumTopics.createdAt))
          .limit(200),
        db.select({ slug: diagnosticCodes.slug, manufacturer: diagnosticCodes.manufacturer })
          .from(diagnosticCodes)
          .limit(2500),
        db.select({ id: users.id, updatedAt: users.updatedAt })
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
    <lastmod>${formatDate(course.updatedAt)}</lastmod>
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
    <lastmod>${formatDate(broker.updatedAt)}</lastmod>
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
      console.error("Sitemap generation error:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  app.get("/robots.txt", (req, res) => {
    const robotsTxt = `# WashBizHub Robots.txt
# https://washbizhub.com

User-agent: *
Allow: /

# Sitemaps
Sitemap: ${BASE_URL}/sitemap.xml

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /auth
Disallow: /account/
Disallow: /dashboard/

# Allow important crawlers
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

# Block bad bots
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MJ12bot
Disallow: /

# Crawl-delay for aggressive bots
User-agent: *
Crawl-delay: 1
`;

    res.header("Content-Type", "text/plain");
    res.header("Cache-Control", "public, max-age=86400");
    res.send(robotsTxt);
  });

  app.get("/sitemap-index.xml", async (req, res) => {
    const today = formatDate(new Date());
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=3600");
    res.send(xml);
  });

  console.log("✅ Sitemap routes registered");
}
