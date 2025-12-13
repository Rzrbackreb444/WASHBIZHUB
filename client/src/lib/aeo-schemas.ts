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
    "alternateName": ["The Laundromat Bible", "CLEANBI Universal Scoring"],
    "url": BASE_URL,
    "logo": `${BASE_URL}/washbizhub-logo.png`,
    "description": "The #1 laundromat resource and educational hub for owners, operators, brokers, investors, buyers, sellers, and vendors. Featuring CLEANBI™ universal scoring, marketplace, courses, calculators, and AI-powered business intelligence serving 73,000+ industry professionals worldwide.",
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
          "urlTemplate": `${BASE_URL}/cleanbi-explorer?address={address_string}`
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
    answer: "Yes! The basic CLEANBI score is 100% free with no login required. You can score unlimited addresses globally. Premium reports starting at $99 are available for deeper analysis, valuations, AI-powered investment recommendations, and comprehensive market data."
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
    answer: "Simply visit washbizhub.com/cleanbi-explorer, enter any address (business or residential), and click 'Calculate CLEANBI Score'. You'll receive an instant 0-100 score with A/B/C grade (no D or F grades - everything below C is 'Needs Work'), breakdown by category, and AI recommendations in seconds. No login required."
  },
  {
    question: "What is the CLEANBI Chrome extension?",
    answer: "CLEANBI Anywhere is a free Chrome extension that lets you score any address while browsing Google Maps, LoopNet, BizBuySell, Realtor.com, and other sites. Simply click the extension icon to get instant CLEANBI scores for the address you're viewing."
  },
  {
    question: "What's included in the $99 CLEANBI Quick Valuation report?",
    answer: "The Quick Valuation report ($99) includes estimated business value, market analysis summary, and key recommendations. Higher tiers ($199 Standard, $349 Pro, $499 Enterprise) add deeper analysis, Vision AI, competitor intelligence, and expert consultation."
  }
]);

export const CLEANBI_HOWTO_SCHEMA = generateHowToSchema(
  "How to Get a CLEANBI Score for Any Address",
  "Step-by-step guide to score any business or property location worldwide using the free CLEANBI tool",
  [
    {
      name: "Visit CLEANBI Explorer",
      text: "Go to washbizhub.com/cleanbi-explorer to access the free universal address scoring tool."
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
      text: "Upgrade to premium reports starting at $99 for deep analysis, business valuations, competitor intelligence, and investment recommendations."
    }
  ],
  "PT30S"
);

export const CLEANBI_SOFTWARE_SCHEMA = generateSoftwareSchema({
  name: "CLEANBI Universal Business & Property Score Calculator",
  alternateName: ["CLEANBI Score", "CLEANBI Anywhere", "Universal Address Scorer", "Business Intelligence Score", "Property Investment Score"],
  description: "Score ANY business or residential property worldwide in seconds. Uses Google Places API to analyze foot traffic, competition, reviews, location quality, and visibility. Works for restaurants, retail, laundromats, car washes, gyms, homes, condos, investment properties in 220+ countries. 100% free basic scores, premium reports from $99.",
  features: [
    "Universal Address Scoring - Works for ANY business type or residential property",
    "Global Coverage - 220+ countries including USA, UK, EU, Asia, Africa, Americas",
    "Real-Time Google Data - Foot traffic, reviews, competition analysis",
    "Instant A-C Grades - Professional investment-grade scoring in seconds",
    "Free Chrome Extension - Score addresses while browsing Google Maps, LoopNet, BizBuySell",
    "Business Types: Restaurants, Retail, Gyms, Salons, Car Washes, Laundromats, Gas Stations, Hotels",
    "Property Types: Single-Family Homes, Condos, Townhouses, Investment Properties, Rental Properties",
    "Premium Reports from $99 - Quick Valuation, Standard, Pro, and Enterprise tiers"
  ],
  price: "0",
  rating: 4.9,
  ratingCount: 2847,
  url: "/cleanbi-explorer"
});

// ============================================
// CLEANBI CHROME EXTENSION SCHEMA
// ============================================

export const CLEANBI_EXTENSION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "CLEANBI Anywhere Chrome Extension",
  "alternateName": ["CLEANBI Chrome Extension", "CLEANBI Anywhere", "Business Score Chrome Extension", "Property Score Extension"],
  "applicationCategory": "BusinessApplication",
  "applicationSubCategory": "BrowserExtension",
  "operatingSystem": "Windows, macOS, Linux (Chrome)",
  "browserRequirements": "Google Chrome browser",
  "softwareVersion": "2.1.0",
  "description": "FREE Chrome extension that displays instant A, B, C investment grades for ANY business or property when browsing Google Maps, LoopNet, and BizBuySell. Score addresses in seconds without leaving your browser. Works globally in 220+ countries.",
  "url": `${BASE_URL}/cleanbi-anywhere`,
  "downloadUrl": `${BASE_URL}/cleanbi-anywhere`,
  "isAccessibleForFree": true,
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "100% FREE - No subscription, no limits, no signup required"
  },
  "featureList": [
    "Instant A, B, C investment grades for any address",
    "Works on Google Maps, LoopNet, BizBuySell",
    "Scores businesses AND residential properties",
    "220+ countries supported globally",
    "No signup required - works immediately after install",
    "Upgrade to Full Report from $99 for deep analysis and valuations"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "47",
    "bestRating": "5",
    "worstRating": "1"
  },
  "author": {
    "@type": "Organization",
    "name": "WashBizHub",
    "url": BASE_URL
  },
  "publisher": {
    "@type": "Organization",
    "name": "WashBizHub",
    "url": BASE_URL
  },
  "sameAs": `${BASE_URL}/cleanbi-anywhere`
};

export const CLEANBI_EXTENSION_FAQ_SCHEMA = generateFAQSchema([
  {
    question: "What is the CLEANBI Anywhere Chrome Extension?",
    answer: "CLEANBI Anywhere is a FREE Chrome extension that gives you instant A, B, C investment grades for any business or property while browsing Google Maps, LoopNet, or BizBuySell. Just hover over any listing and see the score instantly - no signup required."
  },
  {
    question: "Is the CLEANBI Chrome Extension free?",
    answer: "Yes! The CLEANBI Anywhere extension is 100% FREE forever. There are no subscriptions, no limits, and no signup required. You can upgrade to premium reports starting at $99 for deep analysis, but the extension itself costs nothing."
  },
  {
    question: "What websites does CLEANBI Anywhere work on?",
    answer: "CLEANBI Anywhere works on Google Maps (google.com/maps), LoopNet (loopnet.com), and BizBuySell (bizbuysell.com). Simply browse these sites and hover over any business or property listing to see instant investment grades."
  },
  {
    question: "What do the A, B, C grades mean?",
    answer: "A, B, and C grades indicate strong investment opportunities. A (80-100) is excellent, B (60-79) is good, and C (40-59) is solid. Anything below C is marked as 'Needs Work' and requires caution. Higher grades = better investment potential."
  },
  {
    question: "Does CLEANBI work for residential properties?",
    answer: "Yes! CLEANBI Anywhere scores both commercial businesses AND residential properties including single-family homes, condos, townhouses, and investment properties. It works for any address globally in 220+ countries."
  }
]);

export const CLEANBI_EXTENSION_HOWTO_SCHEMA = generateHowToSchema(
  "How to Use the CLEANBI Anywhere Chrome Extension",
  "Step-by-step guide to install and use the free CLEANBI Chrome extension for instant business and property investment scores",
  [
    {
      name: "Install the Extension",
      text: "Visit the Chrome Web Store and search for 'CLEANBI Anywhere' or go directly to the extension page. Click 'Add to Chrome' to install - it's completely free."
    },
    {
      name: "Visit a Supported Website",
      text: "Navigate to Google Maps (google.com/maps), LoopNet (loopnet.com), or BizBuySell (bizbuysell.com) in your Chrome browser."
    },
    {
      name: "Hover Over Any Listing",
      text: "Move your mouse over any business listing, property, or address on the page. The CLEANBI score overlay will appear automatically."
    },
    {
      name: "View the Investment Grade",
      text: "See the instant A, B, or C grade along with the 0-100 score and breakdown by category (foot traffic, competition, reviews, location, visibility)."
    },
    {
      name: "Get Full Report (Optional)",
      text: "Click 'Get Full Report' in the overlay for comprehensive analysis including valuations, competitor intelligence, and AI-powered investment recommendations. Reports start at $99."
    }
  ],
  "PT60S"
);

// ============================================
// SPEAKABLE SPECIFICATION GENERATOR
// ============================================

export function generateSpeakableSchema(
  pageName: string,
  pageUrl: string,
  description: string,
  cssSelectors: string[] = ["h1", "h2", ".speakable"]
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": pageName,
    "url": pageUrl.startsWith('http') ? pageUrl : `${BASE_URL}${pageUrl}`,
    "description": description,
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": cssSelectors
    }
  };
}

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
    answer: "CLEANBI is a free, Google-powered universal scoring system that rates any business or property location from 0-100 based on foot traffic, competition, reviews, and location quality. It works for any business type (restaurants, retail, laundromats, etc.) or residential property in 220+ countries. Premium reports from $99 provide deep analysis and valuations."
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
    answer: "Many WashBizHub features are free including basic CLEANBI scores, marketplace browsing, blog content, and resource access. Premium features like detailed reports (from $99), advanced calculators, courses, and consulting services have associated fees. Free users get unlimited basic CLEANBI scores with no login required."
  }
]);

// ============================================
// LAUNDROMAT INDUSTRY FAQ SCHEMAS
// ============================================

export const LAUNDROMAT_INDUSTRY_FAQ_SCHEMA = generateFAQSchema([
  {
    question: "How much does it cost to open a laundromat?",
    answer: "Opening a laundromat typically costs between $200,000 to $1,000,000+ depending on location, size, and whether you're building new or retrofitting existing space. Key costs include: equipment ($100K-$500K), build-out/renovation ($50K-$300K), permits and licenses ($5K-$15K), initial inventory and supplies ($5K-$10K), and working capital. Use WashBizHub's ROI calculator to estimate costs for your specific situation."
  },
  {
    question: "What is the average ROI for a laundromat?",
    answer: "Laundromats typically generate 20-35% cash-on-cash returns, making them one of the most profitable small business investments. Average net operating margins range from 15-35%, with well-run operations achieving higher margins. Factors affecting ROI include location, machine efficiency, pricing strategy, and operating costs. WashBizHub's valuation tools can help estimate potential returns."
  },
  {
    question: "How do I value a laundromat for purchase?",
    answer: "Laundromats are typically valued at 2.5x to 4x annual net operating income (NOI). Key valuation factors include: gross revenue, net income, equipment age and condition, lease terms, location demographics, and competition. Premium valuations (3.5x-4x+) apply to turnkey operations with newer equipment. WashBizHub's valuation calculator uses these industry-standard multiples."
  },
  {
    question: "What equipment do I need for a laundromat?",
    answer: "Essential laundromat equipment includes: front-load washers (20-80lb capacity), top-load washers (20-40lb capacity), stacked or single dryers, coin/card payment systems, change machines, folding tables, seating, and utility carts. Top brands include Speed Queen, Dexter, Continental, and Huebsch. Equipment costs range from $5,000-$30,000 per machine depending on capacity and features."
  },
  {
    question: "How much revenue does a laundromat generate?",
    answer: "Laundromat revenue varies widely based on size and location. A typical 2,000-3,000 sq ft laundromat generates $200,000-$500,000 annually. High-performing locations in urban areas can exceed $750,000+. Revenue depends on turns per day (TPD), pricing strategy, and ancillary services like wash-dry-fold. Industry average is $300-$500 revenue per square foot annually."
  },
  {
    question: "What is Turns Per Day (TPD) for laundromats?",
    answer: "Turns Per Day (TPD) measures how many times each machine is used daily on average. Industry benchmarks: 4-5 TPD is average, 6-7 TPD is good, 8+ TPD is excellent. Higher TPD indicates better location and demand. TPD directly impacts revenue and ROI. Use WashBizHub's TPD calculator to analyze potential or existing locations."
  },
  {
    question: "How do I find a good location for a laundromat?",
    answer: "Key factors for laundromat location include: high renter population (40%+ ideal), population density (5,000+ within 1-mile radius), visible storefront with parking, limited competition, household income $30K-$75K, proximity to apartments/multi-family housing, and good foot traffic. CLEANBI scores help analyze these factors for any address globally."
  },
  {
    question: "What are the ongoing costs of operating a laundromat?",
    answer: "Monthly operating costs typically include: utilities (water, gas, electric) $1,500-$5,000, rent $2,000-$8,000, insurance $300-$600, maintenance/repairs $500-$2,000, supplies $200-$500, and staff wages if attended. Total monthly expenses range from $5,000-$20,000 depending on size and location. Aim for 30-40% of gross revenue for total operating costs."
  }
]);

// ============================================
// PRICING PAGE FAQ SCHEMA
// ============================================

export const PRICING_FAQ_SCHEMA = generateFAQSchema([
  {
    question: "What's included in the free tier?",
    answer: "The Free tier includes 3 CLEANBI location analyses, Service Guy AI (2 messages), basic calculators, Design Studio 2D, access to the 2,200+ error code database, community forum with 72K+ members, and educational content. No credit card required to get started."
  },
  {
    question: "What's included in the Starter plan?",
    answer: "Starter ($29/mo) includes unlimited CLEANBI analyses, full calculator hub access, The Laundromat Bible book, all video courses, forum posting privileges, and email support. All paid plans include a 30-day money-back guarantee."
  },
  {
    question: "What's included in the Pro plan?",
    answer: "Pro ($99/mo) includes everything in Starter plus Monte Carlo simulation, API access, PDF report exports, advanced ROI calculators, bulk analysis tools, and priority support. Perfect for investors and multi-location operators."
  },
  {
    question: "How much can I save with WashBizHub tools?",
    answer: "Members typically save $2,000-$12,000 in the first year through better location selection (avoiding bad deals), AI-powered equipment diagnostics, and access to SBA lender connections. CLEANBI alone has helped investors avoid 6-figure mistakes."
  },
  {
    question: "Do you offer a money-back guarantee?",
    answer: "Yes! All paid plans include a 30-day money-back guarantee. If you're not satisfied, contact support@washbizhub.com within 30 days for a full refund. No questions asked."
  },
  {
    question: "Can I upgrade or downgrade my plan anytime?",
    answer: "Yes! You can upgrade, downgrade, or cancel at any time. There are no long-term contracts or cancellation fees. The Free tier is always available with essential tools."
  }
]);

// ============================================
// CALCULATOR HOWTO SCHEMAS
// ============================================

export const ROI_CALCULATOR_HOWTO_SCHEMA = generateHowToSchema(
  "How to Calculate Laundromat ROI",
  "Step-by-step guide to calculate return on investment for a laundromat purchase or startup using WashBizHub's free ROI calculator",
  [
    {
      name: "Enter Purchase Price",
      text: "Input the total acquisition cost including equipment, build-out, and any renovation expenses. For existing laundromats, use the asking price."
    },
    {
      name: "Input Monthly Revenue",
      text: "Enter the monthly gross revenue from all sources: coin/card machines, wash-dry-fold services, and any vending or ancillary income."
    },
    {
      name: "Add Operating Expenses",
      text: "Include all monthly costs: utilities (water, gas, electric), rent, insurance, maintenance, supplies, and any staff wages."
    },
    {
      name: "Review ROI Results",
      text: "The calculator displays your cash-on-cash return, net operating income, cap rate, and payback period. Industry benchmark is 20-35% ROI."
    },
    {
      name: "Compare Scenarios",
      text: "Adjust variables to see how changes in pricing, expenses, or revenue affect your ROI. Save scenarios for comparison."
    }
  ],
  "PT5M"
);

export const VALUATION_CALCULATOR_HOWTO_SCHEMA = generateHowToSchema(
  "How to Value a Laundromat",
  "Professional guide to valuing a laundromat business using industry-standard multiples and the WashBizHub valuation calculator",
  [
    {
      name: "Gather Financial Data",
      text: "Collect the laundromat's annual gross revenue, operating expenses, and calculate net operating income (NOI). Request P&L statements for the past 2-3 years."
    },
    {
      name: "Enter Revenue and Expenses",
      text: "Input annual gross revenue and itemized operating expenses into the WashBizHub valuation calculator."
    },
    {
      name: "Assess Equipment Condition",
      text: "Rate equipment age and condition. Newer equipment (0-5 years) commands premium multiples; older equipment (10+ years) may require discounts."
    },
    {
      name: "Apply Industry Multiples",
      text: "Standard laundromat valuation uses 2.5x-4x annual NOI. Premium locations with newer equipment and strong leases achieve higher multiples."
    },
    {
      name: "Review Comprehensive Valuation",
      text: "Get your estimated value range, suggested offer price, and detailed breakdown of value drivers and risk factors."
    }
  ],
  "PT10M"
);

// Export all schemas for easy access
export const AEO_SCHEMAS = {
  CLEANBI_FAQ_SCHEMA,
  CLEANBI_HOWTO_SCHEMA,
  CLEANBI_SOFTWARE_SCHEMA,
  CLEANBI_EXTENSION_SCHEMA,
  CLEANBI_EXTENSION_FAQ_SCHEMA,
  CLEANBI_EXTENSION_HOWTO_SCHEMA,
  HOMEPAGE_FAQ_SCHEMA,
  LAUNDROMAT_INDUSTRY_FAQ_SCHEMA,
  PRICING_FAQ_SCHEMA,
  ROI_CALCULATOR_HOWTO_SCHEMA,
  VALUATION_CALCULATOR_HOWTO_SCHEMA,
  generateFAQSchema,
  generateHowToSchema,
  generateArticleSchema,
  generateSoftwareSchema,
  generateOrganizationSchema,
  generateWebsiteSchema,
  generateBreadcrumbSchema,
  generateCourseSchema,
  generateProductSchema,
  generateSpeakableSchema,
};
