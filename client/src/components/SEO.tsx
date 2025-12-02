import { Helmet } from "react-helmet-async";
import { JsonLd } from "./JsonLd";

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
  expertise: string;
  credentials?: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface HowToStep {
  name: string;
  text: string;
  image?: string;
}

interface HowToData {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string;
}

interface ProductOffer {
  name: string;
  description: string;
  price: string;
  priceCurrency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  priceValidUntil?: string;
}

interface ReviewItem {
  author: string;
  authorType?: 'Person' | 'Organization';
  datePublished: string;
  reviewBody: string;
  ratingValue: number;
  bestRating?: number;
  worstRating?: number;
}

interface AggregateRatingData {
  itemName: string;
  itemType: 'Product' | 'SoftwareApplication' | 'Course' | 'LocalBusiness' | 'Organization' | 'Service';
  itemDescription?: string;
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
  reviews?: ReviewItem[];
}

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogType?: "website" | "article" | "product" | "course";
  ogImage?: string;
  keywords?: string[];
  structuredData?: object | object[];
  breadcrumbs?: BreadcrumbItem[];
  author?: AuthorInfo;
  twitterHandle?: string;
  fbAppId?: string;
  faqs?: FAQItem[];
  howTo?: HowToData;
  productOffers?: ProductOffer[];
  speakableSelectors?: string[];
  speakableContent?: string[];
  datePublished?: string;
  dateModified?: string;
  articleSection?: string;
  noIndex?: boolean;
  aggregateRating?: AggregateRatingData;
}

export function SEO({
  title,
  description,
  canonicalUrl,
  ogType = "website",
  ogImage = "/washbizhub-og-image.png",
  keywords = [],
  structuredData,
  breadcrumbs = [],
  author,
  twitterHandle = "@washbizhub",
  fbAppId = "557248372195",
  faqs = [],
  howTo,
  productOffers = [],
  speakableSelectors = ["h1", "h2", ".speakable"],
  speakableContent = [],
  datePublished,
  dateModified,
  articleSection,
  noIndex = false,
  aggregateRating,
}: SEOProps) {
  const siteName = "WashBizHub";
  const fullTitle = title.includes('WashBizHub') ? title : `${title} | ${siteName} - #1 Laundromat Resource`;
  const baseUrl = import.meta.env.VITE_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://washbizhub.com');
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const canonical = canonicalUrl ? `${baseUrl}${canonicalUrl}` : `${baseUrl}${currentPath}`;
  const ogImageUrl = ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`;
  const currentDate = new Date().toISOString();

  // Organization structured data for E-E-A-T
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "WashBizHub",
    "alternateName": "The #1 Laundromat Resource & Educational Hub",
    "url": baseUrl,
    "logo": `${baseUrl}/washbizhub-logo.png`,
    "description": "The #1 laundromat resource for owners, operators, brokers, investors, buyers, sellers, vendors. US & Global listings, CLEANBI analyzer, Chrome extension, valuations, competition analysis, courses, calculators, funding.",
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
      "availableLanguage": "English"
    },
    "founder": author ? {
      "@type": "Person",
      "name": author.name,
      "jobTitle": author.expertise,
      "description": author.credentials
    } : undefined
  };

  // WebSite structured data for site-wide search
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "WashBizHub",
    "alternateName": "The #1 Laundromat Resource & Educational Hub",
    "url": baseUrl,
    "description": "The #1 laundromat resource — listings, equipment, CLEANBI, courses, calculators, funding, and vendors. US & Global.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/resources?searchQuery={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  // Breadcrumb structured data
  const breadcrumbData = breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
  } : null;

  // FAQPage structured data for AEO (Answer Engine Optimization)
  const faqData = faqs.length > 0 ? {
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
  } : null;

  // HowTo structured data for step-by-step guides
  const howToData = howTo ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": howTo.name,
    "description": howTo.description,
    "step": howTo.steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      ...(step.image && { "image": step.image })
    })),
    ...(howTo.totalTime && { "totalTime": howTo.totalTime })
  } : null;

  // Product/Offer structured data for pricing tiers
  const productData = productOffers.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "WashBizHub Platform",
    "description": "Complete laundromat management platform with CLEANBI scoring, POS system, AI consulting, and business tools.",
    "brand": {
      "@type": "Brand",
      "name": "WashBizHub"
    },
    "offers": productOffers.map(offer => ({
      "@type": "Offer",
      "name": offer.name,
      "description": offer.description,
      "price": offer.price,
      "priceCurrency": offer.priceCurrency || "USD",
      "availability": `https://schema.org/${offer.availability || 'InStock'}`,
      ...(offer.priceValidUntil && { "priceValidUntil": offer.priceValidUntil }),
      "url": canonical
    }))
  } : null;

  // SpeakableSpecification for voice search optimization (Google Assistant, Alexa, etc.)
  const speakableData = (speakableContent.length > 0 || speakableSelectors.length > 0) ? {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": fullTitle,
    "url": canonical,
    "speakable": {
      "@type": "SpeakableSpecification",
      ...(speakableSelectors.length > 0 && { "cssSelector": speakableSelectors }),
      ...(speakableContent.length > 0 && { "xpath": speakableContent.map((_, i) => `//*[@data-speakable='${i}']`) })
    },
    "description": description
  } : null;

  // AggregateRating and Review structured data for rich snippets in search results
  const aggregateRatingData = aggregateRating ? {
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
    },
    ...(aggregateRating.reviews && aggregateRating.reviews.length > 0 && {
      "review": aggregateRating.reviews.map(review => ({
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
      }))
    })
  } : null;

  return (
    <>
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(", ")} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteName} />
      <meta property="fb:app_id" content={fbAppId} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />

      {/* Mobile & PWA Meta Tags */}
      <meta name="theme-color" content="#1a2332" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* E-E-A-T Author Information */}
      {author && (
        <>
          <meta name="author" content={author.name} />
          <meta property="article:author" content={author.name} />
        </>
      )}

      {/* Robots Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />

      {/* Structured Data (JSON-LD) - All sanitized to remove undefined/null/empty values */}
      <script type="application/ld+json">
        {JSON.stringify(sanitizeObject(organizationData))}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(sanitizeObject(websiteData))}
      </script>
      {breadcrumbData && (
        <script type="application/ld+json">
          {JSON.stringify(sanitizeObject(breadcrumbData))}
        </script>
      )}
      {faqData && (
        <script type="application/ld+json">
          {JSON.stringify(sanitizeObject(faqData))}
        </script>
      )}
      {howToData && (
        <script type="application/ld+json">
          {JSON.stringify(sanitizeObject(howToData))}
        </script>
      )}
      {productData && (
        <script type="application/ld+json">
          {JSON.stringify(sanitizeObject(productData))}
        </script>
      )}
      {speakableData && (
        <script type="application/ld+json">
          {JSON.stringify(sanitizeObject(speakableData))}
        </script>
      )}
      {aggregateRatingData && (
        <script type="application/ld+json">
          {JSON.stringify(sanitizeObject(aggregateRatingData))}
        </script>
      )}
    </Helmet>
    {structuredData && <JsonLd schema={structuredData} />}
    </>
  );
}
