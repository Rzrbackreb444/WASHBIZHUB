import type { LucideIcon } from "lucide-react";
import {
  DollarSign,
  ShoppingCart,
  Wrench,
  ClipboardList,
  TrendingUp,
  PieChart,
  AlertTriangle,
  Clock,
  Zap,
  Package,
  MapPin,
  BarChart3,
  Gauge,
  Activity,
  Bell,
  Bookmark,
  Eye,
  LayoutGrid,
  Globe,
  Rocket,
  Calculator,
  FileSpreadsheet,
  LineChart,
  Layers,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { WIDGET_TYPES, type WidgetType } from "@shared/schema";

export type WidgetCategory =
  | "pos"
  | "service"
  | "cleanbi"
  | "website"
  | "calculators"
  | "analytics"
  | "activity"
  | "quick_actions";

export interface WidgetSize {
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface WidgetDefinition {
  id: WidgetType;
  label: string;
  description: string;
  icon: LucideIcon;
  category: WidgetCategory;
  defaultSize: WidgetSize;
  requiresAuth: boolean;
  isPremium: boolean;
  dataEndpoint?: string;
  refreshInterval: number;
}

export const WIDGET_CATALOG: Record<WidgetType, WidgetDefinition> = {
  // ============ POS Widgets ============
  [WIDGET_TYPES.POS_REVENUE_CARD]: {
    id: WIDGET_TYPES.POS_REVENUE_CARD,
    label: "Revenue Card",
    description: "Today's revenue summary with trends",
    icon: DollarSign,
    category: "pos",
    defaultSize: { w: 3, h: 2, minW: 2, minH: 2 },
    requiresAuth: true,
    isPremium: false,
    dataEndpoint: "/api/pos/revenue",
    refreshInterval: 60,
  },
  [WIDGET_TYPES.POS_ORDERS_TODAY]: {
    id: WIDGET_TYPES.POS_ORDERS_TODAY,
    label: "Orders Today",
    description: "Count and status of today's orders",
    icon: ShoppingCart,
    category: "pos",
    defaultSize: { w: 3, h: 2, minW: 2, minH: 2 },
    requiresAuth: true,
    isPremium: false,
    dataEndpoint: "/api/pos/orders/today",
    refreshInterval: 30,
  },
  [WIDGET_TYPES.POS_MACHINE_STATUS]: {
    id: WIDGET_TYPES.POS_MACHINE_STATUS,
    label: "Machine Status",
    description: "Real-time machine availability",
    icon: Wrench,
    category: "pos",
    defaultSize: { w: 4, h: 3, minW: 3, minH: 2 },
    requiresAuth: true,
    isPremium: false,
    dataEndpoint: "/api/pos/machines/status",
    refreshInterval: 15,
  },
  [WIDGET_TYPES.POS_RECENT_ORDERS]: {
    id: WIDGET_TYPES.POS_RECENT_ORDERS,
    label: "Recent Orders",
    description: "Latest orders list with quick actions",
    icon: ClipboardList,
    category: "pos",
    defaultSize: { w: 4, h: 4, minW: 3, minH: 3 },
    requiresAuth: true,
    isPremium: false,
    dataEndpoint: "/api/pos/orders/recent",
    refreshInterval: 30,
  },
  [WIDGET_TYPES.POS_REVENUE_CHART]: {
    id: WIDGET_TYPES.POS_REVENUE_CHART,
    label: "Revenue Chart",
    description: "Revenue trends over time",
    icon: TrendingUp,
    category: "pos",
    defaultSize: { w: 6, h: 3, minW: 4, minH: 3 },
    requiresAuth: true,
    isPremium: true,
    dataEndpoint: "/api/pos/revenue/chart",
    refreshInterval: 300,
  },
  [WIDGET_TYPES.POS_SERVICE_BREAKDOWN]: {
    id: WIDGET_TYPES.POS_SERVICE_BREAKDOWN,
    label: "Service Breakdown",
    description: "Revenue by service type",
    icon: PieChart,
    category: "pos",
    defaultSize: { w: 4, h: 3, minW: 3, minH: 3 },
    requiresAuth: true,
    isPremium: true,
    dataEndpoint: "/api/pos/services/breakdown",
    refreshInterval: 300,
  },

  // ============ Service Guy AI Widgets ============
  [WIDGET_TYPES.SERVICE_REPAIR_TICKETS]: {
    id: WIDGET_TYPES.SERVICE_REPAIR_TICKETS,
    label: "Repair Tickets",
    description: "Open repair tickets and priorities",
    icon: AlertTriangle,
    category: "service",
    defaultSize: { w: 4, h: 4, minW: 3, minH: 3 },
    requiresAuth: true,
    isPremium: false,
    dataEndpoint: "/api/service/tickets",
    refreshInterval: 60,
  },
  [WIDGET_TYPES.SERVICE_MAINTENANCE_DUE]: {
    id: WIDGET_TYPES.SERVICE_MAINTENANCE_DUE,
    label: "Maintenance Due",
    description: "Upcoming scheduled maintenance",
    icon: Clock,
    category: "service",
    defaultSize: { w: 4, h: 3, minW: 3, minH: 2 },
    requiresAuth: true,
    isPremium: false,
    dataEndpoint: "/api/service/maintenance",
    refreshInterval: 300,
  },
  [WIDGET_TYPES.SERVICE_DIAGNOSTIC_QUICK]: {
    id: WIDGET_TYPES.SERVICE_DIAGNOSTIC_QUICK,
    label: "Quick Diagnostic",
    description: "AI-powered quick machine diagnostics",
    icon: Zap,
    category: "service",
    defaultSize: { w: 3, h: 2, minW: 2, minH: 2 },
    requiresAuth: true,
    isPremium: true,
    dataEndpoint: "/api/service/diagnostic",
    refreshInterval: 0,
  },
  [WIDGET_TYPES.SERVICE_PARTS_LOW]: {
    id: WIDGET_TYPES.SERVICE_PARTS_LOW,
    label: "Parts Low Stock",
    description: "Parts inventory running low",
    icon: Package,
    category: "service",
    defaultSize: { w: 3, h: 3, minW: 2, minH: 2 },
    requiresAuth: true,
    isPremium: false,
    dataEndpoint: "/api/service/parts/low",
    refreshInterval: 600,
  },

  // ============ CLEANBI Widgets ============
  [WIDGET_TYPES.CLEANBI_RECENT_SCORES]: {
    id: WIDGET_TYPES.CLEANBI_RECENT_SCORES,
    label: "Recent Scores",
    description: "Latest CLEANBI location scores",
    icon: MapPin,
    category: "cleanbi",
    defaultSize: { w: 4, h: 3, minW: 3, minH: 2 },
    requiresAuth: true,
    isPremium: false,
    dataEndpoint: "/api/cleanbi/scores/recent",
    refreshInterval: 0,
  },
  [WIDGET_TYPES.CLEANBI_SAVED_ANALYSES]: {
    id: WIDGET_TYPES.CLEANBI_SAVED_ANALYSES,
    label: "Saved Analyses",
    description: "Your saved location analyses",
    icon: Bookmark,
    category: "cleanbi",
    defaultSize: { w: 4, h: 4, minW: 3, minH: 3 },
    requiresAuth: true,
    isPremium: false,
    dataEndpoint: "/api/cleanbi/analyses/saved",
    refreshInterval: 0,
  },
  [WIDGET_TYPES.CLEANBI_QUOTA_STATUS]: {
    id: WIDGET_TYPES.CLEANBI_QUOTA_STATUS,
    label: "Quota Status",
    description: "Your CLEANBI usage quota",
    icon: Gauge,
    category: "cleanbi",
    defaultSize: { w: 2, h: 2, minW: 2, minH: 2 },
    requiresAuth: true,
    isPremium: false,
    dataEndpoint: "/api/cleanbi/quota",
    refreshInterval: 60,
  },
  [WIDGET_TYPES.CLEANBI_SCORE_CHART]: {
    id: WIDGET_TYPES.CLEANBI_SCORE_CHART,
    label: "Score Trends",
    description: "CLEANBI scores over time",
    icon: LineChart,
    category: "cleanbi",
    defaultSize: { w: 6, h: 3, minW: 4, minH: 3 },
    requiresAuth: true,
    isPremium: true,
    dataEndpoint: "/api/cleanbi/scores/chart",
    refreshInterval: 0,
  },

  // ============ Website Builder Widgets ============
  [WIDGET_TYPES.WEBSITE_PROJECTS]: {
    id: WIDGET_TYPES.WEBSITE_PROJECTS,
    label: "Website Projects",
    description: "Your website builder projects",
    icon: Globe,
    category: "website",
    defaultSize: { w: 4, h: 3, minW: 3, minH: 2 },
    requiresAuth: true,
    isPremium: false,
    dataEndpoint: "/api/websites/projects",
    refreshInterval: 0,
  },
  [WIDGET_TYPES.WEBSITE_QUICK_BUILD]: {
    id: WIDGET_TYPES.WEBSITE_QUICK_BUILD,
    label: "Quick Build",
    description: "Quickly create a new website",
    icon: Rocket,
    category: "website",
    defaultSize: { w: 3, h: 2, minW: 2, minH: 2 },
    requiresAuth: true,
    isPremium: true,
    refreshInterval: 0,
  },

  // ============ Calculator Widgets ============
  [WIDGET_TYPES.CALC_QUICK_ACCESS]: {
    id: WIDGET_TYPES.CALC_QUICK_ACCESS,
    label: "Quick Calculators",
    description: "Quick access to all calculators",
    icon: Calculator,
    category: "calculators",
    defaultSize: { w: 3, h: 3, minW: 2, minH: 2 },
    requiresAuth: false,
    isPremium: false,
    refreshInterval: 0,
  },
  [WIDGET_TYPES.CALC_SAVED_RESULTS]: {
    id: WIDGET_TYPES.CALC_SAVED_RESULTS,
    label: "Saved Results",
    description: "Your saved calculator results",
    icon: FileSpreadsheet,
    category: "calculators",
    defaultSize: { w: 4, h: 3, minW: 3, minH: 2 },
    requiresAuth: true,
    isPremium: false,
    dataEndpoint: "/api/calculators/saved",
    refreshInterval: 0,
  },
  [WIDGET_TYPES.CALC_ROI_SUMMARY]: {
    id: WIDGET_TYPES.CALC_ROI_SUMMARY,
    label: "ROI Summary",
    description: "Your investment ROI overview",
    icon: Target,
    category: "calculators",
    defaultSize: { w: 4, h: 3, minW: 3, minH: 2 },
    requiresAuth: true,
    isPremium: true,
    dataEndpoint: "/api/calculators/roi",
    refreshInterval: 300,
  },

  // ============ Analytics Widgets ============
  [WIDGET_TYPES.ANALYTICS_KPI_GRID]: {
    id: WIDGET_TYPES.ANALYTICS_KPI_GRID,
    label: "KPI Grid",
    description: "Key performance indicators grid",
    icon: LayoutGrid,
    category: "analytics",
    defaultSize: { w: 6, h: 2, minW: 4, minH: 2 },
    requiresAuth: true,
    isPremium: false,
    dataEndpoint: "/api/analytics/kpis",
    refreshInterval: 60,
  },
  [WIDGET_TYPES.ANALYTICS_TREND_LINE]: {
    id: WIDGET_TYPES.ANALYTICS_TREND_LINE,
    label: "Trend Line",
    description: "Configurable trend line chart",
    icon: TrendingUp,
    category: "analytics",
    defaultSize: { w: 6, h: 3, minW: 4, minH: 3 },
    requiresAuth: true,
    isPremium: true,
    dataEndpoint: "/api/analytics/trends",
    refreshInterval: 300,
  },
  [WIDGET_TYPES.ANALYTICS_PIE_CHART]: {
    id: WIDGET_TYPES.ANALYTICS_PIE_CHART,
    label: "Pie Chart",
    description: "Distribution pie chart",
    icon: PieChart,
    category: "analytics",
    defaultSize: { w: 4, h: 3, minW: 3, minH: 3 },
    requiresAuth: true,
    isPremium: true,
    dataEndpoint: "/api/analytics/distribution",
    refreshInterval: 300,
  },
  [WIDGET_TYPES.ANALYTICS_GAUGE]: {
    id: WIDGET_TYPES.ANALYTICS_GAUGE,
    label: "Gauge Meter",
    description: "Visual gauge for key metrics",
    icon: Gauge,
    category: "analytics",
    defaultSize: { w: 3, h: 3, minW: 2, minH: 2 },
    requiresAuth: true,
    isPremium: true,
    dataEndpoint: "/api/analytics/gauge",
    refreshInterval: 60,
  },
  [WIDGET_TYPES.ANALYTICS_HEATMAP]: {
    id: WIDGET_TYPES.ANALYTICS_HEATMAP,
    label: "Heatmap",
    description: "Activity heatmap visualization",
    icon: Layers,
    category: "analytics",
    defaultSize: { w: 6, h: 4, minW: 4, minH: 3 },
    requiresAuth: true,
    isPremium: true,
    dataEndpoint: "/api/analytics/heatmap",
    refreshInterval: 600,
  },

  // ============ Activity & Social Widgets ============
  [WIDGET_TYPES.ACTIVITY_FEED]: {
    id: WIDGET_TYPES.ACTIVITY_FEED,
    label: "Activity Feed",
    description: "Your recent activity stream",
    icon: Activity,
    category: "activity",
    defaultSize: { w: 4, h: 4, minW: 3, minH: 3 },
    requiresAuth: true,
    isPremium: false,
    dataEndpoint: "/api/activity/feed",
    refreshInterval: 30,
  },
  [WIDGET_TYPES.NOTIFICATIONS]: {
    id: WIDGET_TYPES.NOTIFICATIONS,
    label: "Notifications",
    description: "Your notifications center",
    icon: Bell,
    category: "activity",
    defaultSize: { w: 3, h: 3, minW: 2, minH: 2 },
    requiresAuth: true,
    isPremium: false,
    dataEndpoint: "/api/notifications",
    refreshInterval: 30,
  },
  [WIDGET_TYPES.SAVED_ITEMS]: {
    id: WIDGET_TYPES.SAVED_ITEMS,
    label: "Saved Items",
    description: "Your bookmarked content",
    icon: Bookmark,
    category: "activity",
    defaultSize: { w: 4, h: 3, minW: 3, minH: 2 },
    requiresAuth: true,
    isPremium: false,
    dataEndpoint: "/api/saved-items",
    refreshInterval: 0,
  },
  [WIDGET_TYPES.RECENT_VIEWED]: {
    id: WIDGET_TYPES.RECENT_VIEWED,
    label: "Recently Viewed",
    description: "Items you recently viewed",
    icon: Eye,
    category: "activity",
    defaultSize: { w: 4, h: 3, minW: 3, minH: 2 },
    requiresAuth: true,
    isPremium: false,
    dataEndpoint: "/api/recently-viewed",
    refreshInterval: 0,
  },

  // ============ Quick Actions Widgets ============
  [WIDGET_TYPES.QUICK_ACTIONS]: {
    id: WIDGET_TYPES.QUICK_ACTIONS,
    label: "Quick Actions",
    description: "Common actions at your fingertips",
    icon: Sparkles,
    category: "quick_actions",
    defaultSize: { w: 3, h: 2, minW: 2, minH: 2 },
    requiresAuth: false,
    isPremium: false,
    refreshInterval: 0,
  },
  [WIDGET_TYPES.SHORTCUTS]: {
    id: WIDGET_TYPES.SHORTCUTS,
    label: "Shortcuts",
    description: "Custom shortcuts to features",
    icon: Users,
    category: "quick_actions",
    defaultSize: { w: 4, h: 2, minW: 3, minH: 2 },
    requiresAuth: true,
    isPremium: false,
    refreshInterval: 0,
  },
};

export const CATEGORY_LABELS: Record<WidgetCategory, string> = {
  pos: "Point of Sale",
  service: "Service Guy AI",
  cleanbi: "CLEANBI",
  website: "Website Builder",
  calculators: "Calculators",
  analytics: "Analytics",
  activity: "Activity & Social",
  quick_actions: "Quick Actions",
};

export const CATEGORY_ICONS: Record<WidgetCategory, LucideIcon> = {
  pos: DollarSign,
  service: Wrench,
  cleanbi: MapPin,
  website: Globe,
  calculators: Calculator,
  analytics: BarChart3,
  activity: Activity,
  quick_actions: Sparkles,
};

export function getWidgetsByCategory(category: WidgetCategory): WidgetDefinition[] {
  return Object.values(WIDGET_CATALOG).filter(
    (widget) => widget.category === category
  );
}

export function getWidgetById(id: WidgetType): WidgetDefinition | undefined {
  return WIDGET_CATALOG[id];
}

export function getAllCategories(): WidgetCategory[] {
  return Object.keys(CATEGORY_LABELS) as WidgetCategory[];
}

export function getWidgetsByPremiumStatus(isPremium: boolean): WidgetDefinition[] {
  return Object.values(WIDGET_CATALOG).filter(
    (widget) => widget.isPremium === isPremium
  );
}
