import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  variant?: "default" | "glassmorphism";
}

function generateBreadcrumbSchema(items: BreadcrumbItem[], baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
  };
}

export function Breadcrumb({ items, className = "", variant = "default" }: BreadcrumbProps) {
  if (!items || items.length <= 1) return null;

  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://washbizhub.com';

  const breadcrumbSchema = generateBreadcrumbSchema(items, baseUrl);

  const variantClasses = {
    default: "flex items-center gap-1.5 text-sm text-muted-foreground",
    glassmorphism: "flex items-center gap-2 text-sm bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20 dark:border-white/10 shadow-sm"
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>
      
      <nav 
        aria-label="Breadcrumb" 
        className={`${variantClasses[variant]} ${className}`}
        data-testid="breadcrumb-navigation"
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;

          return (
            <span key={`${item.url}-${index}`} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight 
                  className={`w-3.5 h-3.5 shrink-0 ${
                    variant === "glassmorphism" 
                      ? "text-[#C8A661]/50" 
                      : "text-muted-foreground/50"
                  }`} 
                />
              )}
              
              {isLast ? (
                <span 
                  className={`font-medium truncate max-w-[200px] ${
                    variant === "glassmorphism" 
                      ? "text-[#C8A661]" 
                      : "text-foreground"
                  }`}
                  aria-current="page"
                  data-testid={`breadcrumb-current-${index}`}
                >
                  {item.name}
                </span>
              ) : (
                <Link 
                  href={item.url}
                  className={`flex items-center gap-1 transition-colors ${
                    variant === "glassmorphism"
                      ? "text-white/80 hover:text-[#C8A661]"
                      : "hover:text-primary"
                  }`}
                  data-testid={`breadcrumb-link-${index}`}
                >
                  {isFirst ? (
                    <>
                      <Home className="w-3.5 h-3.5 shrink-0" />
                      <span className="sr-only">Home</span>
                    </>
                  ) : (
                    <span className="truncate max-w-[150px]">{item.name}</span>
                  )}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}

export { type BreadcrumbItem as BreadcrumbItemType };
