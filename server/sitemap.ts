import type { Express } from "express";

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export function registerSitemapRoutes(app: Express) {
  // XML Sitemap
  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = 'https://washbizhub.com';
    const today = new Date().toISOString().split('T')[0];

    const urls: SitemapUrl[] = [
      // Core pages
      { loc: '/', lastmod: today, changefreq: 'daily', priority: 1.0 },
      { loc: '/marketplace', lastmod: today, changefreq: 'daily', priority: 0.9 },
      { loc: '/superstore', lastmod: today, changefreq: 'daily', priority: 0.9 },
      { loc: '/cleanbi', lastmod: today, changefreq: 'weekly', priority: 0.8 },
      { loc: '/courses', lastmod: today, changefreq: 'weekly', priority: 0.8 },
      { loc: '/book', lastmod: today, changefreq: 'monthly', priority: 0.8 },
      { loc: '/resources', lastmod: today, changefreq: 'weekly', priority: 0.8 },
      { loc: '/vendors', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/calculator', lastmod: today, changefreq: 'monthly', priority: 0.7 },
      { loc: '/roi-calculator', lastmod: today, changefreq: 'monthly', priority: 0.7 },
      { loc: '/funding-matcher', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/website-builder', lastmod: today, changefreq: 'monthly', priority: 0.7 },
      { loc: '/website-templates', lastmod: today, changefreq: 'weekly', priority: 0.6 },
      
      // Superstore pages
      { loc: '/superstore/compare', lastmod: today, changefreq: 'weekly', priority: 0.8 },
      { loc: '/buyers-guides', lastmod: today, changefreq: 'monthly', priority: 0.8 },

      // Product categories (from superstore taxonomy)
      { loc: '/superstore?category=washers', lastmod: today, changefreq: 'daily', priority: 0.8 },
      { loc: '/superstore?category=dryers', lastmod: today, changefreq: 'daily', priority: 0.8 },
      { loc: '/superstore?category=folding-tables', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/superstore?category=carts', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/superstore?category=supplies', lastmod: today, changefreq: 'daily', priority: 0.7 },
      { loc: '/superstore?category=vending', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/superstore?category=arcade', lastmod: today, changefreq: 'weekly', priority: 0.7 },

      // Individual product pages (demo products)
      { loc: '/superstore/product/DEMO001', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/superstore/product/DEMO002', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/superstore/product/DEMO003', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/superstore/product/DEMO004', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/superstore/product/DEMO005', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/superstore/product/DEMO006', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/superstore/product/DEMO007', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/superstore/product/DEMO008', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/superstore/product/DEMO009', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/superstore/product/DEMO010', lastmod: today, changefreq: 'weekly', priority: 0.7 },
      { loc: '/superstore/product/DEMO011', lastmod: today, changefreq: 'weekly', priority: 0.7 },
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${baseUrl}${url.loc}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}${url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : ''}${url.priority ? `\n    <priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  });

  // robots.txt
  app.get('/robots.txt', (req, res) => {
    const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: https://washbizhub.com/sitemap.xml

# Disallow admin and private areas
Disallow: /admin
Disallow: /api/

# Crawl delay (be nice to the server)
Crawl-delay: 1`;

    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });
}
