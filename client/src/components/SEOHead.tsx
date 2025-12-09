import { Helmet } from "react-helmet-async";

const BASE_URL = typeof window !== 'undefined' 
  ? window.location.origin 
  : (import.meta.env.VITE_BASE_URL || 'https://washbizhub.com');

function sanitizeObject<T extends object>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (_, value) => 
    value === undefined || value === null || value === '' || 
    (Array.isArray(value) && value.length === 0) ? undefined : value
  ));
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface AuthorInfo {
  name: string;
  url?: string;
  jobTitle?: string;
  expertise?: string;
  credentials?: string;
  sameAs?: string[];
}

interface FAQItem {
  question: string;
  answer: string;
}

interface HowToStep {
  name: string;
  text: string;
  image?: string;
  url?: string;
}

interface HowToData {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string;
  estimatedCost?: { currency: string; value: string };
  tools?: { name: string; url?: string }[];
  supplies?: { name: string; url?: string }[];
}

interface ProductOffer {
  name?: string;
  description?: string;
  price: string;
  priceCurrency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder' | 'Discontinued';
  priceValidUntil?: string;
  url?: string;
  itemCondition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition';
}

interface AggregateRatingData {
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}

interface ReviewData {
  author: string;
  authorType?: 'Person' | 'Organization';
  datePublished: string;
  reviewBody: string;
  ratingValue: number;
}

interface LocalBusinessData {
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
  geo?: { latitude: number; longitude: number };
  telephone?: string;
  email?: string;
  url?: string;
  openingHours?: string[];
  priceRange?: string;
  aggregateRating?: AggregateRatingData;
  businessType?: string;
}

interface SoftwareApplicationData {
  name: string;
  alternateName?: string[];
  description: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: ProductOffer | ProductOffer[];
  aggregateRating?: AggregateRatingData;
  featureList?: string[];
  screenshot?: string | string[];
}

interface CourseData {
  name: string;
  description: string;
  provider?: { name: string; url?: string };
  offers?: ProductOffer;
  instructor?: string;
  duration?: string;
  educationalLevel?: string;
}

type PageType = 'website' | 'article' | 'product' | 'course' | 'faq' | 'howto' | 'localbusiness' | 'software';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  pageType?: PageType;
  noIndex?: boolean;
  
  breadcrumbs?: BreadcrumbItem[];
  author?: AuthorInfo;
  datePublished?: string;
  dateModified?: string;
  articleSection?: string;
  
  faqs?: FAQItem[];
  howTo?: HowToData;
  product?: {
    name: string;
    description: string;
    image?: string | string[];
    brand?: string;
    sku?: string;
    offers?: ProductOffer | ProductOffer[];
    aggregateRating?: AggregateRatingData;
    reviews?: ReviewData[];
  };
  localBusiness?: LocalBusinessData;
  software?: SoftwareApplicationData;
  course?: CourseData;
  
  aggregateRating?: {
    itemName: string;
    itemType: 'Product' | 'SoftwareApplication' | 'Course' | 'LocalBusiness' | 'Organization' | 'Service';
    itemDescription?: string;
  } & AggregateRatingData;
  
  speakableSelectors?: string[];
  additionalSchemas?: object[];
}

export function SEOHead({
  title,
  description,
  keywords = [],
  canonicalUrl,
  ogImage = "/washbizhub-og-image.png",
  pageType = "website",
  noIndex = false,
  breadcrumbs = [],
  author,
  datePublished,
  dateModified,
  articleSection,
  faqs = [],
  howTo,
  product,
  localBusiness,
  software,
  course,
  aggregateRating,
  speakableSelectors = ["h1", "h2", ".speakable"],
  additionalSchemas = [],
}: SEOHeadProps) {
  const siteName = "WashBizHub";
  const fullTitle = title.includes('WashBizHub') ? title : `${title} | ${siteName}`;
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const canonical = canonicalUrl ? `${BASE_URL}${canonicalUrl}` : `${BASE_URL}${currentPath}`;
  const ogImageUrl = ogImage?.startsWith("http") ? ogImage : `${BASE_URL}${ogImage || "/washbizhub-og-image.png"}`;
  const currentDate = new Date().toISOString();
  const publishDate = datePublished || currentDate;
  const modifiedDate = dateModified || publishDate;

  const ogTypeMap: Record<PageType, string> = {
    website: 'website',
    article: 'article',
    product: 'product',
    course: 'product',
    faq: 'website',
    howto: 'article',
    localbusiness: 'business.business',
    software: 'product',
  };

  const organizationSchema = sanitizeObject({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    "name": "WashBizHub",
    "alternateName": ["The #1 Laundromat Resource", "The Laundromat Bible", "CLEANBI"],
    "url": BASE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": `${BASE_URL}/washbizhub-logo.png`,
      "width": 512,
      "height": 512
    },
    "image": `${BASE_URL}/washbizhub-og-image.png`,
    "description": "The #1 laundromat resource for owners, operators, brokers, investors, buyers, sellers, vendors. US & Global listings, CLEANBI analyzer, valuations, courses, calculators, funding.",
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
    },
    "knowsAbout": [
      "Laundromat Business",
      "Commercial Laundry Equipment",
      "Business Valuation",
      "Location Analysis",
      "Coin Laundry Operations"
    ]
  });

  const websiteSchema = sanitizeObject({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    "name": "WashBizHub",
    "alternateName": "The #1 Laundromat Resource & Educational Hub",
    "url": BASE_URL,
    "description": "Enterprise-grade SaaS platform for the laundromat industry with CLEANBI™ universal scoring, AI-powered business intelligence, marketplace, courses, and professional tools.",
    "publisher": { "@id": `${BASE_URL}/#organization` },
    "inLanguage": "en-US",
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
  });

  const webPageSchema = sanitizeObject({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonical}/#webpage`,
    "url": canonical,
    "name": fullTitle,
    "description": description,
    "isPartOf": { "@id": `${BASE_URL}/#website` },
    "publisher": { "@id": `${BASE_URL}/#organization` },
    "inLanguage": "en-US",
    "datePublished": publishDate,
    "dateModified": modifiedDate,
    ...(author && {
      "author": {
        "@type": "Person",
        "name": author.name,
        ...(author.url && { "url": author.url }),
        ...(author.jobTitle && { "jobTitle": author.jobTitle }),
        ...(author.sameAs && { "sameAs": author.sameAs })
      }
    }),
    ...(breadcrumbs.length > 0 && {
      "breadcrumb": { "@id": `${canonical}/#breadcrumb` }
    }),
    ...(speakableSelectors.length > 0 && {
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": speakableSelectors
      }
    })
  });

  const breadcrumbSchema = breadcrumbs.length > 0 ? sanitizeObject({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${canonical}/#breadcrumb`,
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`
    }))
  }) : null;

  const articleSchema = pageType === 'article' ? sanitizeObject({
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${canonical}/#article`,
    "headline": title,
    "description": description,
    "url": canonical,
    "mainEntityOfPage": { "@id": `${canonical}/#webpage` },
    "isPartOf": { "@id": `${BASE_URL}/#website` },
    "datePublished": publishDate,
    "dateModified": modifiedDate,
    "image": ogImageUrl,
    "author": author ? {
      "@type": "Person",
      "name": author.name,
      ...(author.url && { "url": author.url }),
      ...(author.jobTitle && { "jobTitle": author.jobTitle }),
      ...(author.expertise && { "description": author.expertise }),
      ...(author.sameAs && { "sameAs": author.sameAs })
    } : { "@id": `${BASE_URL}/#organization` },
    "publisher": { "@id": `${BASE_URL}/#organization` },
    ...(articleSection && { "articleSection": articleSection }),
    ...(keywords.length > 0 && { "keywords": keywords.join(", ") })
  }) : null;

  const faqSchema = faqs.length > 0 ? sanitizeObject({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${canonical}/#faq`,
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }) : null;

  const howToSchema = howTo ? sanitizeObject({
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${canonical}/#howto`,
    "name": howTo.name,
    "description": howTo.description,
    "step": howTo.steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      ...(step.image && { "image": step.image }),
      ...(step.url && { "url": step.url })
    })),
    ...(howTo.totalTime && { "totalTime": howTo.totalTime }),
    ...(howTo.estimatedCost && {
      "estimatedCost": {
        "@type": "MonetaryAmount",
        "currency": howTo.estimatedCost.currency,
        "value": howTo.estimatedCost.value
      }
    }),
    ...(howTo.tools && {
      "tool": howTo.tools.map(tool => ({
        "@type": "HowToTool",
        "name": tool.name,
        ...(tool.url && { "url": tool.url })
      }))
    }),
    ...(howTo.supplies && {
      "supply": howTo.supplies.map(supply => ({
        "@type": "HowToSupply",
        "name": supply.name,
        ...(supply.url && { "url": supply.url })
      }))
    })
  }) : null;

  const formatOffer = (offer: ProductOffer) => ({
    "@type": "Offer",
    "price": offer.price,
    "priceCurrency": offer.priceCurrency || "USD",
    "availability": `https://schema.org/${offer.availability || 'InStock'}`,
    ...(offer.priceValidUntil && { "priceValidUntil": offer.priceValidUntil }),
    ...(offer.url && { "url": offer.url }),
    ...(offer.itemCondition && { "itemCondition": `https://schema.org/${offer.itemCondition}` }),
    "seller": { "@id": `${BASE_URL}/#organization` }
  });

  const productSchema = product ? sanitizeObject({
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${canonical}/#product`,
    "name": product.name,
    "description": product.description,
    "url": canonical,
    ...(product.image && { "image": Array.isArray(product.image) ? product.image : [product.image] }),
    ...(product.brand && {
      "brand": { "@type": "Brand", "name": product.brand }
    }),
    ...(product.sku && { "sku": product.sku }),
    ...(product.offers && {
      "offers": Array.isArray(product.offers) 
        ? product.offers.map(formatOffer) 
        : formatOffer(product.offers)
    }),
    ...(product.aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.aggregateRating.ratingValue,
        "reviewCount": product.aggregateRating.reviewCount,
        "bestRating": product.aggregateRating.bestRating || 5,
        "worstRating": product.aggregateRating.worstRating || 1
      }
    }),
    ...(product.reviews && product.reviews.length > 0 && {
      "review": product.reviews.map(review => ({
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
          "bestRating": 5,
          "worstRating": 1
        }
      }))
    })
  }) : null;

  const localBusinessSchema = localBusiness ? sanitizeObject({
    "@context": "https://schema.org",
    "@type": localBusiness.businessType || "LocalBusiness",
    "@id": `${canonical}/#localbusiness`,
    "name": localBusiness.name,
    ...(localBusiness.description && { "description": localBusiness.description }),
    ...(localBusiness.image && { 
      "image": Array.isArray(localBusiness.image) ? localBusiness.image : [localBusiness.image] 
    }),
    "address": {
      "@type": "PostalAddress",
      "streetAddress": localBusiness.address.streetAddress,
      "addressLocality": localBusiness.address.addressLocality,
      "addressRegion": localBusiness.address.addressRegion,
      "postalCode": localBusiness.address.postalCode,
      "addressCountry": localBusiness.address.addressCountry
    },
    ...(localBusiness.geo && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": localBusiness.geo.latitude,
        "longitude": localBusiness.geo.longitude
      }
    }),
    ...(localBusiness.telephone && { "telephone": localBusiness.telephone }),
    ...(localBusiness.email && { "email": localBusiness.email }),
    ...(localBusiness.url && { "url": localBusiness.url }),
    ...(localBusiness.openingHours && { "openingHours": localBusiness.openingHours }),
    ...(localBusiness.priceRange && { "priceRange": localBusiness.priceRange }),
    ...(localBusiness.aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": localBusiness.aggregateRating.ratingValue,
        "reviewCount": localBusiness.aggregateRating.reviewCount,
        "bestRating": localBusiness.aggregateRating.bestRating || 5,
        "worstRating": localBusiness.aggregateRating.worstRating || 1
      }
    })
  }) : null;

  const softwareSchema = software ? sanitizeObject({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${canonical}/#software`,
    "name": software.name,
    ...(software.alternateName && { "alternateName": software.alternateName }),
    "description": software.description,
    "applicationCategory": software.applicationCategory || "BusinessApplication",
    "operatingSystem": software.operatingSystem || "Web Browser",
    "url": canonical,
    ...(software.offers && {
      "offers": Array.isArray(software.offers) 
        ? software.offers.map(formatOffer) 
        : formatOffer(software.offers)
    }),
    ...(software.aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": software.aggregateRating.ratingValue.toString(),
        "reviewCount": software.aggregateRating.reviewCount.toString(),
        "bestRating": (software.aggregateRating.bestRating || 5).toString(),
        "worstRating": (software.aggregateRating.worstRating || 1).toString()
      }
    }),
    ...(software.featureList && { "featureList": software.featureList }),
    ...(software.screenshot && { 
      "screenshot": Array.isArray(software.screenshot) ? software.screenshot : [software.screenshot] 
    }),
    "author": { "@id": `${BASE_URL}/#organization` }
  }) : null;

  const courseSchema = course ? sanitizeObject({
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${canonical}/#course`,
    "name": course.name,
    "description": course.description,
    "url": canonical,
    "provider": course.provider ? {
      "@type": "Organization",
      "name": course.provider.name,
      ...(course.provider.url && { "url": course.provider.url })
    } : { "@id": `${BASE_URL}/#organization` },
    ...(course.offers && {
      "offers": formatOffer(course.offers)
    }),
    ...(course.instructor && {
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "online",
        "instructor": {
          "@type": "Person",
          "name": course.instructor
        }
      }
    }),
    ...(course.duration && { "timeRequired": course.duration }),
    ...(course.educationalLevel && { "educationalLevel": course.educationalLevel })
  }) : null;

  const aggregateRatingSchema = aggregateRating ? sanitizeObject({
    "@context": "https://schema.org",
    "@type": aggregateRating.itemType,
    "name": aggregateRating.itemName,
    ...(aggregateRating.itemDescription && { "description": aggregateRating.itemDescription }),
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": aggregateRating.ratingValue,
      "reviewCount": aggregateRating.reviewCount,
      "bestRating": aggregateRating.bestRating || 5,
      "worstRating": aggregateRating.worstRating || 1
    }
  }) : null;

  const allSchemas = [
    organizationSchema,
    websiteSchema,
    webPageSchema,
    breadcrumbSchema,
    articleSchema,
    faqSchema,
    howToSchema,
    productSchema,
    localBusinessSchema,
    softwareSchema,
    courseSchema,
    aggregateRatingSchema,
    ...additionalSchemas,
  ].filter(Boolean);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(", ")} />}
      
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content={ogTypeMap[pageType] || "website"} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      <meta property="fb:app_id" content="557248372195" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />
      <meta name="twitter:site" content="@washbizhub" />
      <meta name="twitter:creator" content="@washbizhub" />

      {author && (
        <>
          <meta name="author" content={author.name} />
          <meta property="article:author" content={author.name} />
        </>
      )}
      {datePublished && <meta property="article:published_time" content={publishDate} />}
      {dateModified && <meta property="article:modified_time" content={modifiedDate} />}
      {articleSection && <meta property="article:section" content={articleSection} />}
      {keywords.length > 0 && <meta property="article:tag" content={keywords.join(", ")} />}

      <meta name="theme-color" content="#0A1628" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
      <meta name="googlebot" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      <meta name="bingbot" content={noIndex ? "noindex, nofollow" : "index, follow"} />

      {allSchemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}

export default SEOHead;
