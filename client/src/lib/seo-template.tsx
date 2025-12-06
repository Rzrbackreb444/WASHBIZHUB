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

// ===== INDUSTRY KEYWORDS DATABASE (ENHANCED FOR SEARCH DOMINANCE) =====

export const INDUSTRY_KEYWORDS = {
  calculators: [
    "laundromat calculator", "laundry business calculator", "coin laundry ROI",
    "laundromat profit calculator", "laundry mat revenue calculator",
    "commercial laundry calculator", "laundromat valuation calculator",
    "laundromat income calculator", "laundromat cash flow calculator",
    "laundromat break-even calculator", "laundromat investment calculator",
    "how to calculate laundromat profits", "laundromat payback period calculator"
  ],
  cleanbi: [
    "CLEANBI score", "laundromat location analysis", "laundry business scoring",
    "laundromat due diligence", "coin laundry evaluation", "laundromat investment score",
    "laundromat site analysis tool", "laundromat location intelligence",
    "is this laundromat location good", "laundromat demographic analysis",
    "laundromat competition analysis", "laundromat market opportunity score"
  ],
  utilities: [
    "laundromat utility costs", "cost per load calculator", "UPG ratio",
    "laundry utility efficiency", "water cost per wash", "electric cost laundromat",
    "laundromat gas costs", "utilities as percent of gross", "laundromat operating costs",
    "reduce laundromat utility bills", "commercial laundry water usage"
  ],
  labor: [
    "laundromat labor costs", "laundry staffing calculator", "WDF efficiency",
    "wash dry fold calculator", "laundromat employee optimization",
    "laundromat labor cost percentage", "how many employees laundromat needs",
    "laundromat payroll calculator", "attendant vs unattended laundromat costs"
  ],
  equipment: [
    "commercial washer value", "laundromat equipment appraisal", "dryer depreciation",
    "Speed Queen value", "Dexter washer price", "used laundry equipment value",
    "laundromat equipment cost", "commercial washer price 2024",
    "best commercial washer for laundromat", "laundromat equipment financing",
    "washer extractor value", "coin operated washer price"
  ],
  diagnostics: [
    "laundromat error codes", "commercial washer error", "dryer fault codes",
    "Speed Queen error code", "Dexter error E43", "Maytag commercial error",
    "commercial washer troubleshooting", "laundromat repair guide",
    "washer not draining error", "dryer not heating troubleshooting"
  ],
  location: [
    "where to open laundromat", "laundromat site selection", "coin laundry location",
    "laundromat market analysis", "laundry business location",
    "best location for laundromat", "laundromat demographic requirements",
    "how to find laundromat location", "laundromat near apartments"
  ],
  valuation: [
    "how much is laundromat worth", "laundromat valuation", "coin laundry value",
    "laundromat EBITDA multiple", "laundry business appraisal",
    "laundromat SDE multiple", "laundromat valuation multiples 2024",
    "selling price laundromat", "laundromat net operating income",
    "what is my laundromat worth", "laundromat business value calculator"
  ],
  marketplace: [
    "laundromat for sale", "buy laundromat", "laundromats for sale near me",
    "coin laundry for sale", "laundromat business for sale",
    "how to buy a laundromat", "laundromat listings", "sell my laundromat",
    "laundromat broker", "laundromat for sale by owner"
  ],
  funding: [
    "laundromat financing", "laundromat loan", "SBA loan laundromat",
    "laundromat equipment financing", "how to finance a laundromat",
    "laundromat startup funding", "commercial laundry business loan",
    "laundromat acquisition loan", "no money down laundromat"
  ],
  roi: [
    "laundromat ROI", "is a laundromat a good investment", "laundromat profit margins",
    "laundromat return on investment", "how much do laundromats make",
    "laundromat passive income", "laundromat investment return",
    "average laundromat profit", "laundromat income potential"
  ],
  startup: [
    "how to start a laundromat", "laundromat startup costs", "open a laundromat",
    "laundromat business plan", "starting a laundromat with no money",
    "laundromat startup guide", "build vs buy laundromat",
    "laundromat franchise cost", "self service laundry business"
  ]
};

// ===== PAGE-SPECIFIC SEO CONFIGURATIONS =====

export interface PageSEOConfig {
  title: string;
  description: string;
  focusKeyphrase: string;
  keywords: string[];
  ogImage?: string;
  primaryQuestion?: string;
  directAnswer?: string;
  faqs?: { q: string; a: string }[];
}

export const PAGE_SEO_CONFIGS: Record<string, PageSEOConfig> = {
  home: {
    title: "WashBizHub - #1 Laundromat Business Intelligence Platform",
    description: "The leading platform for laundromat investors. CLEANBI location scoring, valuation calculators, equipment marketplace, and AI-powered business tools. Join 2,400+ operators.",
    focusKeyphrase: "laundromat business intelligence",
    keywords: ["laundromat", "coin laundry", "laundry business", "laundromat investment", "CLEANBI", "laundromat valuation", "laundromat for sale"],
    primaryQuestion: "What is the best platform for laundromat investors?",
    directAnswer: "WashBizHub is the #1 laundromat business intelligence platform, offering CLEANBI location scoring, valuation calculators, and AI-powered tools trusted by 2,400+ operators."
  },
  cleanbiExplorer: {
    title: "CLEANBI Explorer - AI-Powered Laundromat Location Analysis Tool",
    description: "Score any laundromat location instantly with CLEANBI. Analyze demographics, competition, traffic, and 50+ data points to find the perfect investment opportunity. Free analysis available.",
    focusKeyphrase: "laundromat location analysis",
    keywords: ["CLEANBI", "laundromat location score", "laundromat site analysis", "coin laundry evaluation", "laundromat due diligence", "laundromat investment score", "laundromat demographic analysis"],
    primaryQuestion: "How do I analyze a laundromat location before buying?",
    directAnswer: "Use CLEANBI Explorer to instantly score any laundromat location. It analyzes demographics, competition, traffic patterns, and 50+ data points to reveal hidden investment opportunities.",
    faqs: [
      { q: "What is a CLEANBI score?", a: "CLEANBI is a proprietary scoring system that rates laundromat locations from A to C based on demographics, competition, traffic, accessibility, economic factors, and location quality." },
      { q: "Is CLEANBI free to use?", a: "Yes, you get 3 free CLEANBI analyses. Unlimited analyses are available with Starter ($29/mo) or Pro ($99/mo) subscriptions." },
      { q: "What data does CLEANBI analyze?", a: "CLEANBI analyzes 6 key factors: Demographics (population, income, renters), Competition (nearby laundromats), Traffic (foot/vehicle), Accessibility (parking, transit), Economic indicators, and Location Quality." }
    ]
  },
  valuationCalculator: {
    title: "Free Laundromat Valuation Calculator - 4 Methods | WashBizHub",
    description: "Calculate your laundromat's value using 4 professional methods: SDE Multiple (3.16x-4.25x), EBITDA, Gross Revenue, and Asset-Based valuation. Instant results.",
    focusKeyphrase: "laundromat valuation calculator",
    keywords: ["laundromat valuation", "how much is my laundromat worth", "laundromat value calculator", "laundromat EBITDA multiple", "laundromat SDE multiple", "coin laundry valuation", "laundry business appraisal"],
    primaryQuestion: "How much is my laundromat worth?",
    directAnswer: "Laundromats typically sell for 3.16x-4.25x SDE (Seller's Discretionary Earnings) or 3.44x-4.85x EBITDA. Use our free calculator to get an instant valuation based on your financials.",
    faqs: [
      { q: "What multiple do laundromats sell for?", a: "Laundromats typically sell for 3.5x-5x net operating income, or 3.16x-4.25x SDE. Premium locations with newer equipment can command higher multiples." },
      { q: "What is SDE for a laundromat?", a: "Seller's Discretionary Earnings (SDE) is net profit plus owner's salary, benefits, and discretionary expenses. It represents the true economic benefit to an owner-operator." }
    ]
  },
  roiCalculator: {
    title: "Laundromat ROI Calculator - Calculate Investment Returns | WashBizHub",
    description: "Calculate laundromat ROI and investment returns with our free calculator. Project 5-year cash flows, payback period, and annual returns. Average ROI is 20-35%.",
    focusKeyphrase: "laundromat ROI calculator",
    keywords: ["laundromat ROI", "laundromat return on investment", "is a laundromat a good investment", "laundromat profit calculator", "laundromat cash flow", "laundromat investment returns"],
    primaryQuestion: "What is the average ROI on a laundromat?",
    directAnswer: "Laundromats typically generate 20-35% annual ROI with a 3-5 year payback period. Cash-on-cash returns average 15-25% for well-run operations.",
    faqs: [
      { q: "Is a laundromat a good investment?", a: "Yes, laundromats are considered excellent investments with 20-35% average ROI, recession resistance, and predictable cash flows. They offer semi-passive income with proper systems." },
      { q: "How long to recoup laundromat investment?", a: "Most laundromat investments have a 3-5 year payback period, though well-located, efficiently-run operations can achieve payback in 2-3 years." }
    ]
  },
  loanCalculator: {
    title: "Laundromat Loan Calculator - SBA & Equipment Financing | WashBizHub",
    description: "Calculate laundromat loan payments for SBA loans, equipment financing, and commercial mortgages. Compare rates, terms, and monthly payments. Free calculator.",
    focusKeyphrase: "laundromat loan calculator",
    keywords: ["laundromat financing", "laundromat loan", "SBA loan laundromat", "laundromat equipment financing", "commercial laundry loan", "laundromat mortgage calculator"],
    primaryQuestion: "How do I finance a laundromat purchase?",
    directAnswer: "Laundromats can be financed through SBA 7(a) loans (10-25 year terms), equipment financing (same-day approval), or commercial mortgages (up to 80% LTV). Use our calculator to compare options."
  },
  utilityCalculator: {
    title: "Laundromat Utility Cost Calculator - UPG Benchmarking | WashBizHub",
    description: "Calculate laundromat utility costs per load and benchmark against industry standards. Track utilities as percent of gross (UPG). Average is 18-22% of revenue.",
    focusKeyphrase: "laundromat utility cost calculator",
    keywords: ["laundromat utility costs", "cost per load calculator", "UPG ratio", "laundromat operating costs", "water cost per wash", "laundromat electric costs"],
    primaryQuestion: "What should laundromat utility costs be?",
    directAnswer: "Laundromat utilities should be 18-22% of gross revenue (UPG ratio). This includes water (8-10%), electric (5-7%), gas (3-5%), and sewer (2-3%). Higher than 25% indicates inefficiency."
  },
  laborCalculator: {
    title: "Laundromat Labor Cost Calculator - Staffing Optimizer | WashBizHub",
    description: "Calculate optimal laundromat staffing levels and labor costs. Benchmark labor as percent of revenue. Industry standard is 15-20% for attended locations.",
    focusKeyphrase: "laundromat labor cost calculator",
    keywords: ["laundromat labor costs", "laundromat staffing calculator", "wash dry fold calculator", "laundromat employee costs", "laundromat payroll"],
    primaryQuestion: "What should laundromat labor costs be?",
    directAnswer: "Laundromat labor costs should be 15-20% of revenue for attended locations. Unattended coin laundries have minimal labor costs (5-8%). Wash-dry-fold services typically require 25-35% labor."
  },
  laundromatListings: {
    title: "Laundromats for Sale - Browse Verified Listings | WashBizHub",
    description: "Find laundromats for sale with verified listings and CLEANBI scores. Browse coin laundries, wash-dry-fold businesses, and laundry pickup services. Updated daily.",
    focusKeyphrase: "laundromats for sale",
    keywords: ["laundromat for sale", "buy laundromat", "laundromats for sale near me", "coin laundry for sale", "laundromat listings", "laundromat business for sale"],
    primaryQuestion: "Where can I find laundromats for sale?",
    directAnswer: "WashBizHub lists verified laundromats for sale across the US with CLEANBI location scores, financials, and broker contact information. New listings added daily."
  },
  sellLaundromat: {
    title: "Sell Your Laundromat - Free Listing & Valuation | WashBizHub",
    description: "List your laundromat for sale on the #1 marketplace. Get a free valuation, connect with qualified buyers, and access broker resources. No upfront fees.",
    focusKeyphrase: "sell my laundromat",
    keywords: ["sell laundromat", "sell my laundromat", "list laundromat for sale", "laundromat broker", "laundromat valuation", "how to sell a laundromat"],
    primaryQuestion: "How do I sell my laundromat?",
    directAnswer: "To sell your laundromat: 1) Get a valuation using our free calculator, 2) List on WashBizHub marketplace, 3) Connect with qualified buyers and brokers. We help you get the best price."
  },
  funding: {
    title: "Laundromat Funding & Financing - Compare 7+ Lenders | WashBizHub",
    description: "Compare laundromat financing options from 7+ lenders. SBA loans, equipment financing, working capital, and acquisition funding. Get matched in minutes.",
    focusKeyphrase: "laundromat financing",
    keywords: ["laundromat financing", "laundromat loan", "SBA loan laundromat", "laundromat equipment financing", "laundromat startup funding", "laundromat acquisition loan"],
    primaryQuestion: "How can I finance a laundromat?",
    directAnswer: "Finance a laundromat through SBA 7(a) loans (10-25 yr terms, 10-20% down), equipment financing (100% financing available), or working capital loans. Compare 7+ lenders on WashBizHub."
  },
  serviceGuyAI: {
    title: "Service Guy AI - Free Laundromat Repair Assistant | WashBizHub",
    description: "Get instant help with commercial washer and dryer repairs. AI-powered troubleshooting for Speed Queen, Dexter, Maytag, and more. Error code lookup and repair guides.",
    focusKeyphrase: "laundromat repair assistant",
    keywords: ["laundromat error codes", "commercial washer troubleshooting", "dryer fault codes", "Speed Queen error code", "Dexter error codes", "laundromat repair guide"],
    primaryQuestion: "How do I troubleshoot laundromat equipment?",
    directAnswer: "Use Service Guy AI for instant troubleshooting help. Enter your error code or describe the problem, and get step-by-step repair instructions for Speed Queen, Dexter, Maytag, and other commercial equipment."
  },
  equipmentMarketplace: {
    title: "Commercial Laundry Equipment Marketplace | WashBizHub",
    description: "Buy and sell commercial laundry equipment. New and used washers, dryers, changers from Speed Queen, Dexter, Huebsch, and more. Get quotes from multiple vendors.",
    focusKeyphrase: "commercial laundry equipment for sale",
    keywords: ["commercial washer for sale", "used laundry equipment", "Speed Queen washer price", "Dexter dryer for sale", "laundromat equipment marketplace", "coin operated washer"],
    primaryQuestion: "Where can I buy commercial laundry equipment?",
    directAnswer: "WashBizHub's equipment marketplace connects buyers with vendors for new and used commercial laundry equipment including Speed Queen, Dexter, Huebsch, and more. Get quotes from multiple suppliers."
  },
  pricing: {
    title: "WashBizHub Pricing - Free to Pro Plans | Laundromat Tools",
    description: "Choose your WashBizHub plan: Free (3 CLEANBI analyses), Starter ($29/mo - unlimited CLEANBI, calculators), or Pro ($99/mo - API access, Monte Carlo). 30-day money-back guarantee.",
    focusKeyphrase: "laundromat software pricing",
    keywords: ["WashBizHub pricing", "CLEANBI pricing", "laundromat calculator subscription", "laundromat software cost"],
    primaryQuestion: "How much does WashBizHub cost?",
    directAnswer: "WashBizHub offers Free (3 CLEANBI analyses), Starter ($29/mo for unlimited CLEANBI + calculators), and Pro ($99/mo with API access). All paid plans include a 30-day money-back guarantee."
  },
  calculatorsSuite: {
    title: "Professional Laundromat Calculators - Free Business Tools | WashBizHub",
    description: "Access 10+ professional laundromat calculators: Valuation, ROI, Loan, Utility, Labor, Break-Even, and more. Free to use with detailed industry benchmarks.",
    focusKeyphrase: "laundromat calculators",
    keywords: ["laundromat calculator", "laundromat profit calculator", "laundromat business calculator", "coin laundry calculator", "laundry business tools"],
    primaryQuestion: "What calculators do I need for a laundromat?",
    directAnswer: "Essential laundromat calculators include: Valuation (determine worth), ROI (investment returns), Loan (financing costs), Utility (operating costs), and Labor (staffing optimization). WashBizHub offers all free."
  },
  forum: {
    title: "Laundromat Owners Forum - Connect with 72K+ Operators | WashBizHub",
    description: "Join 72,000+ laundromat owners in the largest industry community. Get advice on operations, equipment, locations, and investments. Free to join.",
    focusKeyphrase: "laundromat owners forum",
    keywords: ["laundromat forum", "laundromat owners group", "coin laundry community", "laundromat advice", "laundromat help"],
    primaryQuestion: "Where can I connect with other laundromat owners?",
    directAnswer: "WashBizHub's forum connects you with 72,000+ laundromat owners and operators. Get advice on equipment, locations, operations, and investments from experienced industry professionals."
  },
  designStudio: {
    title: "Laundromat Design Studio - Store Layout Planner | WashBizHub",
    description: "Design your laundromat layout with our visual planning tool. Optimize equipment placement, customer flow, and space utilization. Export professional floor plans.",
    focusKeyphrase: "laundromat design tool",
    keywords: ["laundromat layout design", "laundromat floor plan", "coin laundry design", "laundromat equipment layout", "laundry store design"],
    primaryQuestion: "How do I design a laundromat layout?",
    directAnswer: "Use WashBizHub's Design Studio to create optimal laundromat layouts. Drag-and-drop equipment placement, optimize customer flow, and export professional floor plans for contractors."
  },
  blog: {
    title: "Laundromat Industry Blog - News, Tips & Strategies | WashBizHub",
    description: "Expert laundromat industry insights, business strategies, market analysis, and operational tips. Updated weekly with actionable advice for owners and investors.",
    focusKeyphrase: "laundromat industry blog",
    keywords: ["laundromat blog", "coin laundry news", "laundromat business tips", "laundry industry trends", "laundromat advice"],
    primaryQuestion: "Where can I learn about the laundromat industry?",
    directAnswer: "WashBizHub's blog covers laundromat industry news, business strategies, market analysis, and operational tips. Expert content updated weekly for owners and investors."
  }
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
