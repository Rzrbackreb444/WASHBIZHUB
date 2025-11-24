// ========================================
// SEO OPTIMIZATION ENGINE
// ========================================

interface SEOMetadata {
  slug: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  schemaMarkup: any;
  imageAltTexts: { url: string; alt: string }[];
  internalLinks: { url: string; anchor: string; context: string }[];
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}

export function generateCanonicalUrl(slug: string): string {
  return `https://washbizhub.com/blog/${slug}`;
}

export function generateSchemaMarkup(blog: {
  title: string;
  excerpt: string;
  content: string;
  authorName: string;
  datePublished: Date;
  dateModified: Date;
  canonicalUrl: string;
  featuredImage?: string;
}): any {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${blog.canonicalUrl}#article`,
        "headline": blog.title,
        "description": blog.excerpt,
        "image": blog.featuredImage || "https://washbizhub.com/og-default.jpg",
        "datePublished": blog.datePublished.toISOString(),
        "dateModified": blog.dateModified.toISOString(),
        "author": {
          "@type": "Organization",
          "@id": "https://washbizhub.com/#organization",
          "name": blog.authorName
        },
        "publisher": {
          "@type": "Organization",
          "@id": "https://washbizhub.com/#organization",
          "name": "WashBizHub",
          "logo": {
            "@type": "ImageObject",
            "url": "https://washbizhub.com/logo.png"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": blog.canonicalUrl
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${blog.canonicalUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://washbizhub.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Blog",
            "item": "https://washbizhub.com/blog"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": blog.title,
            "item": blog.canonicalUrl
          }
        ]
      },
      {
        "@type": "Organization",
        "@id": "https://washbizhub.com/#organization",
        "name": "WashBizHub",
        "url": "https://washbizhub.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://washbizhub.com/logo.png"
        },
        "sameAs": [
          "https://twitter.com/washbizhub",
          "https://linkedin.com/company/washbizhub"
        ]
      }
    ]
  };
}

export function injectCleanbiLinks(content: string, anchorText: string = "Try our free property analysis tool"): string {
  // Keywords to look for (case insensitive)
  const targetKeywords = [
    'due diligence',
    'property analysis',
    'business valuation',
    'ROI calculation',
    'investment analysis',
    'analyze',
    'evaluate',
    'assess'
  ];
  
  const linkHtml = ` <a href="/cleanbi-auto" data-internal-link="cleanbi-tool">${anchorText}</a>`;
  
  // Split content into paragraphs (handle both <p> and </p> variations)
  const paragraphRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  const paragraphs: Array<{ match: string; index: number; innerText: string }> = [];
  
  let match;
  // Reset regex state
  paragraphRegex.lastIndex = 0;
  
  while ((match = paragraphRegex.exec(content)) !== null) {
    paragraphs.push({
      match: match[0],
      index: match.index,
      innerText: match[1]
    });
  }
  
  // Find first paragraph containing target keywords
  let targetParagraph = paragraphs.find(p => {
    const lowerText = p.innerText.toLowerCase();
    return targetKeywords.some(keyword => lowerText.includes(keyword));
  });
  
  // If no keyword match, use first paragraph
  if (!targetParagraph && paragraphs.length > 0) {
    targetParagraph = paragraphs[0];
  }
  
  if (!targetParagraph) {
    // No paragraphs found, return original content
    return content;
  }
  
  // Find the closing </p> tag for this paragraph (case insensitive)
  const closingTagMatch = targetParagraph.match.match(/<\/p>/i);
  if (!closingTagMatch) {
    return content; // No closing tag found, return original
  }
  
  // Calculate position to insert link (before closing tag)
  const insertPosition = targetParagraph.index + targetParagraph.match.length - closingTagMatch[0].length;
  
  // Insert link
  const modifiedContent = 
    content.substring(0, insertPosition) + 
    linkHtml + 
    content.substring(insertPosition);
  
  return modifiedContent;
}

export function extractImageUrls(content: string): string[] {
  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  const urls: string[] = [];
  let match;
  
  while ((match = imgRegex.exec(content)) !== null) {
    urls.push(match[1]);
  }
  
  return urls;
}

export function generateImageAltText(imageUrl: string, blogTitle: string, context: string = ""): string {
  // Extract meaningful info from URL
  const filename = imageUrl.split('/').pop()?.split('.')[0] || '';
  const words = filename.split(/[-_]/).filter(w => w.length > 2);
  
  if (words.length > 0) {
    return `${words.join(' ')} - ${blogTitle}`;
  }
  
  return `Illustration for ${blogTitle}${context ? ': ' + context : ''}`;
}

export function addImageAltTags(content: string, blogTitle: string): string {
  return content.replace(/<img([^>]*)src="([^"]+)"([^>]*)>/g, (match, before, src, after) => {
    // Check if alt tag already exists
    if (match.includes('alt=')) {
      return match;
    }
    
    // Generate alt text
    const altText = generateImageAltText(src, blogTitle);
    
    return `<img${before}src="${src}" alt="${altText}"${after}>`;
  });
}

export function calculateSEOScore(blog: {
  metaTitle: string;
  metaDescription: string;
  content: string;
  focusKeyphrases: string[];
  slug: string;
}): number {
  let score = 100;
  
  // Meta title check (50-60 chars ideal)
  if (blog.metaTitle.length < 50 || blog.metaTitle.length > 60) {
    score -= 10;
  }
  
  // Meta description check (150-160 chars ideal)
  if (blog.metaDescription.length < 150 || blog.metaDescription.length > 160) {
    score -= 10;
  }
  
  // Focus keyphrase in title
  const titleLower = blog.metaTitle.toLowerCase();
  if (!blog.focusKeyphrases.some(kp => titleLower.includes(kp.toLowerCase()))) {
    score -= 15;
  }
  
  // Focus keyphrase in meta description
  const descLower = blog.metaDescription.toLowerCase();
  if (!blog.focusKeyphrases.some(kp => descLower.includes(kp.toLowerCase()))) {
    score -= 10;
  }
  
  // Focus keyphrase in first paragraph
  const firstPara = blog.content.substring(0, 500).toLowerCase();
  if (!blog.focusKeyphrases.some(kp => firstPara.includes(kp.toLowerCase()))) {
    score -= 10;
  }
  
  // Heading structure
  const h2Count = (blog.content.match(/<h2>/g) || []).length;
  if (h2Count < 3) score -= 10;
  if (h2Count > 8) score -= 5;
  
  // Content length
  const wordCount = blog.content.split(/\s+/).length;
  if (wordCount < 1000) score -= 15;
  if (wordCount < 500) score -= 20;
  
  // Internal links check
  if (!blog.content.includes('href=')) score -= 10;
  
  // Image alt tags
  const imgTags = blog.content.match(/<img/g) || [];
  const imgAlts = blog.content.match(/alt="/g) || [];
  if (imgTags.length > 0 && imgAlts.length < imgTags.length) {
    score -= 10;
  }
  
  return Math.max(0, Math.min(100, score));
}

export function optimizeBlogForSEO(blog: {
  title: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyphrases: string[];
  provider: string;
  qualityScore: number;
}): SEOMetadata & { optimizedContent: string; seoScore: number } {
  const slug = generateSlug(blog.title);
  const canonicalUrl = generateCanonicalUrl(slug);
  
  // Add image alt tags FIRST (before injecting links to avoid breaking image tags)
  let optimizedContent = addImageAltTags(blog.content, blog.title);
  
  // Inject CLEANBI links (after image processing)
  optimizedContent = injectCleanbiLinks(optimizedContent);
  
  // Generate schema markup
  const schemaMarkup = generateSchemaMarkup({
    title: blog.title,
    excerpt: blog.excerpt,
    content: optimizedContent,
    authorName: "WashBizHub Research Team",
    datePublished: new Date(),
    dateModified: new Date(),
    canonicalUrl,
    featuredImage: undefined
  });
  
  // Extract internal links with proper context
  const internalLinks: { url: string; anchor: string; context: string }[] = [];
  const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
  let linkMatch;
  
  while ((linkMatch = linkRegex.exec(optimizedContent)) !== null) {
    // Extract surrounding paragraph for better context
    const startPos = Math.max(0, linkMatch.index - 150);
    const endPos = Math.min(optimizedContent.length, linkMatch.index + linkMatch[0].length + 150);
    const contextSnippet = optimizedContent.substring(startPos, endPos)
      .replace(/<[^>]+>/g, '') // Remove HTML tags for clean context
      .trim();
    
    internalLinks.push({
      url: linkMatch[1],
      anchor: linkMatch[2],
      context: contextSnippet
    });
  }
  
  // Extract image alt texts
  const imageAltTexts: { url: string; alt: string }[] = [];
  const imgRegex = /<img[^>]+src="([^"]+)"[^>]+alt="([^"]+)"[^>]*>/g;
  let imgMatch;
  
  while ((imgMatch = imgRegex.exec(optimizedContent)) !== null) {
    imageAltTexts.push({
      url: imgMatch[1],
      alt: imgMatch[2]
    });
  }
  
  // Calculate SEO score
  const seoScore = calculateSEOScore({
    metaTitle: blog.metaTitle,
    metaDescription: blog.metaDescription,
    content: optimizedContent,
    focusKeyphrases: blog.focusKeyphrases,
    slug
  });
  
  return {
    slug,
    canonicalUrl,
    ogTitle: blog.metaTitle,
    ogDescription: blog.metaDescription,
    ogImage: "https://washbizhub.com/og-default.jpg",
    twitterCard: "summary_large_image",
    twitterTitle: blog.metaTitle,
    twitterDescription: blog.metaDescription,
    twitterImage: "https://washbizhub.com/og-default.jpg",
    schemaMarkup,
    imageAltTexts,
    internalLinks,
    optimizedContent,
    seoScore
  };
}
