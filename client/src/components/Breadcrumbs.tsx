import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Home, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateBreadcrumbSchema } from "@/lib/structured-data";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface BreadcrumbItemData {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItemData[];
  className?: string;
}

const ITEMS_TO_DISPLAY = 3;

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://washbizhub.com';

  const schemaItems = items.map((item, index) => ({
    name: item.label,
    url: item.href || (index === items.length - 1 ? window.location.pathname : "/"),
  }));

  const breadcrumbSchema = generateBreadcrumbSchema({ items: schemaItems });

  const shouldCollapse = items.length > ITEMS_TO_DISPLAY;
  const firstItem = items[0];
  const middleItems = shouldCollapse ? items.slice(1, -2) : items.slice(1, -1);
  const lastItems = shouldCollapse ? items.slice(-2) : [];
  const currentItem = items[items.length - 1];

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      <Breadcrumb
        className={cn(
          "bg-white/10 backdrop-blur-xl rounded-xl px-4 py-2.5 border border-white/20 shadow-lg inline-flex",
          className
        )}
        data-testid="breadcrumbs-navigation"
      >
        <BreadcrumbList className="flex-wrap gap-1.5 sm:gap-2">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href={firstItem.href || "/"}
                className="flex items-center gap-1.5 text-white/80 hover:text-accent transition-colors"
                data-testid="breadcrumb-home-link"
              >
                <Home className="h-4 w-4 shrink-0 text-accent/80" />
                <span className="sr-only md:not-sr-only md:inline">{firstItem.label}</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {items.length > 1 && (
            <BreadcrumbSeparator className="text-accent/50">
              <ChevronRight className="h-3.5 w-3.5" />
            </BreadcrumbSeparator>
          )}

          {shouldCollapse && middleItems.length > 0 && (
            <>
              <BreadcrumbItem className="hidden md:flex">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="flex items-center gap-1 text-white/70 hover:text-accent transition-colors"
                    data-testid="breadcrumb-ellipsis-trigger"
                  >
                    <BreadcrumbEllipsis className="h-4 w-4" />
                    <span className="sr-only">Show more breadcrumbs</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="bg-gray-900/95 backdrop-blur-xl border border-white/20"
                  >
                    {middleItems.map((item, index) => (
                      <DropdownMenuItem
                        key={`collapsed-${index}`}
                        asChild
                        className="text-white/80 hover:text-accent hover:bg-white/10 focus:bg-white/10 focus:text-accent"
                      >
                        <Link
                          href={item.href || "#"}
                          data-testid={`breadcrumb-collapsed-item-${index}`}
                        >
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:flex text-accent/50">
                <ChevronRight className="h-3.5 w-3.5" />
              </BreadcrumbSeparator>
            </>
          )}

          {!shouldCollapse &&
            middleItems.map((item, index) => (
              <BreadcrumbItem key={`middle-${index}`} className="hidden md:flex">
                <BreadcrumbLink asChild>
                  <Link
                    href={item.href || "#"}
                    className="text-white/80 hover:text-accent transition-colors truncate max-w-[150px]"
                    data-testid={`breadcrumb-link-${index + 1}`}
                  >
                    {item.label}
                  </Link>
                </BreadcrumbLink>
                <BreadcrumbSeparator className="text-accent/50 ml-1.5">
                  <ChevronRight className="h-3.5 w-3.5" />
                </BreadcrumbSeparator>
              </BreadcrumbItem>
            ))}

          {shouldCollapse &&
            lastItems.slice(0, -1).map((item, index) => (
              <BreadcrumbItem key={`last-${index}`}>
                <BreadcrumbLink asChild>
                  <Link
                    href={item.href || "#"}
                    className="text-white/80 hover:text-accent transition-colors truncate max-w-[150px]"
                    data-testid={`breadcrumb-last-link-${index}`}
                  >
                    {item.label}
                  </Link>
                </BreadcrumbLink>
                <BreadcrumbSeparator className="text-accent/50 ml-1.5">
                  <ChevronRight className="h-3.5 w-3.5" />
                </BreadcrumbSeparator>
              </BreadcrumbItem>
            ))}

          {items.length > 1 && (
            <BreadcrumbItem>
              <BreadcrumbPage
                className="font-medium text-accent truncate max-w-[200px]"
                data-testid="breadcrumb-current-page"
              >
                {currentItem.label}
              </BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}

export default Breadcrumbs;
