/**
 * MAXIMUM AEO (Answer Engine Optimization) SCHEMAS
 * 
 * Comprehensive structured data schemas for:
 * - FAQPage (for Google/AI answer snippets)
 * - HowTo (for step-by-step featured snippets)
 * - Article (for blog posts)
 * - SoftwareApplication (for tools)
 * - LocalBusiness (for location-based content)
 * - Product (for marketplace items)
 * - Course (for educational content)
 * - Organization (for E-E-A-T)
 * - BreadcrumbList (for navigation)
 * 
 * All schemas optimized for Google, Bing, ChatGPT, Perplexity, and Claude
 */

const BASE_URL = 'https://washbizhub.com';

// ============================================
// FAQ SCHEMA GENERATOR
// ============================================

interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQSchema(faqs: FAQItem[]) {
  return {
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
  };
}

// ============================================
// HOWTO SCHEMA GENERATOR
// ============================================

interface HowToStep {
  name: string;
  text: string;
  image?: string;
}

export function generateHowToSchema(
  name: string,
  description: string,
  steps: HowToStep[],
  totalTime?: string // ISO 8601 duration, e.g., "PT30S" for 30 seconds
) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": name,
    "description": description,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      ...(step.image && { "image": step.image })
    })),
    ...(totalTime && { "totalTime": totalTime })
  };
}

// ============================================
// ARTICLE SCHEMA GENERATOR
// ============================================

interface ArticleData {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  url: string;
}

export function generateArticleSchema(article: ArticleData) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "author": {
      "@type": "Organization",
      "name": article.author || "WashBizHub"
    },
    "publisher": {
      "@type": "Organization",
      "name": "WashBizHub",
      "url": BASE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/washbizhub-logo.png`
      }
    },
    "datePublished": article.datePublished,
    "dateModified": article.dateModified || article.datePublished,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${BASE_URL}${article.url}`
    },
    ...(article.image && {
      "image": {
        "@type": "ImageObject",
        "url": article.image
      }
    })
  };
}

// ============================================
// SOFTWARE APPLICATION SCHEMA
// ============================================

interface SoftwareData {
  name: string;
  alternateName?: string[];
  description: string;
  features: string[];
  price?: string;
  priceCurrency?: string;
  rating?: number;
  ratingCount?: number;
  url: string;
}

export function generateSoftwareSchema(software: SoftwareData) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": software.name,
    ...(software.alternateName && { "alternateName": software.alternateName }),
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": software.price || "0",
      "priceCurrency": software.priceCurrency || "USD"
    },
    ...(software.rating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": software.rating.toString(),
        "ratingCount": (software.ratingCount || 100).toString(),
        "bestRating": "5",
        "worstRating": "1"
      }
    }),
    "description": software.description,
    "featureList": software.features,
    "author": {
      "@type": "Organization",
      "name": "WashBizHub",
      "url": BASE_URL
    }
  };
}

// ============================================
// ORGANIZATION SCHEMA (E-E-A-T)
// ============================================

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "WashBizHub",
    "alternateName": ["The Laundromat Bible", "The Bloomberg of Laundromats"],
    "url": BASE_URL,
    "logo": `${BASE_URL}/washbizhub-logo.png`,
    "description": "The #1 laundromat resource and educational hub for owners, operators, brokers, investors, buyers, sellers, and vendors. Featuring CLEANBI™ universal scoring, marketplace, courses, calculators, and AI-powered business intelligence serving 72,000+ industry professionals worldwide.",
    "foundingDate": "2024",
    "sameAs": [
      "https://www.facebook.com/washbizhub1",
      "https://twitter.com/washbizhub",
      "https://www.linkedin.com/company/washbizhub"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": "support@washbizhub.com",
      "telephone": "+1-479-883-4314",
      "areaServed": "Worldwide",
      "availableLanguage": ["English"]
    },
    "founder": {
      "@type": "Person",
      "name": "Nick Kreme",
      "jobTitle": "Founder & CEO"
    }
  };
}

// ============================================
// WEBSITE SCHEMA WITH SEARCH ACTION
// ============================================

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "WashBizHub",
    "alternateName": "The #1 Laundromat Resource & Educational Hub",
    "url": BASE_URL,
    "description": "Enterprise-grade SaaS platform for the laundromat industry with CLEANBI™ universal scoring, AI-powered business intelligence, marketplace, courses, and professional tools.",
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${BASE_URL}/resources?searchQuery={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      },
      {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${BASE_URL}/cleanbi-auto?address={address_string}`
        },
        "query-input": "required name=address_string"
      }
    ]
  };
}

// ============================================
// BREADCRUMB SCHEMA
// ============================================

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`
    }))
  };
}

// ============================================
// COURSE SCHEMA
// ============================================

interface CourseData {
  name: string;
  description: string;
  provider?: string;
  price?: string;
  duration?: string;
  url: string;
}

export function generateCourseSchema(course: CourseData) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.name,
    "description": course.description,
    "provider": {
      "@type": "Organization",
      "name": course.provider || "WashBizHub",
      "url": BASE_URL
    },
    ...(course.price && {
      "offers": {
        "@type": "Offer",
        "price": course.price,
        "priceCurrency": "USD"
      }
    }),
    ...(course.duration && { "timeRequired": course.duration }),
    "url": `${BASE_URL}${course.url}`
  };
}

// ============================================
// PRODUCT SCHEMA (for marketplace)
// ============================================

interface ProductData {
  name: string;
  description: string;
  image?: string;
  price: string;
  priceCurrency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  brand?: string;
  sku?: string;
  url: string;
}

export function generateProductSchema(product: ProductData) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    ...(product.image && { "image": product.image }),
    ...(product.brand && {
      "brand": {
        "@type": "Brand",
        "name": product.brand
      }
    }),
    ...(product.sku && { "sku": product.sku }),
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": product.priceCurrency || "USD",
      "availability": `https://schema.org/${product.availability || 'InStock'}`,
      "url": `${BASE_URL}${product.url}`,
      "seller": {
        "@type": "Organization",
        "name": "WashBizHub"
      }
    }
  };
}

// ============================================
// CLEANBI-SPECIFIC SCHEMAS
// ============================================

export const CLEANBI_FAQ_SCHEMA = generateFAQSchema([
  {
    question: "What is a CLEANBI score?",
    answer: "A CLEANBI score is a 0-100 rating that evaluates any business or property location based on Google data including foot traffic, competition, reviews, location quality, and visibility. Scores above 90 receive an A grade, 80-89 receive B, 70-79 receive C, and below 70 is marked as 'Needs Work'. CLEANBI works for ANY business type (restaurants, retail, laundromats, gyms, etc.) or residential property worldwide."
  },
  {
    question: "What types of businesses can CLEANBI score?",
    answer: "CLEANBI can score ANY business type including restaurants, retail stores, laundromats, car washes, gyms, salons, gas stations, hotels, coffee shops, convenience stores, and any business with a Google Places listing. It also scores residential properties including single-family homes, condos, townhouses, and investment properties."
  },
  {
    question: "Is CLEANBI free to use?",
    answer: "Yes! The basic CLEANBI score is 100% free with no login required. You can score unlimited addresses globally. Premium $97 reports are available for deeper analysis, valuations, AI-powered investment recommendations, and comprehensive market data."
  },
  {
    question: "What countries does CLEANBI cover?",
    answer: "CLEANBI provides global coverage across 220+ countries including USA, Canada, UK, Australia, Japan, Philippines, Germany, France, Spain, Italy, Brazil, Mexico, India, China, South Africa, Singapore, UAE, and all countries where Google Maps/Places data is available."
  },
  {
    question: "How accurate is the CLEANBI score?",
    answer: "CLEANBI uses real-time Google Places API data including actual customer reviews, business ratings, foot traffic estimates, and competitor analysis. Accuracy depends on available Google data for each location. Each score includes a confidence percentage indicating data quality. Urban locations typically have excellent data coverage."
  },
  {
    question: "How do I get a CLEANBI score?",
    answer: "Simply visit washbizhub.com/cleanbi-auto, enter any address (business or residential), and click 'Calculate CLEANBI Score'. You'll receive an instant 0-100 score with A-F grade, breakdown by category, and AI recommendations in seconds. No login required."
  },
  {
    question: "What is the CLEANBI Chrome extension?",
    answer: "CLEANBI Anywhere is a free Chrome extension that lets you score any address while browsing Google Maps, LoopNet, BizBuySell, Realtor.com, and other sites. Simply click the extension icon to get instant CLEANBI scores for the address you're viewing."
  },
  {
    question: "What's included in the $97 CLEANBI premium report?",
    answer: "The premium report includes deep analysis with business valuation, comprehensive competitor intelligence, detailed foot traffic patterns, demographic analysis, AI-powered investment recommendations, risk assessment, opportunity scoring, and actionable improvement strategies."
  }
]);

export const CLEANBI_HOWTO_SCHEMA = generateHowToSchema(
  "How to Get a CLEANBI Score for Any Address",
  "Step-by-step guide to score any business or property location worldwide using the free CLEANBI tool",
  [
    {
      name: "Visit CLEANBI Auto Calculator",
      text: "Go to washbizhub.com/cleanbi-auto to access the free universal address scoring tool."
    },
    {
      name: "Enter the Address",
      text: "Type any business or residential address into the CLEANBI calculator. Include street address, city, state/province, and country for best results. You can also optionally add the business name for commercial addresses."
    },
    {
      name: "Click Calculate",
      text: "Press the 'Calculate CLEANBI Score' button. Our Google-powered engine will analyze the location in seconds using real-time data."
    },
    {
      name: "View Your Score",
      text: "Receive your 0-100 score with A/B/C grade, breakdown by category (foot traffic, competition, reviews, location, visibility), and AI recommendations."
    },
    {
      name: "Get Full Report (Optional)",
      text: "Upgrade to the $97 premium report for deep analysis, business valuations, competitor intelligence, and investment recommendations."
    }
  ],
  "PT30S"
);

export const CLEANBI_SOFTWARE_SCHEMA = generateSoftwareSchema({
  name: "CLEANBI Universal Business & Property Score Calculator",
  alternateName: ["CLEANBI Score", "CLEANBI Anywhere", "Universal Address Scorer", "Business Intelligence Score", "Property Investment Score"],
  description: "Score ANY business or residential property worldwide in seconds. Uses Google Places API to analyze foot traffic, competition, reviews, location quality, and visibility. Works for restaurants, retail, laundromats, car washes, gyms, homes, condos, investment properties in 220+ countries. 100% free basic scores, premium $97 reports available.",
  features: [
    "Universal Address Scoring - Works for ANY business type or residential property",
    "Global Coverage - 220+ countries including USA, UK, EU, Asia, Africa, Americas",
    "Real-Time Google Data - Foot traffic, reviews, competition analysis",
    "Instant A-F Grades - Professional investment-grade scoring in seconds",
    "Free Chrome Extension - Score addresses while browsing Google Maps, LoopNet, BizBuySell",
    "Business Types: Restaurants, Retail, Gyms, Salons, Car Washes, Laundromats, Gas Stations, Hotels",
    "Property Types: Single-Family Homes, Condos, Townhouses, Investment Properties, Rental Properties",
    "$97 Premium Reports - Deep analysis, valuations, AI-powered recommendations"
  ],
  price: "0",
  rating: 4.9,
  ratingCount: 2847,
  url: "/cleanbi-auto"
});

// ============================================
// HOMEPAGE COMPREHENSIVE SCHEMAS
// ============================================

export const HOMEPAGE_FAQ_SCHEMA = generateFAQSchema([
  {
    question: "What is WashBizHub?",
    answer: "WashBizHub is the #1 laundromat resource and educational hub, serving over 72,000 industry professionals worldwide. We provide CLEANBI™ universal business scoring, AI-powered consulting, marketplace for equipment and businesses, professional courses, 50+ calculators, and comprehensive industry resources for laundromat owners, investors, operators, and vendors."
  },
  {
    question: "What is the CLEANBI score?",
    answer: "CLEANBI is a free, Google-powered universal scoring system that rates any business or property location from 0-100 based on foot traffic, competition, reviews, and location quality. It works for any business type (restaurants, retail, laundromats, etc.) or residential property in 220+ countries. Premium $97 reports provide deep analysis and valuations."
  },
  {
    question: "How can WashBizHub help me buy a laundromat?",
    answer: "WashBizHub provides comprehensive tools for laundromat buyers including CLEANBI location scoring, ROI calculators, valuation tools, marketplace listings, due diligence guides, funding options, and AI-powered consulting. Our platform helps you analyze opportunities, compare locations, and make data-driven investment decisions."
  },
  {
    question: "What courses does WashBizHub offer?",
    answer: "WashBizHub offers professional courses covering laundromat operations, marketing, equipment maintenance, financial management, and business growth. Our courses are designed for beginners to experienced operators, featuring video content, practical guides, and industry expert insights."
  },
  {
    question: "Is WashBizHub free to use?",
    answer: "Many WashBizHub features are free including basic CLEANBI scores, marketplace browsing, blog content, and resource access. Premium features like detailed reports ($97), advanced calculators, courses, and consulting services have associated fees. Free users get unlimited basic CLEANBI scores with no login required."
  }
]);

// Export all schemas for easy access
export const AEO_SCHEMAS = {
  CLEANBI_FAQ_SCHEMA,
  CLEANBI_HOWTO_SCHEMA,
  CLEANBI_SOFTWARE_SCHEMA,
  HOMEPAGE_FAQ_SCHEMA,
  generateFAQSchema,
  generateHowToSchema,
  generateArticleSchema,
  generateSoftwareSchema,
  generateOrganizationSchema,
  generateWebsiteSchema,
  generateBreadcrumbSchema,
  generateCourseSchema,
  generateProductSchema,
};
