import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Globe, Users, Zap, Award, ChevronRight } from "lucide-react";
import { Star } from "@/lib/icon-registry";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  WASHBIZHUB_GRADIENTS,
  WASHBIZHUB_SEO_DEFAULTS,
  WASHBIZHUB_PAGE_DEFAULTS,
  WASHBIZHUB_TRUST_STATS,
  WASHBIZHUB_KEYWORDS,
  WASHBIZHUB_FAQS_DEFAULT,
  type WashBizHubPageType,
} from "@/lib/design-system";

function sanitizeObject<T extends object>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (_, value) =>
    value === undefined || value === null || value === '' ||
    (Array.isArray(value) && value.length === 0) ? undefined : value
  ));
}

interface BreadcrumbItem {
  label: string;
  href: string;
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
}

interface WashBizHubPageProps {
  title: string;
  description: string;
  pageType: WashBizHubPageType;
  keywords?: string[];
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
  customRating?: { value: number; count: number };
  faqs?: FAQItem[];
  features?: string[];
  showTrustBar?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  datePublished?: string;
  dateModified?: string;
  articleSection?: string;
  howTo?: HowToData;
  productOffers?: ProductOffer[];
  noIndex?: boolean;
  className?: string;
  containerClassName?: string;
  fullWidth?: boolean;
}

function TrustBar() {
  return (
    <div className="bg-[#1e3a5f] border-b border-[#C8A661]/20" data-testid="trust-bar-washbizhub">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-center py-2.5 gap-4 sm:gap-8 text-xs sm:text-sm flex-wrap">
          <div className="hidden sm:flex items-center gap-2 text-white/90">
            <Globe className="w-4 h-4 text-[#C8A661]" aria-hidden="true" />
            <span className="font-medium">{WASHBIZHUB_TRUST_STATS.countries} Countries</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <Users className="w-4 h-4 text-[#C8A661]" aria-hidden="true" />
            <span className="font-semibold text-white">{WASHBIZHUB_TRUST_STATS.members} Members</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-white/90">
            <Zap className="w-4 h-4 text-[#C8A661]" aria-hidden="true" />
            <span className="font-medium">{WASHBIZHUB_TRUST_STATS.cleanbiFactors}-Factor CLEANBI Score</span>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-white/90">
            <Award className="w-4 h-4 text-[#C8A661]" aria-hidden="true" />
            <span className="font-medium">#1 Laundromat Platform</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/90">
            <div className="flex" aria-label={`${WASHBIZHUB_TRUST_STATS.rating} out of 5 stars`}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < Math.floor(WASHBIZHUB_TRUST_STATS.rating) ? 'text-[#C8A661] fill-[#C8A661]' : 'text-white/30'}`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="font-medium text-[#C8A661]">{WASHBIZHUB_TRUST_STATS.rating}</span>
            <span className="text-white/60">({WASHBIZHUB_TRUST_STATS.reviewCount.toLocaleString()})</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  if (items.length === 0) return null;

  const allItems = [{ label: 'Home', href: '/' }, ...items];

  return (
    <nav aria-label="Breadcrumb" className="py-3 px-4 sm:px-6" data-testid="breadcrumb-nav">
      <ol className="flex items-center flex-wrap gap-1 text-sm" itemScope itemType="https://schema.org/BreadcrumbList">
        {allItems.map((item, index) => (
          <li
            key={item.href}
            className="flex items-center"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-white/40 mx-1" aria-hidden="true" />
            )}
            {index === allItems.length - 1 ? (
              <span
                className="text-[#C8A661] font-medium"
                itemProp="name"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <Link href={item.href}>
                <span
                  className="text-white/70 hover:text-white transition-colors cursor-pointer"
                  itemProp="name"
                >
                  {item.label}
                </span>
              </Link>
            )}
            <meta itemProp="position" content={String(index + 1)} />
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function WashBizHubPage({
  title,
  description,
  pageType,
  keywords = [],
  breadcrumbs = [],
  children,
  customRating,
  faqs,
  features = [],
  showTrustBar = true,
  showHeader = true,
  showFooter = true,
  canonicalUrl,
  ogImage = '/washbizhub-og-image.png',
  ogType = 'website',
  datePublished,
  dateModified,
  articleSection,
  howTo,
  productOffers = [],
  noIndex = false,
  className = '',
  containerClassName = '',
  fullWidth = false,
}: WashBizHubPageProps) {
  const baseUrl = import.meta.env.VITE_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://washbizhub.com');
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const canonical = canonicalUrl ? `${baseUrl}${canonicalUrl}` : `${baseUrl}${currentPath}`;
  const ogImageUrl = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;
  const currentDate = new Date().toISOString();

  const pageDefaults = WASHBIZHUB_PAGE_DEFAULTS[pageType];
  const rating = customRating || { value: pageDefaults.ratingValue, count: pageDefaults.reviewCount };

  const fullTitle = title.includes('WashBizHub') ? title : `${title} | WashBizHub - #1 Laundromat Resource`;

  const mergedKeywords = [
    ...new Set([
      ...keywords,
      ...WASHBIZHUB_KEYWORDS.core.slice(0, 3),
      ...(pageType === 'tool' ? WASHBIZHUB_KEYWORDS.tools : []),
      ...(pageType === 'marketplace' ? WASHBIZHUB_KEYWORDS.marketplace : []),
      ...(pageType === 'blog' || pageType === 'content' ? WASHBIZHUB_KEYWORDS.education : []),
    ]),
  ];

  const effectiveFaqs = faqs && faqs.length > 0 ? faqs : WASHBIZHUB_FAQS_DEFAULT.slice(0, 4);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "WashBizHub",
    "alternateName": WASHBIZHUB_SEO_DEFAULTS.tagline,
    "url": baseUrl,
    "logo": `${baseUrl}/washbizhub-logo.png`,
    "description": WASHBIZHUB_SEO_DEFAULTS.description,
    "sameAs": Object.values(WASHBIZHUB_SEO_DEFAULTS.socialLinks),
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": WASHBIZHUB_SEO_DEFAULTS.contact.email,
      "areaServed": "Worldwide",
      "availableLanguage": "English",
    },
    "founder": {
      "@type": "Person",
      "name": WASHBIZHUB_SEO_DEFAULTS.author.name,
      "jobTitle": WASHBIZHUB_SEO_DEFAULTS.author.expertise,
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "WashBizHub",
    "alternateName": WASHBIZHUB_SEO_DEFAULTS.tagline,
    "url": baseUrl,
    "description": WASHBIZHUB_SEO_DEFAULTS.description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/resources?searchQuery={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const breadcrumbSchema = breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
      ...breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.label,
        "item": item.href.startsWith('http') ? item.href : `${baseUrl}${item.href}`,
      })),
    ],
  } : null;

  const faqSchema = effectiveFaqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": effectiveFaqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  } : null;

  const localBusinessSchema = pageType === 'landing' ? {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "WashBizHub",
    "description": WASHBIZHUB_SEO_DEFAULTS.description,
    "url": baseUrl,
    "logo": `${baseUrl}/washbizhub-logo.png`,
    "image": ogImageUrl,
    "telephone": WASHBIZHUB_SEO_DEFAULTS.contact.phone,
    "email": WASHBIZHUB_SEO_DEFAULTS.contact.email,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": WASHBIZHUB_SEO_DEFAULTS.location.geo.latitude,
      "longitude": WASHBIZHUB_SEO_DEFAULTS.location.geo.longitude,
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": rating.value,
      "reviewCount": rating.count,
      "bestRating": 5,
      "worstRating": 1,
    },
  } : null;

  const softwareAppSchema = pageType === 'tool' ? {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": title,
    "description": description,
    "url": canonical,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": rating.value,
      "reviewCount": rating.count,
      "bestRating": 5,
      "worstRating": 1,
    },
    ...(features.length > 0 && { "featureList": features.join(", ") }),
  } : null;

  const articleSchema = (pageType === 'blog' || pageType === 'content') ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "url": canonical,
    "image": ogImageUrl,
    "author": {
      "@type": "Person",
      "name": WASHBIZHUB_SEO_DEFAULTS.author.name,
      "description": WASHBIZHUB_SEO_DEFAULTS.author.credentials,
    },
    "publisher": {
      "@type": "Organization",
      "name": "WashBizHub",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/washbizhub-logo.png`,
      },
    },
    "datePublished": datePublished || currentDate,
    "dateModified": dateModified || currentDate,
    ...(articleSection && { "articleSection": articleSection }),
  } : null;

  const productSchema = pageType === 'pricing' || productOffers.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "WashBizHub Platform",
    "description": "Complete laundromat management platform with CLEANBI scoring, marketplace, AI consulting, and business tools.",
    "brand": {
      "@type": "Brand",
      "name": "WashBizHub",
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": rating.value,
      "reviewCount": rating.count,
      "bestRating": 5,
      "worstRating": 1,
    },
    "offers": productOffers.length > 0 ? productOffers.map((offer) => ({
      "@type": "Offer",
      "name": offer.name,
      "description": offer.description,
      "price": offer.price,
      "priceCurrency": offer.priceCurrency || "USD",
      "availability": `https://schema.org/${offer.availability || 'InStock'}`,
      "url": canonical,
    })) : {
      "@type": "AggregateOffer",
      "lowPrice": "0",
      "highPrice": "199",
      "priceCurrency": "USD",
      "offerCount": 4,
    },
  } : null;

  const itemListSchema = pageType === 'marketplace' ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": title,
    "description": description,
    "url": canonical,
    "numberOfItems": 100,
    "itemListOrder": "https://schema.org/ItemListOrderDescending",
  } : null;

  const howToSchema = howTo ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": howTo.name,
    "description": howTo.description,
    "step": howTo.steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      ...(step.image && { "image": step.image }),
    })),
    ...(howTo.totalTime && { "totalTime": howTo.totalTime }),
  } : null;

  const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": fullTitle,
    "url": canonical,
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", "h2", ".speakable"],
    },
    "description": description,
  };

  return (
    <>
      <Helmet>
        <title>{fullTitle}</title>
        <meta name="title" content={fullTitle} />
        <meta name="description" content={description} />
        {mergedKeywords.length > 0 && (
          <meta name="keywords" content={mergedKeywords.join(", ")} />
        )}
        <link rel="canonical" href={canonical} />

        <meta property="og:type" content={ogType} />
        <meta property="og:url" content={canonical} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="WashBizHub" />
        <meta property="fb:app_id" content="557248372195" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonical} />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImageUrl} />
        <meta name="twitter:site" content="@washbizhub" />
        <meta name="twitter:creator" content="@washbizhub" />

        <meta name="theme-color" content="#1e3a5f" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        <meta name="author" content={WASHBIZHUB_SEO_DEFAULTS.author.name} />
        <meta property="article:author" content={WASHBIZHUB_SEO_DEFAULTS.author.name} />

        {noIndex ? (
          <meta name="robots" content="noindex, nofollow" />
        ) : (
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        )}
        <meta name="googlebot" content="index, follow" />

        <script type="application/ld+json">
          {JSON.stringify(sanitizeObject(organizationSchema))}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(sanitizeObject(websiteSchema))}
        </script>
        {breadcrumbSchema && (
          <script type="application/ld+json">
            {JSON.stringify(sanitizeObject(breadcrumbSchema))}
          </script>
        )}
        {faqSchema && (
          <script type="application/ld+json">
            {JSON.stringify(sanitizeObject(faqSchema))}
          </script>
        )}
        {localBusinessSchema && (
          <script type="application/ld+json">
            {JSON.stringify(sanitizeObject(localBusinessSchema))}
          </script>
        )}
        {softwareAppSchema && (
          <script type="application/ld+json">
            {JSON.stringify(sanitizeObject(softwareAppSchema))}
          </script>
        )}
        {articleSchema && (
          <script type="application/ld+json">
            {JSON.stringify(sanitizeObject(articleSchema))}
          </script>
        )}
        {productSchema && (
          <script type="application/ld+json">
            {JSON.stringify(sanitizeObject(productSchema))}
          </script>
        )}
        {itemListSchema && (
          <script type="application/ld+json">
            {JSON.stringify(sanitizeObject(itemListSchema))}
          </script>
        )}
        {howToSchema && (
          <script type="application/ld+json">
            {JSON.stringify(sanitizeObject(howToSchema))}
          </script>
        )}
        <script type="application/ld+json">
          {JSON.stringify(sanitizeObject(speakableSchema))}
        </script>
      </Helmet>

      <div
        className={`min-h-screen flex flex-col ${WASHBIZHUB_GRADIENTS.primary} ${className}`}
        data-testid="washbizhub-page"
      >
        {showTrustBar && <TrustBar />}
        {showHeader && <Header />}

        <main
          id="main-content"
          className={`flex-1 ${containerClassName}`}
          data-testid="page-main-content"
        >
          {breadcrumbs.length > 0 && (
            <div className="max-w-7xl mx-auto">
              <BreadcrumbNav items={breadcrumbs} />
            </div>
          )}
          {fullWidth ? (
            children
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
              {children}
            </div>
          )}
        </main>

        {showFooter && <Footer />}
      </div>
    </>
  );
}

export { TrustBar, BreadcrumbNav };
export type { WashBizHubPageProps, BreadcrumbItem, FAQItem, HowToStep, HowToData, ProductOffer };
