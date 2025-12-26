import { Helmet } from "react-helmet-async";

interface SeoHeadProps {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: any;
}

export function SeoHead({
  title,
  description,
  keywords = [],
  canonical,
  ogImage = "https://washbizhub.com/og-image.png",
  ogType = "website",
  structuredData,
}: SeoHeadProps) {
  return (
    <Helmet>
      {/* Meta Tags */}
      <title>{title} | WashBizHub</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="WashBizHub" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Canonical */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      )}
    </Helmet>
  );
}
