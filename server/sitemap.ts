import type { Express } from "express";
import { db } from "./db";
import { blogPosts, listings, diagnosticCodes, resources, courses, lessons, forumCategories, forumTopics, vendorStores, vendorProducts } from "@shared/schema";
import { eq, desc, isNotNull, and } from "drizzle-orm";

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * MAXIMUM SEO/AEO SITEMAP SYSTEM
 * 
 * Features:
 * - Dynamic blog post inclusion (all 320+ CLEANBI blogs)
 * - Dynamic listing inclusion
 * - Dynamic resource pages
 * - Dynamic course and lesson pages
 * - Dynamic forum categories and topics
 * - Dynamic vendor stores and products
 * - Proper priority hierarchy
 * - Full page coverage for ALL content pages
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
  <sitemap>
    <loc>${baseUrl}/sitemap-error-codes.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-resources.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-courses.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-forum.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-vendors.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-states.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  });

  // Core pages sitemap - ALL static routes
  app.get('/sitemap.xml', async (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const host = req.headers.host || 'washbizhub.com';
    const baseUrl = `${protocol}://${host}`;
    const today = new Date().toISOString().split('T')[0];

    const coreUrls: SitemapUrl[] = [
      // ============================================================================
      // HIGHEST PRIORITY - Core pages (1.0)
      // ============================================================================
      { loc: '/', lastmod: today, changefreq: 'daily', priority: 1.0 },
      
      // ============================================================================
      // CLEANBI - Main revenue driver (0.95-1.0)
      // ============================================================================
      { loc: '/cleanbi-auto', lastmod: today, changefreq: 'daily', priority: 1.0 },
      { loc: '/cleanbi-explorer', lastmod: today, changefreq: 'daily', priority: 1.0 },
      { loc: '/cleanbi', lastmod: today, changefreq: 'daily', priority: 0.95 },
      { loc: '/cleanbi-tool', lastmod: today, changefreq: 'daily', priority: 0.95 },
      { loc: '/cleanbi-calculator', lastmod: today, changefreq: 'weekly', priority: 0.9 },
      
      // ============================================================================
      // HIGH PRIORITY - Revenue pages (0.9-0.95)
      // ============================================================================
      { loc: '/marketplace', lastmod: today, changefreq: 'daily', priority: 0.95 },
      { loc: '/marketplace-landing', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      { loc: '/superstore', lastmod: today, changefreq: 'daily', priority: 0.9 },
      { loc: '/courses', lastmod: today, changefreq: 'weekly', priority: 0.9 },
      { loc: '/courses-landing', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      { loc: '/book', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/pricing', lastmod: today, changefreq: 'weekly', priority: 0.9 },
      
      // ============================================================================
      // CALCULATORS & TOOLS (0.8-0.9)
      // ============================================================================
      { loc: '/tools', lastmod: today, changefreq: 'weekly', priority: 0.9 },
      { loc: '/calculators', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      { loc: '/calculators-suite', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      { loc: '/calculator', lastmod: today, changefreq: 'monthly', priority: 0.8 },
      { loc: '/calculator-marketplace', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      { loc: '/calculator-builder', lastmod: today, changefreq: 'monthly', priority: 0.75 },
      { loc: '/roi-calculator', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/roi-calculator-advanced', lastmod: today, changefreq: 'monthly', priority: 0.8 },
      { loc: '/roi-calculator-enhanced', lastmod: today, changefreq: 'monthly', priority: 0.8 },
      { loc: '/valuation-calculator', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/loan-calculator', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/tpd-calculator', lastmod: today, changefreq: 'monthly', priority: 0.8 },
      { loc: '/funding-matcher', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      
      // ============================================================================
      // FUNDING PAGES (0.8-0.9) - ENHANCED SEO/AEO/EEAT
      // ============================================================================
      { loc: '/funding', lastmod: today, changefreq: 'weekly', priority: 0.9 },
      { loc: '/sba-loans', lastmod: today, changefreq: 'weekly', priority: 0.9 },
      { loc: '/equipment-financing', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      { loc: '/real-estate-financing', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      { loc: '/working-capital-financing', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      { loc: '/startup-funding', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      { loc: '/acquisitions-funding', lastmod: today, changefreq: 'weekly', priority: 0.8 },
      { loc: '/gokapital', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/insurance-partners', lastmod: today, changefreq: 'monthly', priority: 0.7 },
      
      // ============================================================================
      // BUSINESS OPERATING SYSTEM (0.8-0.9)
      // ============================================================================
      { loc: '/business-builder', lastmod: today, changefreq: 'weekly', priority: 0.9 },
      { loc: '/owner-dashboard', lastmod: today, changefreq: 'daily', priority: 0.85 },
      { loc: '/pos', lastmod: today, changefreq: 'daily', priority: 0.9 },
      { loc: '/pos-system', lastmod: today, changefreq: 'daily', priority: 0.85 },
      { loc: '/pos-landing', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      { loc: '/order', lastmod: today, changefreq: 'daily', priority: 0.85 },
      { loc: '/laundry-order', lastmod: today, changefreq: 'daily', priority: 0.8 },
      
      // ============================================================================
      // PARTNER & LANDING PAGES (0.75-0.85)
      // ============================================================================
      { loc: '/consultation', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      { loc: '/consultation-landing', lastmod: today, changefreq: 'weekly', priority: 0.8 },
      { loc: '/consultant-inquiry', lastmod: today, changefreq: 'monthly', priority: 0.7 },
      
      // ============================================================================
      // RESOURCES & BLOG (0.75-0.85)
      // ============================================================================
      { loc: '/resources', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      { loc: '/blog', lastmod: today, changefreq: 'daily', priority: 0.9 },
      { loc: '/templates', lastmod: today, changefreq: 'weekly', priority: 0.8 },
      { loc: '/learning', lastmod: today, changefreq: 'weekly', priority: 0.8 },
      { loc: '/affiliate-blogs', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      
      // ============================================================================
      // VENDORS & MARKETPLACE (0.75-0.85)
      // ============================================================================
      { loc: '/vendors', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      { loc: '/vendor-spotlight', lastmod: today, changefreq: 'weekly', priority: 0.75 },
      { loc: '/equipment', lastmod: today, changefreq: 'daily', priority: 0.95 },
      { loc: '/equipment/blog', lastmod: today, changefreq: 'daily', priority: 0.9 },
      { loc: '/equipment/blog/complete-laundromat-retool-guide-2025-costs-timeline-roi', lastmod: today, changefreq: 'weekly', priority: 0.9 },
      { loc: '/equipment/blog/dexter-vs-continental-girbau-commercial-laundry-equipment-comparison-2025', lastmod: today, changefreq: 'weekly', priority: 0.9 },
      { loc: '/equipment/blog/hotel-on-premise-laundry-equipment-guide-2025-opl', lastmod: today, changefreq: 'weekly', priority: 0.9 },
      { loc: '/equipment/blog/commercial-laundry-equipment-pricing-guide-2025', lastmod: today, changefreq: 'weekly', priority: 0.9 },
      { loc: '/equipment/blog/texas-commercial-laundry-equipment-guide-dallas-houston-austin', lastmod: today, changefreq: 'weekly', priority: 0.9 },
      { loc: '/equipment-matcher', lastmod: today, changefreq: 'weekly', priority: 0.8 },
      { loc: '/equipment-diagnostics', lastmod: today, changefreq: 'weekly', priority: 0.75 },
      { loc: '/list-equipment', lastmod: today, changefreq: 'monthly', priority: 0.7 },
      { loc: '/list-supplies', lastmod: today, changefreq: 'monthly', priority: 0.7 },
      { loc: '/featured-listings', lastmod: today, changefreq: 'daily', priority: 0.8 },
      { loc: '/laundromat-listings', lastmod: today, changefreq: 'daily', priority: 0.85 },
      { loc: '/listings', lastmod: today, changefreq: 'daily', priority: 0.85 },
      
      // ============================================================================
      // INDUSTRY EVENTS (0.85-0.9) - HIGH SEO VALUE FOR LOCAL KEYWORDS
      // ============================================================================
      { loc: '/events', lastmod: today, changefreq: 'weekly', priority: 0.9 },
      { loc: '/events/clean-show-2025-new-orleans', lastmod: today, changefreq: 'weekly', priority: 0.9 },
      { loc: '/events/clean-show-2027-orlando', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/events/excellence-in-laundry-2025-las-vegas', lastmod: today, changefreq: 'weekly', priority: 0.9 },
      { loc: '/events/cla-excellence-workshop-chicago-2025', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      { loc: '/events/cla-excellence-workshop-dallas-2025', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      { loc: '/events/cla-excellence-workshop-los-angeles-2025', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      { loc: '/events/western-states-laundry-expo-2025-san-diego', lastmod: today, changefreq: 'weekly', priority: 0.9 },
      { loc: '/events/clean-classic-2025-atlanta', lastmod: today, changefreq: 'weekly', priority: 0.9 },
      { loc: '/events/cleaners-launderers-expo-2025-new-jersey', lastmod: today, changefreq: 'weekly', priority: 0.9 },
      { loc: '/events/alm-impact-2025-miami', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      { loc: '/events/southwest-laundry-summit-2025-phoenix', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      { loc: '/events/pacific-northwest-laundry-conference-2025-seattle', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      
      // ============================================================================
      // DESIGN & WEBSITE TOOLS (0.7-0.8)
      // ============================================================================
      { loc: '/design-studio', lastmod: today, changefreq: 'monthly', priority: 0.8 },
      { loc: '/design-studio-pro', lastmod: today, changefreq: 'monthly', priority: 0.8 },
      { loc: '/website-builder', lastmod: today, changefreq: 'monthly', priority: 0.75 },
      { loc: '/website-templates', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/ad-builder', lastmod: today, changefreq: 'monthly', priority: 0.7 },
      { loc: '/advertising', lastmod: today, changefreq: 'weekly', priority: 0.75 },
      
      // ============================================================================
      // AI TOOLS & CONSULTATION (0.85-0.95)
      // ============================================================================
      { loc: '/ai-consultation', lastmod: today, changefreq: 'daily', priority: 0.95 },
      { loc: '/service-guy-ai', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      { loc: '/ai-blogging', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/ai-content-studio', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/seo-optimizer', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/seo', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      
      // ============================================================================
      // ERROR CODES & PARTS (0.75-0.85) - HIGH SEO VALUE
      // ============================================================================
      { loc: '/error-codes', lastmod: today, changefreq: 'daily', priority: 0.9 },
      { loc: '/parts', lastmod: today, changefreq: 'weekly', priority: 0.8 },
      { loc: '/parts-catalogue', lastmod: today, changefreq: 'weekly', priority: 0.8 },
      { loc: '/repair-guide', lastmod: today, changefreq: 'weekly', priority: 0.75 },
      
      // ============================================================================
      // SUPERSTORE CATEGORIES (0.7-0.8)
      // ============================================================================
      { loc: '/superstore/compare', lastmod: today, changefreq: 'weekly', priority: 0.8 },
      { loc: '/buyers-guides', lastmod: today, changefreq: 'monthly', priority: 0.75 },
      { loc: '/superstore?category=washers', lastmod: today, changefreq: 'daily', priority: 0.8 },
      { loc: '/superstore?category=dryers', lastmod: today, changefreq: 'daily', priority: 0.8 },
      { loc: '/superstore?category=folding-tables', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/superstore?category=carts', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/superstore?category=supplies', lastmod: today, changefreq: 'daily', priority: 0.7 },
      { loc: '/superstore?category=vending', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/superstore?category=arcade', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      
      // ============================================================================
      // LOCATOR PAGES (0.75-0.85)
      // ============================================================================
      { loc: '/locator', lastmod: today, changefreq: 'weekly', priority: 0.8 },
      { loc: '/distributor-locator', lastmod: today, changefreq: 'weekly', priority: 0.8 },
      { loc: '/laundromat-locator', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      
      // ============================================================================
      // PLANNING & JOURNEY PAGES (0.7-0.8)
      // ============================================================================
      { loc: '/plan', lastmod: today, changefreq: 'weekly', priority: 0.8 },
      { loc: '/evaluate', lastmod: today, changefreq: 'weekly', priority: 0.8 },
      { loc: '/operate', lastmod: today, changefreq: 'weekly', priority: 0.8 },
      { loc: '/partner', lastmod: today, changefreq: 'weekly', priority: 0.75 },
      
      // ============================================================================
      // FORUM INDEX (0.8)
      // ============================================================================
      { loc: '/forum', lastmod: today, changefreq: 'daily', priority: 0.85 },
      
      // ============================================================================
      // SOCIAL & COMMUNITY (0.6-0.7)
      // ============================================================================
      { loc: '/subscribe', lastmod: today, changefreq: 'monthly', priority: 0.7 },
      { loc: '/facebook-group', lastmod: today, changefreq: 'monthly', priority: 0.65 },
      { loc: '/atm-services', lastmod: today, changefreq: 'monthly', priority: 0.6 },
      
      // ============================================================================
      // INFO PAGES (0.6-0.7)
      // ============================================================================
      { loc: '/about', lastmod: today, changefreq: 'monthly', priority: 0.7 },
      { loc: '/about-us', lastmod: today, changefreq: 'monthly', priority: 0.7 },
      { loc: '/why-washbizhub', lastmod: today, changefreq: 'monthly', priority: 0.7 },
      
      // ============================================================================
      // SRA (STROKE RECOVERY APP) PAGES (0.6-0.75)
      // ============================================================================
      { loc: '/sra', lastmod: today, changefreq: 'weekly', priority: 0.75 },
      { loc: '/sra/pricing', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/sra/tracker', lastmod: today, changefreq: 'weekly', priority: 0.65 },
      { loc: '/sra/companion', lastmod: today, changefreq: 'weekly', priority: 0.65 },
      { loc: '/sra/ghostwriting', lastmod: today, changefreq: 'weekly', priority: 0.65 },
      { loc: '/sra/store', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/sra/community', lastmod: today, changefreq: 'weekly', priority: 0.65 },
      { loc: '/sra/marketplace', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      
      // ============================================================================
      // LEGAL PAGES (0.4)
      // ============================================================================
      { loc: '/privacy-policy', lastmod: today, changefreq: 'monthly', priority: 0.4 },
      { loc: '/privacy', lastmod: today, changefreq: 'monthly', priority: 0.4 },
      { loc: '/terms-of-service', lastmod: today, changefreq: 'monthly', priority: 0.4 },
      { loc: '/terms', lastmod: today, changefreq: 'monthly', priority: 0.4 },
      
      // ============================================================================
      // SEO CALCULATOR LANDING PAGES (0.85-0.9)
      // ============================================================================
      { loc: '/landing/roi-calculator', lastmod: today, changefreq: 'monthly', priority: 0.9 },
      { loc: '/landing/valuation-calculator', lastmod: today, changefreq: 'monthly', priority: 0.9 },
      { loc: '/landing/utility-bill', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      
      // ============================================================================
      // STATE-SPECIFIC SELL YOUR LAUNDROMAT LANDING PAGES (0.85)
      // High-quality, localized content for all 50 states
      // ============================================================================
      { loc: '/sell-laundromat/alabama', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/alaska', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/arizona', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/arkansas', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/california', lastmod: today, changefreq: 'monthly', priority: 0.9 },
      { loc: '/sell-laundromat/colorado', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/connecticut', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/delaware', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/florida', lastmod: today, changefreq: 'monthly', priority: 0.9 },
      { loc: '/sell-laundromat/georgia', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/hawaii', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/idaho', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/illinois', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/indiana', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/iowa', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/kansas', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/kentucky', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/louisiana', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/maine', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/maryland', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/massachusetts', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/michigan', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/minnesota', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/mississippi', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/missouri', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/montana', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/nebraska', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/nevada', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/new-hampshire', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/new-jersey', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/new-mexico', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/new-york', lastmod: today, changefreq: 'monthly', priority: 0.9 },
      { loc: '/sell-laundromat/north-carolina', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/north-dakota', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/ohio', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/oklahoma', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/oregon', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/pennsylvania', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/rhode-island', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/south-carolina', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/south-dakota', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/tennessee', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/texas', lastmod: today, changefreq: 'monthly', priority: 0.9 },
      { loc: '/sell-laundromat/utah', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/vermont', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/virginia', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/washington', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/west-virginia', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/wisconsin', lastmod: today, changefreq: 'monthly', priority: 0.85 },
      { loc: '/sell-laundromat/wyoming', lastmod: today, changefreq: 'monthly', priority: 0.85 },
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${coreUrls.map(url => `  <url>
    <loc>${escapeXml(baseUrl + url.loc)}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}${url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : ''}${url.priority ? `\n    <priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600');
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
    <loc>${escapeXml(baseUrl + url.loc)}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}${url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : ''}${url.priority ? `\n    <priority>${url.priority}</priority>` : ''}
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

      // Add listing detail pages with both URL patterns
      allListings.forEach(listing => {
        listingUrls.push({
          loc: `/listing/${listing.id}`,
          lastmod: listing.createdAt ? new Date(listing.createdAt).toISOString().split('T')[0] : today,
          changefreq: 'daily' as const,
          priority: 0.85
        });
        listingUrls.push({
          loc: `/listings/${listing.id}`,
          lastmod: listing.createdAt ? new Date(listing.createdAt).toISOString().split('T')[0] : today,
          changefreq: 'daily' as const,
          priority: 0.85
        });
      });
    } catch (error) {
      console.error('Sitemap-listings: Failed to fetch listings:', error);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${listingUrls.map(url => `  <url>
    <loc>${escapeXml(baseUrl + url.loc)}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}${url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : ''}${url.priority ? `\n    <priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=1800');
    res.send(xml);
  });

  // Dedicated error codes sitemap (2,200+ diagnostic codes - HIGH SEO VALUE)
  app.get('/sitemap-error-codes.xml', async (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const host = req.headers.host || 'washbizhub.com';
    const baseUrl = `${protocol}://${host}`;
    const today = new Date().toISOString().split('T')[0];

    let errorCodeUrls: SitemapUrl[] = [];
    try {
      const allCodes = await db.select({
        slug: diagnosticCodes.slug,
        manufacturer: diagnosticCodes.manufacturer,
        code: diagnosticCodes.code,
        createdAt: diagnosticCodes.createdAt,
      }).from(diagnosticCodes)
        .where(isNotNull(diagnosticCodes.slug));

      errorCodeUrls = allCodes.map(code => {
        const majorBrand = ['Speed Queen', 'Maytag', 'Dexter', 'Huebsch', 'Continental', 'Wascomat'].includes(code.manufacturer || '');
        return {
          loc: `/error-codes/${code.slug}`,
          lastmod: code.createdAt ? new Date(code.createdAt).toISOString().split('T')[0] : today,
          changefreq: 'monthly' as const,
          priority: majorBrand ? 0.85 : 0.75
        };
      });

      // Add brand index pages
      const brands = [...new Set(allCodes.map(c => c.manufacturer).filter(Boolean))];
      brands.forEach(brand => {
        const slug = (brand || '').toLowerCase().replace(/\s+/g, '-');
        errorCodeUrls.push({
          loc: `/error-codes/brand/${slug}`,
          lastmod: today,
          changefreq: 'weekly' as const,
          priority: 0.9
        });
      });

      // Add main error codes index page
      errorCodeUrls.unshift({
        loc: '/error-codes',
        lastmod: today,
        changefreq: 'daily' as const,
        priority: 0.95
      });

    } catch (error) {
      console.error('Sitemap-error-codes: Failed to fetch codes:', error);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${errorCodeUrls.map(url => `  <url>
    <loc>${escapeXml(baseUrl + url.loc)}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}${url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : ''}${url.priority ? `\n    <priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=86400');
    res.send(xml);
  });

  // Dedicated resources sitemap
  app.get('/sitemap-resources.xml', async (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const host = req.headers.host || 'washbizhub.com';
    const baseUrl = `${protocol}://${host}`;
    const today = new Date().toISOString().split('T')[0];

    let resourceUrls: SitemapUrl[] = [
      { loc: '/resources', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      { loc: '/templates', lastmod: today, changefreq: 'weekly', priority: 0.8 },
    ];

    try {
      const allResources = await db.select({
        slug: resources.slug,
        resourceType: resources.resourceType,
        createdAt: resources.createdAt,
      }).from(resources)
        .where(eq(resources.published, true))
        .orderBy(desc(resources.createdAt));

      const resourceDetailUrls = allResources.map(resource => {
        const isCalculator = resource.resourceType === 'calculator';
        return {
          loc: `/resources/${resource.slug}`,
          lastmod: resource.createdAt ? new Date(resource.createdAt).toISOString().split('T')[0] : today,
          changefreq: 'weekly' as const,
          priority: isCalculator ? 0.85 : 0.75
        };
      });

      resourceUrls = [...resourceUrls, ...resourceDetailUrls];
    } catch (error) {
      console.error('Sitemap-resources: Failed to fetch resources:', error);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${resourceUrls.map(url => `  <url>
    <loc>${escapeXml(baseUrl + url.loc)}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}${url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : ''}${url.priority ? `\n    <priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  });

  // Dedicated courses sitemap (including individual lessons)
  app.get('/sitemap-courses.xml', async (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const host = req.headers.host || 'washbizhub.com';
    const baseUrl = `${protocol}://${host}`;
    const today = new Date().toISOString().split('T')[0];

    let courseUrls: SitemapUrl[] = [
      { loc: '/courses', lastmod: today, changefreq: 'weekly', priority: 0.9 },
      { loc: '/courses-landing', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      { loc: '/learning', lastmod: today, changefreq: 'weekly', priority: 0.8 },
    ];

    try {
      // Fetch all published courses
      const allCourses = await db.select({
        id: courses.id,
        title: courses.title,
        createdAt: courses.createdAt,
        featured: courses.featured,
      }).from(courses)
        .where(eq(courses.published, true))
        .orderBy(desc(courses.createdAt));

      // Add course detail pages
      const courseDetailUrls = allCourses.map(course => ({
        loc: `/courses/${course.id}`,
        lastmod: course.createdAt ? new Date(course.createdAt).toISOString().split('T')[0] : today,
        changefreq: 'weekly' as const,
        priority: course.featured ? 0.9 : 0.8
      }));

      courseUrls = [...courseUrls, ...courseDetailUrls];

      // Fetch all lessons for published courses
      const courseIds = allCourses.map(c => c.id);
      if (courseIds.length > 0) {
        const allLessons = await db.select({
          id: lessons.id,
          courseId: lessons.courseId,
          createdAt: lessons.createdAt,
        }).from(lessons)
          .orderBy(lessons.order);

        // Add lesson pages
        allLessons.forEach(lesson => {
          if (courseIds.includes(lesson.courseId)) {
            courseUrls.push({
              loc: `/courses/${lesson.courseId}/lessons/${lesson.id}`,
              lastmod: lesson.createdAt ? new Date(lesson.createdAt).toISOString().split('T')[0] : today,
              changefreq: 'monthly' as const,
              priority: 0.7
            });
          }
        });
      }
    } catch (error) {
      console.error('Sitemap-courses: Failed to fetch courses:', error);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${courseUrls.map(url => `  <url>
    <loc>${escapeXml(baseUrl + url.loc)}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}${url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : ''}${url.priority ? `\n    <priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  });

  // Dedicated forum sitemap
  app.get('/sitemap-forum.xml', async (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const host = req.headers.host || 'washbizhub.com';
    const baseUrl = `${protocol}://${host}`;
    const today = new Date().toISOString().split('T')[0];

    let forumUrls: SitemapUrl[] = [
      { loc: '/forum', lastmod: today, changefreq: 'daily', priority: 0.85 },
    ];

    try {
      // Fetch all forum categories
      const allCategories = await db.select({
        slug: forumCategories.slug,
        createdAt: forumCategories.createdAt,
      }).from(forumCategories)
        .orderBy(forumCategories.order);

      // Add category pages
      const categoryUrls = allCategories.map(category => ({
        loc: `/forum/category/${category.slug}`,
        lastmod: category.createdAt ? new Date(category.createdAt).toISOString().split('T')[0] : today,
        changefreq: 'daily' as const,
        priority: 0.8
      }));

      forumUrls = [...forumUrls, ...categoryUrls];

      // Fetch all forum topics (limit to most recent for performance)
      const allTopics = await db.select({
        slug: forumTopics.slug,
        createdAt: forumTopics.createdAt,
        isPinned: forumTopics.isPinned,
      }).from(forumTopics)
        .where(eq(forumTopics.status, 'active'))
        .orderBy(desc(forumTopics.createdAt))
        .limit(2000);

      // Add topic pages
      const topicUrls = allTopics.map(topic => ({
        loc: `/forum/topic/${topic.slug}`,
        lastmod: topic.createdAt ? new Date(topic.createdAt).toISOString().split('T')[0] : today,
        changefreq: 'weekly' as const,
        priority: topic.isPinned ? 0.8 : 0.7
      }));

      forumUrls = [...forumUrls, ...topicUrls];
    } catch (error) {
      console.error('Sitemap-forum: Failed to fetch forum data:', error);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${forumUrls.map(url => `  <url>
    <loc>${escapeXml(baseUrl + url.loc)}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}${url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : ''}${url.priority ? `\n    <priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=1800');
    res.send(xml);
  });

  // Dedicated vendors sitemap (stores and products)
  app.get('/sitemap-vendors.xml', async (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const host = req.headers.host || 'washbizhub.com';
    const baseUrl = `${protocol}://${host}`;
    const today = new Date().toISOString().split('T')[0];

    let vendorUrls: SitemapUrl[] = [
      { loc: '/vendors', lastmod: today, changefreq: 'weekly', priority: 0.85 },
      { loc: '/vendor-spotlight', lastmod: today, changefreq: 'weekly', priority: 0.75 },
      { loc: '/marketplace', lastmod: today, changefreq: 'daily', priority: 0.95 },
    ];

    try {
      // Fetch all active vendor stores
      const allStores = await db.select({
        storeSlug: vendorStores.storeSlug,
        createdAt: vendorStores.createdAt,
        featured: vendorStores.featured,
        verified: vendorStores.verified,
      }).from(vendorStores)
        .where(eq(vendorStores.status, 'active'))
        .orderBy(desc(vendorStores.createdAt));

      // Add store pages
      const storeUrls = allStores.map(store => ({
        loc: `/vendors/${store.storeSlug}`,
        lastmod: store.createdAt ? new Date(store.createdAt).toISOString().split('T')[0] : today,
        changefreq: 'weekly' as const,
        priority: store.featured ? 0.85 : (store.verified ? 0.8 : 0.75)
      }));

      vendorUrls = [...vendorUrls, ...storeUrls];

      // Fetch all active vendor products
      const storeIds = allStores.map(s => s.storeSlug);
      if (storeIds.length > 0) {
        const allProducts = await db.select({
          slug: vendorProducts.slug,
          storeId: vendorProducts.storeId,
          createdAt: vendorProducts.createdAt,
          featured: vendorProducts.featured,
        }).from(vendorProducts)
          .where(eq(vendorProducts.status, 'active'))
          .orderBy(desc(vendorProducts.createdAt))
          .limit(5000);

        // Get store slugs for products
        const storeMap = new Map<string, string>();
        const productStoreIds = [...new Set(allProducts.map(p => p.storeId))];
        
        if (productStoreIds.length > 0) {
          const stores = await db.select({
            id: vendorStores.id,
            storeSlug: vendorStores.storeSlug,
          }).from(vendorStores);
          
          stores.forEach(s => storeMap.set(s.id, s.storeSlug));
        }

        // Add product pages
        allProducts.forEach(product => {
          const storeSlug = storeMap.get(product.storeId);
          if (storeSlug) {
            vendorUrls.push({
              loc: `/vendors/${storeSlug}/products/${product.slug}`,
              lastmod: product.createdAt ? new Date(product.createdAt).toISOString().split('T')[0] : today,
              changefreq: 'weekly' as const,
              priority: product.featured ? 0.8 : 0.7
            });
          }
        });
      }
    } catch (error) {
      console.error('Sitemap-vendors: Failed to fetch vendor data:', error);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${vendorUrls.map(url => `  <url>
    <loc>${escapeXml(baseUrl + url.loc)}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}${url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : ''}${url.priority ? `\n    <priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  });

  // Dedicated states sitemap for sell-laundromat state pages
  app.get('/sitemap-states.xml', async (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const host = req.headers.host || 'washbizhub.com';
    const baseUrl = `${protocol}://${host}`;
    const today = new Date().toISOString().split('T')[0];

    // All 50 US states for sell-laundromat landing pages
    const states = [
      'alabama', 'alaska', 'arizona', 'arkansas', 'california',
      'colorado', 'connecticut', 'delaware', 'florida', 'georgia',
      'hawaii', 'idaho', 'illinois', 'indiana', 'iowa',
      'kansas', 'kentucky', 'louisiana', 'maine', 'maryland',
      'massachusetts', 'michigan', 'minnesota', 'mississippi', 'missouri',
      'montana', 'nebraska', 'nevada', 'new-hampshire', 'new-jersey',
      'new-mexico', 'new-york', 'north-carolina', 'north-dakota', 'ohio',
      'oklahoma', 'oregon', 'pennsylvania', 'rhode-island', 'south-carolina',
      'south-dakota', 'tennessee', 'texas', 'utah', 'vermont',
      'virginia', 'washington', 'west-virginia', 'wisconsin', 'wyoming'
    ];

    // High-value states get higher priority
    const highValueStates = ['california', 'texas', 'florida', 'new-york', 'illinois'];

    const stateUrls: SitemapUrl[] = states.map(state => ({
      loc: `/sell-laundromat/${state}`,
      lastmod: today,
      changefreq: 'monthly' as const,
      priority: highValueStates.includes(state) ? 0.9 : 0.85
    }));

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${stateUrls.map(url => `  <url>
    <loc>${escapeXml(baseUrl + url.loc)}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}${url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : ''}${url.priority ? `\n    <priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  });

  // Enhanced robots.txt with all sitemaps
  app.get('/robots.txt', (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const host = req.headers.host || 'washbizhub.com';
    const baseUrl = `${protocol}://${host}`;
    
    const robotsTxt = `# WashBizHub Robots.txt
# Maximum SEO/AEO Configuration
# The #1 Laundromat Resource & Educational Hub

User-agent: *
Allow: /

# ============================================================================
# SITEMAPS - All content indexed
# ============================================================================
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap_index.xml
Sitemap: ${baseUrl}/sitemap-blogs.xml
Sitemap: ${baseUrl}/sitemap-listings.xml
Sitemap: ${baseUrl}/sitemap-error-codes.xml
Sitemap: ${baseUrl}/sitemap-resources.xml
Sitemap: ${baseUrl}/sitemap-courses.xml
Sitemap: ${baseUrl}/sitemap-forum.xml
Sitemap: ${baseUrl}/sitemap-vendors.xml
Sitemap: ${baseUrl}/sitemap-states.xml

# ============================================================================
# ALLOW - Important public pages for crawling
# ============================================================================
Allow: /cleanbi
Allow: /cleanbi-auto
Allow: /calculators
Allow: /calculators-suite
Allow: /calculator
Allow: /roi-calculator
Allow: /valuation-calculator
Allow: /loan-calculator
Allow: /courses
Allow: /marketplace
Allow: /superstore
Allow: /resources
Allow: /templates
Allow: /blog
Allow: /listings
Allow: /error-codes
Allow: /forum
Allow: /vendors
Allow: /funding
Allow: /design-studio
Allow: /service-guy-ai
Allow: /pricing
Allow: /about
Allow: /sra

# ============================================================================
# DISALLOW - Admin and private areas
# ============================================================================
Disallow: /admin
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/
Disallow: /private/
Disallow: /settings
Disallow: /vault

# Prevent duplicate content from query parameters
Disallow: /*?*sort=
Disallow: /*?*filter=
Disallow: /*?*page=2
Disallow: /*?*page=3
Disallow: /*?*page=4
Disallow: /*?*page=5

# ============================================================================
# ALLOW - Specific API endpoints for SEO tools
# ============================================================================
Allow: /api/blog
Allow: /api/listings
Allow: /api/resources
Allow: /api/courses

# ============================================================================
# CRAWL SETTINGS
# ============================================================================
Crawl-delay: 1

# ============================================================================
# AI/LLM CRAWLERS - AEO optimization
# ============================================================================
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

User-agent: anthropic-ai
Allow: /
Crawl-delay: 2

User-agent: PerplexityBot
Allow: /
Crawl-delay: 2

User-agent: Google-Extended
Allow: /
Crawl-delay: 1

# ============================================================================
# MAJOR SEARCH ENGINES
# ============================================================================
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 1

User-agent: Yandexbot
Allow: /
Crawl-delay: 2

User-agent: DuckDuckBot
Allow: /
Crawl-delay: 1`;

    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });
}
