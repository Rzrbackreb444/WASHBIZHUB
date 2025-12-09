import {
  LayoutDashboard,
  Briefcase,
  ShoppingCart,
  Store,
  Package,
  Users,
  Building2,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface DashboardNavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  requiredRole?: string;
}

export const dashboardNavItems: DashboardNavItem[] = [
  {
    id: "main",
    label: "Main Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "broker",
    label: "Broker Dashboard",
    href: "/broker-dashboard",
    icon: Briefcase,
  },
  {
    id: "buyer",
    label: "Buyer Dashboard",
    href: "/buyer-dashboard",
    icon: ShoppingCart,
  },
  {
    id: "seller",
    label: "Seller Dashboard",
    href: "/seller-dashboard",
    icon: Store,
  },
  {
    id: "vendor",
    label: "Vendor Dashboard",
    href: "/vendor-dashboard",
    icon: Package,
  },
  {
    id: "affiliate",
    label: "Affiliate Dashboard",
    href: "/affiliate-dashboard",
    icon: Users,
  },
  {
    id: "owner",
    label: "Owner Dashboard",
    href: "/owner-dashboard",
    icon: Building2,
  },
  {
    id: "admin",
    label: "Admin Dashboard",
    href: "/admin-dashboard",
    icon: Settings,
    requiredRole: "admin",
  },
];

export function getNavItemsForRole(userRole?: string | null): DashboardNavItem[] {
  return dashboardNavItems.filter((item) => {
    if (!item.requiredRole) return true;
    return userRole === item.requiredRole;
  });
}
