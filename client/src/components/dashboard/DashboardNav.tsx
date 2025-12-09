import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DashboardNavItem {
  id: string;
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: string | number;
  roles?: string[];
}

interface DashboardNavProps {
  items: DashboardNavItem[];
  currentPath?: string;
  userRole?: string;
  variant?: "tabs" | "dropdown";
  className?: string;
}

export function DashboardNav({
  items,
  currentPath,
  userRole,
  variant = "tabs",
  className,
}: DashboardNavProps) {
  const [location] = useLocation();
  const activePath = currentPath || location;

  const visibleItems = items.filter(
    (item) => !item.roles || !userRole || item.roles.includes(userRole)
  );

  if (visibleItems.length === 0) return null;

  if (variant === "dropdown") {
    const activeItem = visibleItems.find((item) => item.href === activePath);
    const ActiveIcon = activeItem?.icon;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn("justify-between gap-2 min-w-[180px]", className)}
            data-testid="button-dashboard-nav-dropdown"
          >
            <span className="flex items-center gap-2">
              {ActiveIcon && <ActiveIcon className="h-4 w-4" />}
              <span className="truncate">{activeItem?.label || "Select Dashboard"}</span>
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === activePath;

            return (
              <DropdownMenuItem
                key={item.id}
                asChild
                className={cn(isActive && "bg-muted")}
              >
                <Link href={item.href} data-testid={`link-nav-${item.id}`}>
                  <span className="flex items-center gap-2 w-full">
                    {Icon && <Icon className="h-4 w-4" />}
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="text-xs bg-[#C8A661] text-[#0A1628] px-1.5 py-0.5 rounded-full font-medium">
                        {item.badge}
                      </span>
                    )}
                  </span>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <nav
      className={cn(
        "flex items-center gap-1 p-1 bg-muted/50 rounded-lg overflow-x-auto",
        className
      )}
      data-testid="nav-dashboard-tabs"
    >
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === activePath;

        return (
          <Link key={item.id} href={item.href}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "gap-2 whitespace-nowrap",
                isActive && "bg-background shadow-sm"
              )}
              data-testid={`button-nav-${item.id}`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full font-medium",
                    isActive
                      ? "bg-[#C8A661] text-[#0A1628]"
                      : "bg-muted-foreground/20 text-muted-foreground"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}

interface DashboardNavGroupProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function DashboardNavGroup({
  title,
  children,
  className,
}: DashboardNavGroupProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {title && (
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
          {title}
        </h4>
      )}
      {children}
    </div>
  );
}

interface DashboardNavLinkProps {
  href: string;
  icon?: LucideIcon;
  label: string;
  badge?: string | number;
  isActive?: boolean;
}

export function DashboardNavLink({
  href,
  icon: Icon,
  label,
  badge,
  isActive,
}: DashboardNavLinkProps) {
  const [location] = useLocation();
  const active = isActive !== undefined ? isActive : location === href;

  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
          active
            ? "bg-[#0A1628] text-white"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        data-testid={`link-sidebar-${label.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {Icon && <Icon className={cn("h-4 w-4", active && "text-[#C8A661]")} />}
        <span className="flex-1 truncate">{label}</span>
        {badge !== undefined && (
          <span
            className={cn(
              "text-xs px-1.5 py-0.5 rounded-full font-medium",
              active
                ? "bg-[#C8A661] text-[#0A1628]"
                : "bg-muted-foreground/20"
            )}
          >
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
}
