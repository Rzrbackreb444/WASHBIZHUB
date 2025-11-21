import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}
      data-testid="breadcrumb-navigation"
    >
      <Link href="/">
        <a className="flex items-center hover:text-foreground transition-colors" data-testid="breadcrumb-home">
          <Home className="w-4 h-4" />
          <span className="sr-only">Home</span>
        </a>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          {index === items.length - 1 ? (
            <span 
              className="font-medium text-foreground" 
              aria-current="page"
              data-testid={`breadcrumb-current-${index}`}
            >
              {item.name}
            </span>
          ) : (
            <Link href={item.url}>
              <a 
                className="hover:text-foreground transition-colors"
                data-testid={`breadcrumb-link-${index}`}
              >
                {item.name}
              </a>
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
