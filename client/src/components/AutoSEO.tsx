import { useLocation } from "wouter";
import { SEOHead } from "./SEOHead";
import { 
  getRouteSEO, 
  buildCanonicalUrl, 
  shouldNoIndex,
  COMMON_FAQS,
  generateBreadcrumbSchema
} from "@/lib/seo-config";

interface AutoSEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  noIndex?: boolean;
  pageType?: 'website' | 'article' | 'product' | 'course' | 'faq' | 'howto' | 'localbusiness' | 'software';
  faqs?: { question: string; answer: string }[];
  breadcrumbs?: { name: string; url: string }[];
  ogImage?: string;
  author?: {
    name: string;
    url?: string;
    jobTitle?: string;
  };
  datePublished?: string;
  dateModified?: string;
}

export function AutoSEO(props: AutoSEOProps) {
  const [location] = useLocation();
  const pathname = location.split("?")[0];
  
  const searchParams = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search) 
    : undefined;
  
  const routeConfig = getRouteSEO(pathname);
  
  const title = props.title || routeConfig.title;
  const description = props.description || routeConfig.description;
  const keywords = props.keywords || routeConfig.keywords || [];
  const noIndex = props.noIndex ?? routeConfig.noIndex ?? shouldNoIndex(pathname);
  const pageType = props.pageType || routeConfig.pageType || 'website';
  
  const canonicalUrl = buildCanonicalUrl(pathname, searchParams);
  const canonicalPath = canonicalUrl.replace('https://washbizhub.com', '');
  
  return (
    <SEOHead
      title={title}
      description={description}
      keywords={keywords}
      canonicalUrl={canonicalPath}
      noIndex={noIndex}
      pageType={pageType}
      faqs={props.faqs}
      breadcrumbs={props.breadcrumbs}
      ogImage={props.ogImage}
      author={props.author}
      datePublished={props.datePublished}
      dateModified={props.dateModified}
    />
  );
}

export function withAutoSEO<P extends object>(
  Component: React.ComponentType<P>,
  seoProps?: Partial<AutoSEOProps>
) {
  return function WrappedComponent(props: P) {
    return (
      <>
        <AutoSEO {...seoProps} />
        <Component {...props} />
      </>
    );
  };
}

export default AutoSEO;
