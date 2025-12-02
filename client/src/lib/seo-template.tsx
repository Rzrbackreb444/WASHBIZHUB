/**
 * WashBizHub Master SEO Template
 * 
 * FULL-TILT OPTIMIZATION:
 * - E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
 * - AEO (Answer Engine Optimization) for AI search engines
 * - Schema.org structured data (Organization, Article, FAQ, Review, Product, HowTo)
 * - SERP optimization (rich snippets, sitelinks, featured snippets)
 * - Core Web Vitals (LCP, FID, CLS optimization)
 * - Responsive design (mobile-first, all devices)
 * - Speed optimization (lazy loading, preload, prefetch)
 * - Premium typography (Bebas Neue + Inter)
 * - Social media optimization (OpenGraph, Twitter Cards, LinkedIn)
 * - Indexing signals (canonical, hreflang, robots)
 */

import { Helmet } from 'react-helmet-async';

// ===== TYPE DEFINITIONS =====

export interface SEOAuthor {
  name: string;
  url?: string;
  image?: string;
  jobTitle?: string;
  credentials?: string[];
  experience?: string;
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
  };
}

export interface SEOReview {
  author: string;
  rating: number;
  reviewBody: string;
  datePublished?: string;
}

export interface SEOFAQ {
  question: string;
  answer: string;
}

export interface SEOBreadcrumb {
  name: string;
  url: string;
}

export interface SEOHowToStep {
  name: string;
  text: string;
  image?: string;
}

export interface SEOProduct {
  name: string;
  description: string;
  price?: number;
  priceCurrency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  brand?: string;
  sku?: string;
}

export interface MasterSEOProps {
  // Core Meta
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
  
  // Page Type
  pageType: 'calculator' | 'article' | 'product' | 'landing' | 'tool' | 'blog' | 'directory' | 'marketplace';
  
  // E-E-A-T Signals
  author?: SEOAuthor;
  datePublished?: string;
  dateModified?: string;
  expertise?: string[];
  certifications?: string[];
  
  // AEO (Answer Engine Optimization)
  primaryQuestion?: string;
  directAnswer?: string;
  relatedQuestions?: string[];
  
  // Structured Data
  faqs?: SEOFAQ[];
  reviews?: SEOReview[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
  };
  howToSteps?: SEOHowToStep[];
  product?: SEOProduct;
  
  // Navigation
  breadcrumbs?: SEOBreadcrumb[];
  
  // Social Media
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  twitterCard?: 'summary' | 'summary_large_image';
  
  // Technical
  noIndex?: boolean;
  noFollow?: boolean;
  hreflang?: { lang: string; url: string }[];
  
  // Speed Hints
  preloadImages?: string[];
  prefetchUrls?: string[];
  
  // Industry-Specific
  industry?: 'laundromat' | 'healthcare';
  serviceArea?: string[];
}

// ===== ORGANIZATION SCHEMA =====

const ORGANIZATION_SCHEMA = {
  "@type": "Organization",
  "@id": "https://washbizhub.com/#organization",
  "name": "WashBizHub",
  "url": "https://washbizhub.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://washbizhub.com/logo.png",
    "width": 512,
    "height": 512
  },
  "description": "The #1 laundromat business intelligence platform. CLEANBI scoring, valuation tools, calculators, and AI-powered insights.",
  "foundingDate": "2024",
  "sameAs": [
    "https://www.facebook.com/washbizhub",
    "https://twitter.com/washbizhub",
    "https://www.linkedin.com/company/washbizhub",
    "https://www.youtube.com/@washbizhub"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-479-883-4314",
    "contactType": "customer service",
    "email": "nick@washbizhub.com",
    "availableLanguage": ["English", "Spanish"]
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "US"
  }
};

// ===== WEBSITE SCHEMA =====

const WEBSITE_SCHEMA = {
  "@type": "WebSite",
  "@id": "https://washbizhub.com/#website",
  "url": "https://washbizhub.com",
  "name": "WashBizHub",
  "description": "The #1 laundromat business intelligence platform",
  "publisher": { "@id": "https://washbizhub.com/#organization" },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://washbizhub.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

// ===== DEFAULT AUTHOR (Nick - Industry Expert) =====

export const DEFAULT_AUTHOR: SEOAuthor = {
  name: "Nick",
  url: "https://washbizhub.com/about",
  jobTitle: "Laundromat Industry Expert & Founder",
  credentials: [
    "20+ years laundromat industry experience",
    "Certified Business Valuator",
    "Former multi-location operator"
  ],
  experience: "Founded WashBizHub after operating multiple laundromats. Expert in CLEANBI methodology, equipment valuation, and operational optimization.",
  socialProfiles: {
    linkedin: "https://linkedin.com/in/washbizhub",
    twitter: "https://twitter.com/washbizhub"
  }
};

// ===== MASTER SEO COMPONENT =====

export function MasterSEO({
  title,
  description,
  keywords,
  canonicalUrl,
  pageType,
  author = DEFAULT_AUTHOR,
  datePublished,
  dateModified,
  expertise = [],
  certifications = [],
  primaryQuestion,
  directAnswer,
  relatedQuestions = [],
  faqs = [],
  reviews = [],
  aggregateRating,
  howToSteps = [],
  product,
  breadcrumbs = [],
  ogImage = "https://washbizhub.com/og-image.png",
  ogType = "website",
  twitterCard = "summary_large_image",
  noIndex = false,
  noFollow = false,
  hreflang = [],
  preloadImages = [],
  prefetchUrls = [],
  industry = "laundromat",
  serviceArea = ["United States"]
}: MasterSEOProps) {
  
  const fullTitle = `${title} | WashBizHub`;
  const currentUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : 'https://washbizhub.com');
  const publishDate = datePublished || new Date().toISOString();
  const modifiedDate = dateModified || new Date().toISOString();
  
  // Build JSON-LD structured data
  const structuredData: any[] = [
    { "@context": "https://schema.org", ...ORGANIZATION_SCHEMA },
    { "@context": "https://schema.org", ...WEBSITE_SCHEMA }
  ];
  
  // WebPage Schema with E-E-A-T signals
  const webPageSchema: any = {
    "@context": "https://schema.org",
    "@type": pageType === 'article' || pageType === 'blog' ? "Article" : 
             pageType === 'calculator' || pageType === 'tool' ? "WebApplication" :
             pageType === 'product' ? "Product" : "WebPage",
    "@id": `${currentUrl}#webpage`,
    "url": currentUrl,
    "name": title,
    "description": description,
    "isPartOf": { "@id": "https://washbizhub.com/#website" },
    "publisher": { "@id": "https://washbizhub.com/#organization" },
    "datePublished": publishDate,
    "dateModified": modifiedDate,
    "inLanguage": "en-US",
    "keywords": keywords.join(", "),
    "mainEntityOfPage": currentUrl
  };
  
  // Add author for E-E-A-T
  if (author) {
    webPageSchema.author = {
      "@type": "Person",
      "name": author.name,
      "url": author.url,
      "jobTitle": author.jobTitle,
      "description": author.experience,
      "knowsAbout": expertise,
      "hasCredential": author.credentials?.map(c => ({
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": c
      }))
    };
    if (author.socialProfiles) {
      webPageSchema.author.sameAs = Object.values(author.socialProfiles).filter(Boolean);
    }
  }
  
  // Add aggregate rating
  if (aggregateRating) {
    webPageSchema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": aggregateRating.ratingValue,
      "reviewCount": aggregateRating.reviewCount,
      "bestRating": aggregateRating.bestRating || 5,
      "worstRating": 1
    };
  }
  
  // Add reviews
  if (reviews.length > 0) {
    webPageSchema.review = reviews.map(r => ({
      "@type": "Review",
      "author": { "@type": "Person", "name": r.author },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": r.rating,
        "bestRating": 5
      },
      "reviewBody": r.reviewBody,
      "datePublished": r.datePublished || publishDate
    }));
  }
  
  structuredData.push(webPageSchema);
  
  // FAQ Schema for AEO
  if (faqs.length > 0) {
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    });
  }
  
  // HowTo Schema (for calculators/tools)
  if (howToSteps.length > 0) {
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": title,
      "description": description,
      "step": howToSteps.map((step, i) => ({
        "@type": "HowToStep",
        "position": i + 1,
        "name": step.name,
        "text": step.text,
        ...(step.image && { "image": step.image })
      }))
    });
  }
  
  // Product Schema
  if (product) {
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.description,
      ...(product.brand && { "brand": { "@type": "Brand", "name": product.brand } }),
      ...(product.sku && { "sku": product.sku }),
      ...(product.price && {
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": product.priceCurrency || "USD",
          "availability": `https://schema.org/${product.availability || 'InStock'}`
        }
      }),
      ...(aggregateRating && {
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": aggregateRating.ratingValue,
          "reviewCount": aggregateRating.reviewCount
        }
      })
    });
  }
  
  // Breadcrumb Schema
  if (breadcrumbs.length > 0) {
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://washbizhub.com" },
        ...breadcrumbs.map((bc, i) => ({
          "@type": "ListItem",
          "position": i + 2,
          "name": bc.name,
          "item": bc.url
        }))
      ]
    });
  }
  
  // Speakable Schema for AEO (voice search)
  if (primaryQuestion && directAnswer) {
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": [".speakable-content", ".primary-answer"]
      },
      "mainEntity": {
        "@type": "Question",
        "name": primaryQuestion,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": directAnswer
        }
      }
    });
  }
  
  // Service Schema for local SEO
  if (industry === 'laundromat') {
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "name": "WashBizHub Consulting",
      "description": "Expert laundromat business consulting, valuation, and intelligence services",
      "areaServed": serviceArea.map(area => ({ "@type": "Country", "name": area })),
      "serviceType": [
        "Business Valuation",
        "Location Analysis",
        "Equipment Appraisal",
        "Operational Consulting"
      ]
    });
  }
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      <meta name="author" content={author?.name || "WashBizHub"} />
      <link rel="canonical" href={currentUrl} />
      
      {/* Robots */}
      <meta name="robots" content={`${noIndex ? 'noindex' : 'index'}, ${noFollow ? 'nofollow' : 'follow'}, max-image-preview:large, max-snippet:-1, max-video-preview:-1`} />
      <meta name="googlebot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />
      <meta name="bingbot" content="index, follow" />
      
      {/* E-E-A-T Signals */}
      <meta name="article:author" content={author?.name} />
      <meta name="article:published_time" content={publishDate} />
      <meta name="article:modified_time" content={modifiedDate} />
      {expertise.length > 0 && <meta name="expertise" content={expertise.join(", ")} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="WashBizHub" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@washbizhub" />
      <meta name="twitter:creator" content="@washbizhub" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* LinkedIn */}
      <meta property="linkedin:owner" content="washbizhub" />
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#1e3a5f" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Performance / Speed Optimization */}
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Preload Critical Resources */}
      {preloadImages.map((img, i) => (
        <link key={`preload-img-${i}`} rel="preload" as="image" href={img} />
      ))}
      
      {/* Prefetch Future Navigation */}
      {prefetchUrls.map((url, i) => (
        <link key={`prefetch-${i}`} rel="prefetch" href={url} />
      ))}
      
      {/* DNS Prefetch for External Resources */}
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      <link rel="dns-prefetch" href="https://maps.googleapis.com" />
      
      {/* Preconnect for Speed */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Premium Typography */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&display=swap" 
        rel="stylesheet" 
      />
      
      {/* Hreflang for International */}
      {hreflang.map((hl, i) => (
        <link key={`hreflang-${i}`} rel="alternate" hrefLang={hl.lang} href={hl.url} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={currentUrl} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      {/* AEO: Primary Question/Answer for Voice Search */}
      {primaryQuestion && directAnswer && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "QAPage",
            "mainEntity": {
              "@type": "Question",
              "name": primaryQuestion,
              "answerCount": 1,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": directAnswer,
                "author": { "@type": "Organization", "name": "WashBizHub" }
              }
            }
          })}
        </script>
      )}
    </Helmet>
  );
}

// ===== COMMON SEO PRESETS =====

export const SEO_PRESETS = {
  calculator: {
    pageType: 'calculator' as const,
    ogType: 'website' as const,
    twitterCard: 'summary_large_image' as const,
    expertise: [
      "Laundromat financial analysis",
      "Business valuation",
      "Operational optimization",
      "Industry benchmarking"
    ]
  },
  blog: {
    pageType: 'blog' as const,
    ogType: 'article' as const,
    twitterCard: 'summary_large_image' as const,
    expertise: [
      "Laundromat industry insights",
      "Business strategies",
      "Market analysis"
    ]
  },
  tool: {
    pageType: 'tool' as const,
    ogType: 'website' as const,
    twitterCard: 'summary_large_image' as const,
    expertise: [
      "AI-powered analysis",
      "Equipment diagnostics",
      "Location intelligence"
    ]
  },
  marketplace: {
    pageType: 'marketplace' as const,
    ogType: 'website' as const,
    twitterCard: 'summary_large_image' as const,
    expertise: [
      "Laundromat listings",
      "Business brokerage",
      "Deal analysis"
    ]
  }
};

// ===== INDUSTRY KEYWORDS DATABASE =====

export const INDUSTRY_KEYWORDS = {
  calculators: [
    "laundromat calculator", "laundry business calculator", "coin laundry ROI",
    "laundromat profit calculator", "laundry mat revenue calculator",
    "commercial laundry calculator", "laundromat valuation calculator"
  ],
  cleanbi: [
    "CLEANBI score", "laundromat location analysis", "laundry business scoring",
    "laundromat due diligence", "coin laundry evaluation", "laundromat investment score"
  ],
  utilities: [
    "laundromat utility costs", "cost per load calculator", "UPG ratio",
    "laundry utility efficiency", "water cost per wash", "electric cost laundromat"
  ],
  labor: [
    "laundromat labor costs", "laundry staffing calculator", "WDF efficiency",
    "wash dry fold calculator", "laundromat employee optimization"
  ],
  equipment: [
    "commercial washer value", "laundromat equipment appraisal", "dryer depreciation",
    "Speed Queen value", "Dexter washer price", "used laundry equipment value"
  ],
  diagnostics: [
    "laundromat error codes", "commercial washer error", "dryer fault codes",
    "Speed Queen error code", "Dexter error E43", "Maytag commercial error"
  ],
  location: [
    "where to open laundromat", "laundromat site selection", "coin laundry location",
    "laundromat market analysis", "laundry business location"
  ],
  valuation: [
    "how much is laundromat worth", "laundromat valuation", "coin laundry value",
    "laundromat EBITDA multiple", "laundry business appraisal"
  ]
};

// ===== HELPER: Generate Complete Keywords =====

export function generateKeywords(
  category: keyof typeof INDUSTRY_KEYWORDS,
  additionalKeywords: string[] = []
): string[] {
  return [...INDUSTRY_KEYWORDS[category], ...additionalKeywords];
}

// ===== HELPER: Generate FAQ Schema =====

export function generateFAQs(items: { q: string; a: string }[]): SEOFAQ[] {
  return items.map(item => ({
    question: item.q,
    answer: item.a
  }));
}

// ===== HELPER: Generate Reviews =====

export function generateReviews(items: { author: string; rating: number; text: string }[]): SEOReview[] {
  return items.map(item => ({
    author: item.author,
    rating: item.rating,
    reviewBody: item.text,
    datePublished: new Date().toISOString()
  }));
}

// ===== HELPER: Generate Breadcrumbs =====

export function generateBreadcrumbs(path: { name: string; slug: string }[]): SEOBreadcrumb[] {
  return path.map(p => ({
    name: p.name,
    url: `https://washbizhub.com${p.slug}`
  }));
}

export default MasterSEO;
