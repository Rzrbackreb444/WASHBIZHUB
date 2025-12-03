/**
 * WashBizHub Structured Data Schema Generators
 * 
 * Comprehensive JSON-LD generators for SEO optimization following schema.org specifications.
 * Supports: FAQ, HowTo, Product, Article, BreadcrumbList, Organization, WebSite
 * 
 * All schemas are optimized for Google Rich Results, Bing, and AI answer engines.
 */

const BASE_URL = typeof window !== 'undefined' 
  ? window.location.origin 
  : (import.meta.env.VITE_BASE_URL || 'https://washbizhub.com');

export function sanitizeSchemaObject<T extends object>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (_, value) => 
    value === undefined || value === null || value === '' || 
    (Array.isArray(value) && value.length === 0) ? undefined : value
  ));
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSchemaOptions {
  faqs: FAQItem[];
  mainEntity?: boolean;
}

export function generateFAQSchema(options: FAQSchemaOptions): object {
  const { faqs, mainEntity = true } = options;
  
  if (faqs.length === 0) return {};
  
  return sanitizeSchemaObject({
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

export interface HowToStep {
  name: string;
  text: string;
  image?: string;
  url?: string;
}

export interface HowToTool {
  name: string;
  url?: string;
}

export interface HowToSupply {
  name: string;
  url?: string;
}

export interface HowToSchemaOptions {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string;
  estimatedCost?: {
    currency: string;
    value: string;
  };
  tools?: HowToTool[];
  supplies?: HowToSupply[];
  image?: string;
  video?: {
    name: string;
    description: string;
    thumbnailUrl: string;
    contentUrl: string;
    uploadDate: string;
    duration?: string;
  };
}

export function generateHowToSchema(options: HowToSchemaOptions): object {
  const { 
    name, 
    description, 
    steps, 
    totalTime, 
    estimatedCost, 
    tools, 
    supplies, 
    image, 
    video 
  } = options;
  
  return sanitizeSchemaObject({
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": name,
    "description": description,
    ...(image && { "image": image }),
    ...(totalTime && { "totalTime": totalTime }),
    ...(estimatedCost && {
      "estimatedCost": {
        "@type": "MonetaryAmount",
        "currency": estimatedCost.currency,
        "value": estimatedCost.value
      }
    }),
    ...(tools && tools.length > 0 && {
      "tool": tools.map(tool => ({
        "@type": "HowToTool",
        "name": tool.name,
        ...(tool.url && { "url": tool.url })
      }))
    }),
    ...(supplies && supplies.length > 0 && {
      "supply": supplies.map(supply => ({
        "@type": "HowToSupply",
        "name": supply.name,
        ...(supply.url && { "url": supply.url })
      }))
    }),
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      ...(step.image && { "image": step.image }),
      ...(step.url && { "url": step.url })
    })),
    ...(video && {
      "video": {
        "@type": "VideoObject",
        "name": video.name,
        "description": video.description,
        "thumbnailUrl": video.thumbnailUrl,
        "contentUrl": video.contentUrl,
        "uploadDate": video.uploadDate,
        ...(video.duration && { "duration": video.duration })
      }
    })
  });
}

export interface ProductOffer {
  price: string;
  priceCurrency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder' | 'Discontinued' | 'BackOrder';
  priceValidUntil?: string;
  url?: string;
  seller?: {
    name: string;
    url?: string;
  };
  itemCondition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition' | 'DamagedCondition';
}

export interface ProductReview {
  author: string;
  authorType?: 'Person' | 'Organization';
  datePublished: string;
  reviewBody: string;
  ratingValue: number;
  bestRating?: number;
  worstRating?: number;
}

export interface ProductSchemaOptions {
  name: string;
  description: string;
  image?: string | string[];
  brand?: string;
  sku?: string;
  mpn?: string;
  gtin?: string;
  category?: string;
  offers?: ProductOffer | ProductOffer[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
  reviews?: ProductReview[];
  url?: string;
}

export function generateProductSchema(options: ProductSchemaOptions): object {
  const {
    name,
    description,
    image,
    brand,
    sku,
    mpn,
    gtin,
    category,
    offers,
    aggregateRating,
    reviews,
    url
  } = options;

  const formatOffer = (offer: ProductOffer) => ({
    "@type": "Offer",
    "price": offer.price,
    "priceCurrency": offer.priceCurrency || "USD",
    "availability": `https://schema.org/${offer.availability || 'InStock'}`,
    ...(offer.priceValidUntil && { "priceValidUntil": offer.priceValidUntil }),
    ...(offer.url && { "url": offer.url }),
    ...(offer.seller && {
      "seller": {
        "@type": "Organization",
        "name": offer.seller.name,
        ...(offer.seller.url && { "url": offer.seller.url })
      }
    }),
    ...(offer.itemCondition && { 
      "itemCondition": `https://schema.org/${offer.itemCondition}` 
    })
  });

  const formatReview = (review: ProductReview) => ({
    "@type": "Review",
    "author": {
      "@type": review.authorType || "Person",
      "name": review.author
    },
    "datePublished": review.datePublished,
    "reviewBody": review.reviewBody,
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.ratingValue,
      "bestRating": review.bestRating || 5,
      "worstRating": review.worstRating || 1
    }
  });

  return sanitizeSchemaObject({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    ...(image && { "image": Array.isArray(image) ? image : [image] }),
    ...(brand && {
      "brand": {
        "@type": "Brand",
        "name": brand
      }
    }),
    ...(sku && { "sku": sku }),
    ...(mpn && { "mpn": mpn }),
    ...(gtin && { "gtin": gtin }),
    ...(category && { "category": category }),
    ...(url && { "url": url }),
    ...(offers && {
      "offers": Array.isArray(offers) 
        ? offers.map(formatOffer) 
        : formatOffer(offers)
    }),
    ...(aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": aggregateRating.ratingValue,
        "reviewCount": aggregateRating.reviewCount,
        "bestRating": aggregateRating.bestRating || 5,
        "worstRating": aggregateRating.worstRating || 1
      }
    }),
    ...(reviews && reviews.length > 0 && {
      "review": reviews.map(formatReview)
    })
  });
}

export interface ArticleAuthor {
  name: string;
  url?: string;
  type?: 'Person' | 'Organization';
  jobTitle?: string;
  sameAs?: string[];
}

export interface ArticleSchemaOptions {
  headline: string;
  description: string;
  author: ArticleAuthor | ArticleAuthor[];
  datePublished: string;
  dateModified?: string;
  image?: string | string[];
  url: string;
  publisher?: {
    name: string;
    logo?: string;
    url?: string;
  };
  articleSection?: string;
  keywords?: string[];
  wordCount?: number;
  articleType?: 'Article' | 'BlogPosting' | 'NewsArticle' | 'TechArticle';
  mainEntityOfPage?: string;
}

export function generateArticleSchema(options: ArticleSchemaOptions): object {
  const {
    headline,
    description,
    author,
    datePublished,
    dateModified,
    image,
    url,
    publisher,
    articleSection,
    keywords,
    wordCount,
    articleType = 'Article',
    mainEntityOfPage
  } = options;

  const formatAuthor = (auth: ArticleAuthor) => ({
    "@type": auth.type || "Person",
    "name": auth.name,
    ...(auth.url && { "url": auth.url }),
    ...(auth.jobTitle && { "jobTitle": auth.jobTitle }),
    ...(auth.sameAs && auth.sameAs.length > 0 && { "sameAs": auth.sameAs })
  });

  const defaultPublisher = {
    "@type": "Organization",
    "name": "WashBizHub",
    "url": BASE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": `${BASE_URL}/washbizhub-logo.png`
    }
  };

  return sanitizeSchemaObject({
    "@context": "https://schema.org",
    "@type": articleType,
    "headline": headline,
    "description": description,
    "author": Array.isArray(author) 
      ? author.map(formatAuthor) 
      : formatAuthor(author),
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    ...(image && { "image": Array.isArray(image) ? image : [image] }),
    "url": url.startsWith('http') ? url : `${BASE_URL}${url}`,
    "publisher": publisher ? {
      "@type": "Organization",
      "name": publisher.name,
      ...(publisher.url && { "url": publisher.url }),
      ...(publisher.logo && {
        "logo": {
          "@type": "ImageObject",
          "url": publisher.logo
        }
      })
    } : defaultPublisher,
    ...(articleSection && { "articleSection": articleSection }),
    ...(keywords && keywords.length > 0 && { "keywords": keywords.join(", ") }),
    ...(wordCount && { "wordCount": wordCount }),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": mainEntityOfPage || (url.startsWith('http') ? url : `${BASE_URL}${url}`)
    }
  });
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BreadcrumbSchemaOptions {
  items: BreadcrumbItem[];
}

export function generateBreadcrumbSchema(options: BreadcrumbSchemaOptions): object {
  const { items } = options;
  
  if (items.length === 0) return {};
  
  return sanitizeSchemaObject({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`
    }))
  });
}

export interface OrganizationContactPoint {
  type: string;
  email?: string;
  telephone?: string;
  areaServed?: string | string[];
  availableLanguage?: string | string[];
}

export interface OrganizationSchemaOptions {
  name: string;
  alternateName?: string | string[];
  url?: string;
  logo?: string;
  description?: string;
  foundingDate?: string;
  founders?: Array<{
    name: string;
    jobTitle?: string;
  }>;
  contactPoints?: OrganizationContactPoint[];
  sameAs?: string[];
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  email?: string;
  telephone?: string;
}

export function generateOrganizationSchema(options: OrganizationSchemaOptions): object {
  const {
    name,
    alternateName,
    url = BASE_URL,
    logo,
    description,
    foundingDate,
    founders,
    contactPoints,
    sameAs,
    address,
    email,
    telephone
  } = options;

  return sanitizeSchemaObject({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    ...(alternateName && { 
      "alternateName": Array.isArray(alternateName) ? alternateName : [alternateName] 
    }),
    "url": url,
    ...(logo && { "logo": logo }),
    ...(description && { "description": description }),
    ...(foundingDate && { "foundingDate": foundingDate }),
    ...(founders && founders.length > 0 && {
      "founder": founders.map(founder => ({
        "@type": "Person",
        "name": founder.name,
        ...(founder.jobTitle && { "jobTitle": founder.jobTitle })
      }))
    }),
    ...(contactPoints && contactPoints.length > 0 && {
      "contactPoint": contactPoints.map(cp => ({
        "@type": "ContactPoint",
        "contactType": cp.type,
        ...(cp.email && { "email": cp.email }),
        ...(cp.telephone && { "telephone": cp.telephone }),
        ...(cp.areaServed && { "areaServed": cp.areaServed }),
        ...(cp.availableLanguage && { "availableLanguage": cp.availableLanguage })
      }))
    }),
    ...(sameAs && sameAs.length > 0 && { "sameAs": sameAs }),
    ...(address && {
      "address": {
        "@type": "PostalAddress",
        ...(address.streetAddress && { "streetAddress": address.streetAddress }),
        ...(address.addressLocality && { "addressLocality": address.addressLocality }),
        ...(address.addressRegion && { "addressRegion": address.addressRegion }),
        ...(address.postalCode && { "postalCode": address.postalCode }),
        ...(address.addressCountry && { "addressCountry": address.addressCountry })
      }
    }),
    ...(email && { "email": email }),
    ...(telephone && { "telephone": telephone })
  });
}

export interface SearchAction {
  target: string;
  queryInput: string;
}

export interface WebSiteSchemaOptions {
  name: string;
  alternateName?: string | string[];
  url?: string;
  description?: string;
  publisher?: string;
  potentialActions?: SearchAction[];
  inLanguage?: string;
}

export function generateWebSiteSchema(options: WebSiteSchemaOptions): object {
  const {
    name,
    alternateName,
    url = BASE_URL,
    description,
    publisher,
    potentialActions,
    inLanguage = 'en-US'
  } = options;

  const defaultSearchAction: SearchAction = {
    target: `${url}/resources?searchQuery={search_term_string}`,
    queryInput: 'required name=search_term_string'
  };

  const actions = potentialActions && potentialActions.length > 0 
    ? potentialActions 
    : [defaultSearchAction];

  return sanitizeSchemaObject({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": name,
    ...(alternateName && { 
      "alternateName": Array.isArray(alternateName) ? alternateName : [alternateName] 
    }),
    "url": url,
    ...(description && { "description": description }),
    "inLanguage": inLanguage,
    ...(publisher && {
      "publisher": {
        "@type": "Organization",
        "name": publisher
      }
    }),
    "potentialAction": actions.map(action => ({
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": action.target
      },
      "query-input": action.queryInput
    }))
  });
}

export interface SoftwareApplicationSchemaOptions {
  name: string;
  alternateName?: string[];
  description: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: ProductOffer | ProductOffer[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
  featureList?: string[];
  screenshot?: string | string[];
  url?: string;
}

export function generateSoftwareApplicationSchema(options: SoftwareApplicationSchemaOptions): object {
  const {
    name,
    alternateName,
    description,
    applicationCategory = 'BusinessApplication',
    operatingSystem = 'Web Browser',
    offers,
    aggregateRating,
    featureList,
    screenshot,
    url
  } = options;

  const formatOffer = (offer: ProductOffer) => ({
    "@type": "Offer",
    "price": offer.price,
    "priceCurrency": offer.priceCurrency || "USD",
    "availability": `https://schema.org/${offer.availability || 'InStock'}`
  });

  return sanitizeSchemaObject({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": name,
    ...(alternateName && { "alternateName": alternateName }),
    "description": description,
    "applicationCategory": applicationCategory,
    "operatingSystem": operatingSystem,
    ...(url && { "url": url.startsWith('http') ? url : `${BASE_URL}${url}` }),
    ...(offers && {
      "offers": Array.isArray(offers) 
        ? offers.map(formatOffer) 
        : formatOffer(offers)
    }),
    ...(aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": aggregateRating.ratingValue.toString(),
        "reviewCount": aggregateRating.reviewCount.toString(),
        "bestRating": (aggregateRating.bestRating || 5).toString(),
        "worstRating": (aggregateRating.worstRating || 1).toString()
      }
    }),
    ...(featureList && { "featureList": featureList }),
    ...(screenshot && { 
      "screenshot": Array.isArray(screenshot) ? screenshot : [screenshot] 
    }),
    "author": {
      "@type": "Organization",
      "name": "WashBizHub",
      "url": BASE_URL
    }
  });
}

export interface CourseSchemaOptions {
  name: string;
  description: string;
  provider?: {
    name: string;
    url?: string;
  };
  offers?: ProductOffer;
  hasCourseInstance?: {
    courseMode?: 'online' | 'onsite' | 'blended';
    startDate?: string;
    endDate?: string;
    instructor?: string;
  };
  educationalLevel?: string;
  timeRequired?: string;
  url: string;
  image?: string;
}

export function generateCourseSchema(options: CourseSchemaOptions): object {
  const {
    name,
    description,
    provider,
    offers,
    hasCourseInstance,
    educationalLevel,
    timeRequired,
    url,
    image
  } = options;

  const defaultProvider = {
    "@type": "Organization",
    "name": "WashBizHub",
    "url": BASE_URL
  };

  return sanitizeSchemaObject({
    "@context": "https://schema.org",
    "@type": "Course",
    "name": name,
    "description": description,
    "provider": provider ? {
      "@type": "Organization",
      "name": provider.name,
      ...(provider.url && { "url": provider.url })
    } : defaultProvider,
    ...(offers && {
      "offers": {
        "@type": "Offer",
        "price": offers.price,
        "priceCurrency": offers.priceCurrency || "USD",
        "availability": `https://schema.org/${offers.availability || 'InStock'}`
      }
    }),
    ...(hasCourseInstance && {
      "hasCourseInstance": {
        "@type": "CourseInstance",
        ...(hasCourseInstance.courseMode && { "courseMode": hasCourseInstance.courseMode }),
        ...(hasCourseInstance.startDate && { "startDate": hasCourseInstance.startDate }),
        ...(hasCourseInstance.endDate && { "endDate": hasCourseInstance.endDate }),
        ...(hasCourseInstance.instructor && {
          "instructor": {
            "@type": "Person",
            "name": hasCourseInstance.instructor
          }
        })
      }
    }),
    ...(educationalLevel && { "educationalLevel": educationalLevel }),
    ...(timeRequired && { "timeRequired": timeRequired }),
    ...(image && { "image": image }),
    "url": url.startsWith('http') ? url : `${BASE_URL}${url}`
  });
}

export interface LocalBusinessSchemaOptions {
  name: string;
  description?: string;
  image?: string | string[];
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  telephone?: string;
  email?: string;
  url?: string;
  openingHours?: string[];
  priceRange?: string;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  businessType?: string;
}

export function generateLocalBusinessSchema(options: LocalBusinessSchemaOptions): object {
  const {
    name,
    description,
    image,
    address,
    geo,
    telephone,
    email,
    url,
    openingHours,
    priceRange,
    aggregateRating,
    businessType = 'LocalBusiness'
  } = options;

  return sanitizeSchemaObject({
    "@context": "https://schema.org",
    "@type": businessType,
    "name": name,
    ...(description && { "description": description }),
    ...(image && { "image": Array.isArray(image) ? image : [image] }),
    "address": {
      "@type": "PostalAddress",
      "streetAddress": address.streetAddress,
      "addressLocality": address.addressLocality,
      "addressRegion": address.addressRegion,
      "postalCode": address.postalCode,
      "addressCountry": address.addressCountry
    },
    ...(geo && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": geo.latitude,
        "longitude": geo.longitude
      }
    }),
    ...(telephone && { "telephone": telephone }),
    ...(email && { "email": email }),
    ...(url && { "url": url }),
    ...(openingHours && { "openingHours": openingHours }),
    ...(priceRange && { "priceRange": priceRange }),
    ...(aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": aggregateRating.ratingValue,
        "reviewCount": aggregateRating.reviewCount,
        "bestRating": 5,
        "worstRating": 1
      }
    })
  });
}

export const WashBizHubOrganization = generateOrganizationSchema({
  name: "WashBizHub",
  alternateName: ["The #1 Laundromat Resource & Educational Hub", "The Laundromat Bible"],
  url: BASE_URL,
  logo: `${BASE_URL}/washbizhub-logo.png`,
  description: "The #1 laundromat resource for owners, operators, brokers, investors, buyers, sellers, vendors. US & Global listings, CLEANBI analyzer, Chrome extension, valuations, competition analysis, courses, calculators, funding.",
  foundingDate: "2024",
  founders: [
    { name: "Nick Kreme", jobTitle: "Founder & CEO" }
  ],
  contactPoints: [
    {
      type: "Customer Service",
      email: "support@washbizhub.com",
      areaServed: "Worldwide",
      availableLanguage: "English"
    }
  ],
  sameAs: [
    "https://www.facebook.com/washbizhub1",
    "https://twitter.com/washbizhub",
    "https://www.linkedin.com/company/washbizhub"
  ]
});

export const WashBizHubWebSite = generateWebSiteSchema({
  name: "WashBizHub",
  alternateName: "The #1 Laundromat Resource & Educational Hub",
  url: BASE_URL,
  description: "The #1 laundromat resource — listings, equipment, CLEANBI, courses, calculators, funding, and vendors. US & Global.",
  publisher: "WashBizHub",
  potentialActions: [
    {
      target: `${BASE_URL}/resources?searchQuery={search_term_string}`,
      queryInput: "required name=search_term_string"
    },
    {
      target: `${BASE_URL}/cleanbi-explorer?address={address_string}`,
      queryInput: "required name=address_string"
    },
    {
      target: `${BASE_URL}/listings?q={listing_query}`,
      queryInput: "required name=listing_query"
    }
  ]
});

export function combineSchemas(...schemas: object[]): object[] {
  return schemas.filter(schema => Object.keys(schema).length > 0);
}

export type StructuredDataType = 
  | 'FAQ'
  | 'HowTo'
  | 'Product'
  | 'Article'
  | 'BreadcrumbList'
  | 'Organization'
  | 'WebSite'
  | 'SoftwareApplication'
  | 'Course'
  | 'LocalBusiness';
