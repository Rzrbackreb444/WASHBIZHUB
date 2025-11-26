import { Helmet } from "react-helmet-async";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface AuthorInfo {
  name: string;
  expertise: string;
  credentials?: string;
}

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogType?: "website" | "article" | "product" | "course";
  ogImage?: string;
  keywords?: string[];
  structuredData?: object;
  breadcrumbs?: BreadcrumbItem[];
  author?: AuthorInfo;
  twitterHandle?: string;
  fbAppId?: string;
}

export function SEO({
  title,
  description,
  canonicalUrl,
  ogType = "website",
  ogImage = "/washbizhub-logo.png",
  keywords = [],
  structuredData,
  breadcrumbs = [],
  author,
  twitterHandle = "@washbizhub",
  fbAppId = "557248372195",
}: SEOProps) {
  const siteName = "WashBizHub";
  const fullTitle = title.includes('WashBizHub') ? title : `${title} | ${siteName} - #1 Laundromat Resource`;
  // Use baseUrl from env or default to current origin (safe for SSR)
  const baseUrl = import.meta.env.VITE_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://washbizhub.com');
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const canonical = canonicalUrl ? `${baseUrl}${canonicalUrl}` : `${baseUrl}${currentPath}`;
  const ogImageUrl = ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`;

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

  return (
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

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(organizationData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteData)}
      </script>
      {breadcrumbData && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
      )}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
