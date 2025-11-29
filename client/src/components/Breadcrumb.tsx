import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import type { BreadcrumbItem } from "@shared/seo-config";

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  if (!items || items.length <= 1) return null;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center gap-1 text-sm text-muted-foreground ${className}`}
      data-testid="breadcrumb-navigation"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isFirst = index === 0;

        return (
          <span key={item.url} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            )}
            
            {isLast ? (
              <span 
                className="font-medium text-foreground truncate max-w-[200px]"
                aria-current="page"
                data-testid={`breadcrumb-current-${index}`}
              >
                {item.name}
              </span>
            ) : (
              <Link 
                href={item.url}
                className="hover:text-primary transition-colors flex items-center gap-1"
                data-testid={`breadcrumb-link-${index}`}
              >
                {isFirst && <Home className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate max-w-[150px]">{isFirst ? '' : item.name}</span>
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
