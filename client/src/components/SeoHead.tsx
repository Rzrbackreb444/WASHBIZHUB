import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";

interface SeoHeadProps {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: any;
  noIndex?: boolean;
}

// Base canonical domain - all URLs should point to the primary .com domain
const CANONICAL_DOMAIN = "https://washbizhub.com";

export function SeoHead({
  title,
  description,
  keywords = [],
  canonical,
  ogImage = "https://washbizhub.com/og-image.png",
  ogType = "website",
  structuredData,
  noIndex = false,
}: SeoHeadProps) {
  const [location] = useLocation();
  
  // Auto-generate canonical URL if not provided - always points to washbizhub.com
  // This consolidates SEO authority and prevents duplicate content issues
  const canonicalUrl = canonical || `${CANONICAL_DOMAIN}${location}`;
  const ogUrl = `${CANONICAL_DOMAIN}${location}`;
  
  return (
    <Helmet>
      {/* Meta Tags */}
      <title>{title} | WashBizHub</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:site_name" content="WashBizHub" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Canonical - ALWAYS set to consolidate SEO authority on .com domain */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      )}
    </Helmet>
  );
}
