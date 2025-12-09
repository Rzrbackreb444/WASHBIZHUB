import { db } from '../db';
import { sql } from 'drizzle-orm';

interface RenderContext {
  projectId: string;
  subdomain?: string;
  customDomain?: string;
}

interface SiteData {
  project: any;
  pages: any[];
  sections: Record<string, any[]>;
  businessProfile?: any;
}

export async function loadSiteData(projectId: string): Promise<SiteData | null> {
  // Load project
  const projectResult = await db.execute(sql`
    SELECT * FROM site_projects WHERE id = ${projectId} AND is_published = true
  `);
  
  if (projectResult.rows.length === 0) return null;
  const project = projectResult.rows[0] as any;
  
  // Load pages
  const pagesResult = await db.execute(sql`
    SELECT * FROM site_pages WHERE project_id = ${projectId} AND is_published = true
    ORDER BY "order" ASC
  `);
  const pages = pagesResult.rows as any[];
  
  // Load sections for each page
  const sections: Record<string, any[]> = {};
  for (const page of pages) {
    const sectionsResult = await db.execute(sql`
      SELECT * FROM page_sections WHERE page_id = ${page.id}
      ORDER BY "order" ASC
    `);
    sections[page.id] = sectionsResult.rows as any[];
  }
  
  // Try to load business profile
  let businessProfile = null;
  const profileResult = await db.execute(sql`
    SELECT * FROM business_profiles WHERE project_id = ${projectId} LIMIT 1
  `);
  if (profileResult.rows.length > 0) {
    businessProfile = profileResult.rows[0];
  }
  
  return { project, pages, sections, businessProfile };
}

export function renderSection(section: any, theme: any): string {
  const content = section.content || {};
  const bgColor = section.background_color || theme.secondaryColor || '#1a2332';
  const padding = section.padding === 'large' ? 'py-20' : section.padding === 'small' ? 'py-8' : 'py-16';
  
  switch (section.type) {
    case 'hero':
      return `
        <section class="relative ${padding} text-white" style="background: linear-gradient(135deg, ${bgColor} 0%, ${theme.primaryColor || '#C8A661'} 100%);">
          <div class="max-w-6xl mx-auto px-6 text-center">
            <h1 class="text-5xl md:text-6xl font-bold mb-6">${escapeHtml(content.headline || 'Welcome')}</h1>
            <p class="text-xl md:text-2xl mb-8 opacity-90">${escapeHtml(content.subheadline || '')}</p>
            ${content.ctaText ? `<a href="${escapeHtml(content.ctaLink || '#')}" class="inline-block px-8 py-4 rounded-lg font-semibold text-lg transition-transform hover:scale-105" style="background: ${theme.primaryColor || '#C8A661'}; color: #fff;">${escapeHtml(content.ctaText)}</a>` : ''}
          </div>
        </section>
      `;
    
    case 'features':
      const features = content.features || [];
      return `
        <section class="${padding} bg-white">
          <div class="max-w-6xl mx-auto px-6">
            <h2 class="text-3xl font-bold text-center mb-12" style="color: ${bgColor};">${escapeHtml(content.title || 'Our Features')}</h2>
            <div class="grid md:grid-cols-3 gap-8">
              ${features.map((f: any) => `
                <div class="text-center p-6 rounded-xl bg-gray-50">
                  <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style="background: ${theme.primaryColor || '#C8A661'}20;">
                    <span class="text-2xl">${f.icon || '✨'}</span>
                  </div>
                  <h3 class="text-xl font-semibold mb-2">${escapeHtml(f.title || '')}</h3>
                  <p class="text-gray-600">${escapeHtml(f.description || '')}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </section>
      `;
    
    case 'services':
      const services = content.services || [];
      return `
        <section class="${padding}" style="background: ${bgColor};">
          <div class="max-w-6xl mx-auto px-6">
            <h2 class="text-3xl font-bold text-center mb-12 text-white">${escapeHtml(content.title || 'Our Services')}</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              ${services.map((s: any) => `
                <div class="bg-white rounded-xl p-6 text-center shadow-lg">
                  <h3 class="text-lg font-semibold mb-2">${escapeHtml(s.name || '')}</h3>
                  <p class="text-2xl font-bold mb-2" style="color: ${theme.primaryColor || '#C8A661'};">${escapeHtml(s.price || '')}</p>
                  <p class="text-gray-600 text-sm">${escapeHtml(s.description || '')}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </section>
      `;
    
    case 'testimonials':
      const testimonials = content.testimonials || [];
      return `
        <section class="${padding} bg-gray-50">
          <div class="max-w-6xl mx-auto px-6">
            <h2 class="text-3xl font-bold text-center mb-12">${escapeHtml(content.title || 'What Our Customers Say')}</h2>
            <div class="grid md:grid-cols-3 gap-8">
              ${testimonials.map((t: any) => `
                <div class="bg-white rounded-xl p-6 shadow-md">
                  <div class="flex items-center mb-4">
                    <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold" style="background: ${theme.primaryColor || '#C8A661'}; color: white;">
                      ${(t.name || 'A')[0].toUpperCase()}
                    </div>
                    <div class="ml-4">
                      <p class="font-semibold">${escapeHtml(t.name || 'Customer')}</p>
                      <p class="text-sm text-gray-500">${'★'.repeat(t.rating || 5)}</p>
                    </div>
                  </div>
                  <p class="text-gray-600 italic">"${escapeHtml(t.text || '')}"</p>
                </div>
              `).join('')}
            </div>
          </div>
        </section>
      `;
    
    case 'contact':
      return `
        <section class="${padding}" style="background: ${bgColor};">
          <div class="max-w-4xl mx-auto px-6 text-center text-white">
            <h2 class="text-3xl font-bold mb-6">${escapeHtml(content.title || 'Contact Us')}</h2>
            <p class="text-xl mb-8">${escapeHtml(content.subtitle || '')}</p>
            <div class="grid md:grid-cols-3 gap-6 text-center">
              ${content.phone ? `<div><p class="font-semibold">Phone</p><p>${escapeHtml(content.phone)}</p></div>` : ''}
              ${content.email ? `<div><p class="font-semibold">Email</p><p>${escapeHtml(content.email)}</p></div>` : ''}
              ${content.address ? `<div><p class="font-semibold">Address</p><p>${escapeHtml(content.address)}</p></div>` : ''}
            </div>
          </div>
        </section>
      `;
    
    case 'hours':
      const hours = content.hours || [];
      return `
        <section class="${padding} bg-white">
          <div class="max-w-2xl mx-auto px-6">
            <h2 class="text-3xl font-bold text-center mb-8">${escapeHtml(content.title || 'Hours of Operation')}</h2>
            <div class="space-y-3">
              ${hours.map((h: any) => `
                <div class="flex justify-between py-2 border-b">
                  <span class="font-medium">${escapeHtml(h.day || '')}</span>
                  <span class="text-gray-600">${escapeHtml(h.hours || 'Closed')}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </section>
      `;
    
    case 'cta':
      return `
        <section class="${padding} text-center text-white" style="background: linear-gradient(135deg, ${theme.primaryColor || '#C8A661'} 0%, ${bgColor} 100%);">
          <div class="max-w-4xl mx-auto px-6">
            <h2 class="text-4xl font-bold mb-6">${escapeHtml(content.headline || 'Ready to Get Started?')}</h2>
            <p class="text-xl mb-8 opacity-90">${escapeHtml(content.subheadline || '')}</p>
            ${content.buttonText ? `<a href="${escapeHtml(content.buttonLink || '#')}" class="inline-block px-8 py-4 bg-white rounded-lg font-semibold text-lg transition-transform hover:scale-105" style="color: ${bgColor};">${escapeHtml(content.buttonText)}</a>` : ''}
          </div>
        </section>
      `;
    
    default:
      return `<section class="${padding}"><div class="max-w-6xl mx-auto px-6">${JSON.stringify(content)}</div></section>`;
  }
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderFullPage(siteData: SiteData, pageSlug: string = 'home'): string {
  const { project, pages, sections, businessProfile } = siteData;
  
  // Find the page
  const page = pages.find(p => p.slug === pageSlug) || pages[0];
  if (!page) return render404(project);
  
  const pageSections = sections[page.id] || [];
  const theme = {
    primaryColor: project.primary_color || '#C8A661',
    secondaryColor: project.secondary_color || '#1a2332',
    fontFamily: project.font_family || 'Inter',
  };
  
  const businessName = businessProfile?.business_name || project.name || 'My Business';
  const siteTitle = page.meta_title || page.title || businessName;
  const siteDescription = page.meta_description || project.site_description || '';
  
  // Navigation
  const navHtml = `
    <nav class="sticky top-0 z-50 bg-white shadow-sm">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" class="text-2xl font-bold" style="color: ${theme.secondaryColor};">${escapeHtml(businessName)}</a>
        <div class="hidden md:flex items-center gap-6">
          ${pages.map(p => `<a href="/${p.slug === 'home' ? '' : p.slug}" class="text-gray-600 hover:text-gray-900 transition-colors">${escapeHtml(p.name)}</a>`).join('')}
        </div>
        <button class="md:hidden p-2" onclick="document.getElementById('mobile-menu').classList.toggle('hidden')">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>
      <div id="mobile-menu" class="hidden md:hidden px-6 pb-4">
        ${pages.map(p => `<a href="/${p.slug === 'home' ? '' : p.slug}" class="block py-2 text-gray-600">${escapeHtml(p.name)}</a>`).join('')}
      </div>
    </nav>
  `;
  
  // Footer
  const footerHtml = `
    <footer class="py-12 text-white" style="background: ${theme.secondaryColor};">
      <div class="max-w-6xl mx-auto px-6">
        <div class="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 class="text-xl font-bold mb-4">${escapeHtml(businessName)}</h3>
            <p class="text-gray-300">${escapeHtml(businessProfile?.description || project.description || '')}</p>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-4">Quick Links</h3>
            ${pages.slice(0, 5).map(p => `<a href="/${p.slug === 'home' ? '' : p.slug}" class="block text-gray-300 hover:text-white mb-2">${escapeHtml(p.name)}</a>`).join('')}
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-4">Contact</h3>
            ${businessProfile?.phone ? `<p class="text-gray-300 mb-2">${escapeHtml(businessProfile.phone)}</p>` : ''}
            ${businessProfile?.email ? `<p class="text-gray-300 mb-2">${escapeHtml(businessProfile.email)}</p>` : ''}
            ${businessProfile?.address ? `<p class="text-gray-300">${escapeHtml(businessProfile.address)}</p>` : ''}
          </div>
        </div>
        <div class="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; ${new Date().getFullYear()} ${escapeHtml(businessName)}. All rights reserved.</p>
          <p class="mt-2 text-sm">Powered by <a href="https://washbizhub.com" class="underline hover:text-white">WashBizHub</a></p>
        </div>
      </div>
    </footer>
  `;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(siteTitle)}</title>
  <meta name="description" content="${escapeHtml(siteDescription)}">
  ${page.og_title ? `<meta property="og:title" content="${escapeHtml(page.og_title)}">` : ''}
  ${page.og_description ? `<meta property="og:description" content="${escapeHtml(page.og_description)}">` : ''}
  ${page.og_image ? `<meta property="og:image" content="${escapeHtml(page.og_image)}">` : ''}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${theme.fontFamily.replace(' ', '+')}:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: '${theme.fontFamily}', sans-serif; }
  </style>
</head>
<body class="bg-white text-gray-900">
  ${navHtml}
  <main>
    ${pageSections.map(s => renderSection(s, theme)).join('\n')}
  </main>
  ${footerHtml}
</body>
</html>`;
}

function render404(project: any): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen flex items-center justify-center bg-gray-100">
  <div class="text-center">
    <h1 class="text-6xl font-bold text-gray-300 mb-4">404</h1>
    <p class="text-xl text-gray-600 mb-8">Page not found</p>
    <a href="/" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Go Home</a>
  </div>
</body>
</html>`;
}

export function renderSiteNotFound(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Site Not Found - WashBizHub</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
  <div class="text-center text-white">
    <h1 class="text-6xl font-bold mb-4">Site Not Found</h1>
    <p class="text-xl text-gray-300 mb-8">This website doesn't exist or hasn't been published yet.</p>
    <a href="https://washbizhub.com" class="px-8 py-4 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors">Visit WashBizHub</a>
  </div>
</body>
</html>`;
}
