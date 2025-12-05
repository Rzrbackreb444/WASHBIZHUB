import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MetricCard,
  KPIRibbon,
  PremiumCard,
  PremiumCardHeader,
  PremiumCardContent,
  PremiumCardFooter,
  StatusBadge,
  StatusDot,
  ProgressRing,
  DashboardSkeleton,
} from "@/components/premium";
import type { KPIMetric } from "@/components/premium";
import { 
  Calculator, 
  LayoutDashboard, 
  FileText, 
  ClipboardList, 
  ShoppingCart,
  Users,
  TrendingUp,
  Sparkles,
  DollarSign,
  BarChart3,
  Building2,
  Zap,
  Bot,
  Globe,
  CreditCard,
  Truck,
  Wrench,
  BookOpen,
  ArrowRight,
  Plus,
  Settings,
  Bell,
  MapPin,
  Activity,
  Target,
  Package,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Clock,
  TrendingDown,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  {
    id: 'wdf-calc',
    title: 'WDF Calculator',
    description: 'Calculate wash-dry-fold pricing',
    icon: Sparkles,
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-500/10',
    href: '/calculators/wdf',
  },
  {
    id: 'pud-calc',
    title: 'PUD Calculator',
    description: 'Pickup & delivery routing',
    icon: Truck,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    href: '/calculators/pud',
  },
  {
    id: 'valuation',
    title: 'Valuation Tool',
    description: 'Value your business',
    icon: Building2,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-500/10',
    href: '/calculators/valuation',
  },
  {
    id: 'cleanbi',
    title: 'CLEANBI™ Score',
    description: 'Score any location',
    icon: Zap,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10',
    href: '/cleanbi',
  },
  {
    id: 'service-ai',
    title: 'Service Guy AI',
    description: 'Equipment diagnostics',
    icon: Wrench,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-500/10',
    href: '/service-guy-ai',
  },
  {
    id: 'competition',
    title: 'Competition Intel',
    description: 'Analyze competitors',
    icon: Target,
    color: 'text-pink-600 dark:text-pink-400',
    bg: 'bg-pink-500/10',
    href: '/competition-intelligence',
  },
];

const DASHBOARD_MODULES = [
  {
    id: 'calculators',
    title: 'Calculators',
    description: 'Business calculators & financial tools',
    icon: Calculator,
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-500/10',
    borderColor: '#00A699',
    href: '/calculator-marketplace',
    count: 8,
  },
  {
    id: 'dashboards',
    title: 'Dashboards',
    description: 'Analytics & reporting',
    icon: LayoutDashboard,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    borderColor: '#F59E0B',
    href: '/calculator-marketplace?category=dashboards',
    count: 4,
  },
  {
    id: 'templates',
    title: 'Templates',
    description: 'Business document templates',
    icon: FileText,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-500/10',
    borderColor: '#8B5CF6',
    href: '/templates',
    count: 12,
  },
  {
    id: 'forms',
    title: 'Forms',
    description: 'Customer & operations forms',
    icon: ClipboardList,
    color: 'text-pink-600 dark:text-pink-400',
    bg: 'bg-pink-500/10',
    borderColor: '#EC4899',
    href: '/calculator-marketplace?category=forms',
    count: 6,
  },
  {
    id: 'pos',
    title: 'POS System',
    description: 'Point-of-sale & payments',
    icon: CreditCard,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    borderColor: '#10B981',
    href: '/pos',
    count: 1,
  },
  {
    id: 'website',
    title: 'Website',
    description: 'Build & manage your site',
    icon: Globe,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-500/10',
    borderColor: '#EF4444',
    href: '/website-builder',
    count: 3,
  },
  {
    id: 'ai-agents',
    title: 'AI Agents',
    description: 'Intelligent assistants',
    icon: Bot,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10',
    borderColor: '#3B82F6',
    href: '/calculator-marketplace?category=agents',
    count: 2,
  },
  {
    id: 'learning',
    title: 'Learning',
    description: 'Courses & education',
    icon: BookOpen,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-500/10',
    borderColor: '#6366F1',
    href: '/courses',
    count: 15,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

function getActivityVariant(type: string): "success" | "warning" | "error" | "info" | "neutral" {
  switch (type) {
    case 'order': return 'success';
    case 'alert': return 'warning';
    case 'customer': return 'info';
    case 'payment': return 'success';
    default: return 'neutral';
  }
}

export default function OwnerDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/owner/dashboard'],
    enabled: !!user,
  });

  const businessStats = {
    monthlyRevenue: 45280,
    revenueChange: 12.5,
    activeCustomers: 1247,
    customerChange: 8.3,
    wdfOrders: 342,
    orderChange: 15.2,
    cleanbiScore: 87,
  };

  const recentActivity = [
    { id: 1, type: 'order', message: 'New WDF order from John D.', time: '5 min ago', icon: ShoppingCart },
    { id: 2, type: 'alert', message: 'Washer #3 needs maintenance check', time: '1 hour ago', icon: AlertCircle },
    { id: 3, type: 'customer', message: 'New customer signup: Sarah M.', time: '2 hours ago', icon: Users },
    { id: 4, type: 'payment', message: 'Payment received: $127.50', time: '3 hours ago', icon: DollarSign },
    { id: 5, type: 'order', message: 'WDF pickup scheduled for 3:00 PM', time: '4 hours ago', icon: Truck },
  ];

  const kpiMetrics: KPIMetric[] = [
    {
      id: "revenue",
      label: "Monthly Revenue",
      value: `$${businessStats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: { value: businessStats.revenueChange, direction: "up" },
    },
    {
      id: "customers",
      label: "Active Customers",
      value: businessStats.activeCustomers.toLocaleString(),
      icon: Users,
      trend: { value: businessStats.customerChange, direction: "up" },
    },
    {
      id: "orders",
      label: "WDF Orders",
      value: businessStats.wdfOrders.toString(),
      icon: Package,
      trend: { value: businessStats.orderChange, direction: "up" },
    },
    {
      id: "score",
      label: "CLEANBI™ Score",
      value: `${businessStats.cleanbiScore}/100`,
      icon: Zap,
    },
  ];

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <DashboardSkeleton
            kpiCount={4}
            showChart={false}
            showActivityList={true}
            showCardGrid={true}
            cardCount={8}
            testId="owner-dashboard-loading"
          />
        </div>
      </div>
    );
  }

  return (
    <AuthGuard 
      title="Sign In to Access Owner Dashboard" 
      description="Sign in to access your dashboard."
    >
      <Helmet>
        <title>Owner Dashboard | WashBizHub</title>
        <meta name="description" content="Your complete business command center. Manage calculators, dashboards, POS, website, AI agents, and more from one place." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20" data-testid="owner-dashboard-page">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto p-4 md:p-8 space-y-8"
        >
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e3a5f] via-[#2a4a6f] to-[#1e3a5f] p-8 md:p-10"
            data-testid="owner-dashboard-hero"
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background:
                  "radial-gradient(circle at 80% 20%, rgba(184, 134, 11, 0.5), transparent 45%), radial-gradient(circle at 10% 90%, rgba(212, 160, 48, 0.3), transparent 40%)",
              }}
            />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDAgTCAyMCAwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjxwYXRoIGQ9Ik0gMCAwIEwgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <Avatar className="h-16 w-16 border-2 border-white/20 ring-4 ring-white/10">
                  <AvatarImage src={user?.profileImageUrl || undefined} alt="Profile" />
                  <AvatarFallback className="bg-white/10 text-white text-xl font-semibold">
                    {user?.firstName?.[0]}{user?.lastName?.[0] || "O"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white" data-testid="text-owner-title">
                    Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!
                  </h1>
                  <p className="text-white/70 mt-1 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Here's what's happening with your business today
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-white hover:bg-white/20" data-testid="button-notifications">
                  <Bell className="h-5 w-5" />
                </Button>
                <Link href="/settings">
                  <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-white hover:bg-white/20" data-testid="button-settings">
                    <Settings className="h-5 w-5" />
                  </Button>
                </Link>
                <Button className="gap-2" onClick={() => setLocation('/calculator-builder')} data-testid="button-create-tool">
                  <Plus className="h-4 w-4" />
                  Create Tool
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <KPIRibbon metrics={kpiMetrics} testId="owner-kpi-ribbon" />
          </motion.div>

          <motion.div variants={itemVariants}>
            <PremiumCard testId="card-quick-actions">
              <PremiumCardHeader
                title="Quick Actions"
                subtitle="Jump straight into your most-used tools"
                icon={<Sparkles className="h-5 w-5" />}
                testId="quick-actions-header"
              />
              <PremiumCardContent testId="quick-actions-content">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {QUICK_ACTIONS.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <motion.div
                        key={action.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.04, duration: 0.2 }}
                      >
                        <Button
                          variant="outline"
                          className="h-auto w-full p-4 flex flex-col items-center gap-3 hover-elevate active-elevate-2 transition-all group"
                          onClick={() => setLocation(action.href)}
                          data-testid={`button-quick-${action.id}`}
                        >
                          <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110", action.bg)}>
                            <Icon className={cn("h-5 w-5", action.color)} />
                          </div>
                          <div className="text-center">
                            <span className="font-semibold text-sm block">{action.title}</span>
                            <span className="text-xs text-muted-foreground hidden sm:block">{action.description}</span>
                          </div>
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </PremiumCardContent>
            </PremiumCard>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                  <LayoutDashboard className="h-5 w-5 text-accent" />
                  Your Business Tools
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1"
                  onClick={() => setLocation('/calculator-marketplace')}
                  data-testid="button-browse-tools"
                >
                  Browse All <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid gap-4">
                {DASHBOARD_MODULES.map((module, index) => {
                  const Icon = module.icon;
                  return (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.25 }}
                    >
                      <PremiumCard
                        interactive
                        accentPosition="left"
                        className="border-l-4"
                        style={{ borderLeftColor: module.borderColor }}
                        onClick={() => setLocation(module.href)}
                        testId={`card-module-${module.id}`}
                      >
                        <PremiumCardContent className="py-4 px-5" noPadding>
                          <div className="flex items-center gap-4">
                            <div className={cn("p-3 rounded-xl transition-transform", module.bg)}>
                              <Icon className={cn("h-5 w-5", module.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground">{module.title}</h3>
                              <p className="text-sm text-muted-foreground truncate">{module.description}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <StatusBadge
                                variant="neutral"
                                label={`${module.count} tools`}
                                size="sm"
                                testId={`badge-module-${module.id}`}
                              />
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>
                        </PremiumCardContent>
                      </PremiumCard>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                  <Activity className="h-5 w-5 text-accent" />
                  Recent Activity
                </h2>
                <Button variant="ghost" size="sm" data-testid="button-view-all-activity">
                  View All
                </Button>
              </div>
              
              <PremiumCard testId="card-activity">
                <PremiumCardContent noPadding testId="activity-content">
                  <div className="divide-y divide-border">
                    {recentActivity.map((activity, index) => {
                      const Icon = activity.icon;
                      const variant = getActivityVariant(activity.type);
                      return (
                        <motion.div 
                          key={activity.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.08, duration: 0.2 }}
                          className="p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors cursor-pointer"
                          data-testid={`activity-item-${activity.id}`}
                        >
                          <div className={cn(
                            "p-2 rounded-lg flex-shrink-0",
                            variant === 'success' ? 'bg-emerald-500/10' :
                            variant === 'warning' ? 'bg-amber-500/10' :
                            variant === 'info' ? 'bg-blue-500/10' :
                            'bg-muted'
                          )}>
                            <Icon className={cn(
                              "h-4 w-4",
                              variant === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
                              variant === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                              variant === 'info' ? 'text-blue-600 dark:text-blue-400' :
                              'text-muted-foreground'
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground">{activity.message}</p>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {activity.time}
                            </p>
                          </div>
                          <StatusDot variant={variant} pulse={index === 0} size="sm" />
                        </motion.div>
                      );
                    })}
                  </div>
                </PremiumCardContent>
              </PremiumCard>

              <PremiumCard accentPosition="top" accentGradient testId="card-health-score">
                <PremiumCardHeader
                  title="Business Health"
                  icon={<Target className="h-5 w-5" />}
                  testId="health-header"
                />
                <PremiumCardContent testId="health-content">
                  <div className="space-y-6">
                    <div className="flex flex-col items-center">
                      <ProgressRing
                        value={87}
                        size={140}
                        strokeWidth={12}
                        showLabel
                        label="Health Score"
                        color="accent"
                        testId="health-progress-ring"
                      />
                      <StatusBadge
                        variant="success"
                        label="Excellent Health"
                        icon={CheckCircle2}
                        className="mt-4"
                        testId="badge-health-status"
                      />
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-border">
                      <div data-testid="metric-revenue-growth">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Revenue Growth</span>
                          <span className="font-semibold text-foreground">92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                      <div data-testid="metric-customer-retention">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Customer Retention</span>
                          <span className="font-semibold text-foreground">85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div data-testid="metric-equipment-status">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Equipment Status</span>
                          <span className="font-semibold text-foreground">78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                    </div>
                  </div>
                </PremiumCardContent>
              </PremiumCard>
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <PremiumCard 
              className="bg-gradient-to-r from-accent/5 via-transparent to-accent/5 border-accent/20"
              testId="card-builder-cta"
            >
              <PremiumCardContent className="py-6 md:py-8" testId="builder-cta-content">
                <div className="flex flex-col md:flex-row items-center justify-between gap-5">
                  <div className="flex items-center gap-5">
                    <div className="p-4 rounded-xl bg-accent/10">
                      <Sparkles className="h-8 w-8 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-foreground">Build Your Custom Tools</h3>
                      <p className="text-muted-foreground mt-1">
                        Create calculators, dashboards, and more with our no-code builder
                      </p>
                    </div>
                  </div>
                  <Button size="lg" className="gap-2" onClick={() => setLocation('/calculator-builder')} data-testid="button-open-builder">
                    Open Builder <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </PremiumCardContent>
            </PremiumCard>
          </motion.div>
        </motion.div>
      </div>
    </AuthGuard>
  );
}
