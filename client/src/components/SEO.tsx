import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogType?: "website" | "article";
  ogImage?: string;
  keywords?: string[];
  structuredData?: object;
}

export function SEO({
  title,
  description,
  canonicalUrl,
  ogType = "website",
  ogImage = "/og-image.png",
  keywords = [],
  structuredData,
}: SEOProps) {
  const siteName = "WashBizHub";
  const fullTitle = `${title} | ${siteName}`;
  const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
  const canonical = canonicalUrl ? `${baseUrl}${canonicalUrl}` : `${baseUrl}${window.location.pathname}`;
  const ogImageUrl = ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`;

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
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
