import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  DashboardShell,
  DashboardSection,
  DashboardGrid,
  KPICard,
  KPIGroup,
  ChartCard,
  DashboardNav,
} from "@/components/dashboard";
import {
  EmptyState,
  NoDataState,
} from "@/components/premium/EmptyState";
import {
  PremiumCard,
  PremiumCardHeader,
  PremiumCardContent,
  DashboardSkeleton,
} from "@/components/premium";
import { ResponsiveLine } from "@nivo/line";
import { useCleanbiScores } from "@/hooks/use-cleanbi";
import { useDesigns } from "@/hooks/use-designs";
import {
  Monitor,
  Users,
  BarChart3,
  Settings,
  Zap,
  Crown,
  TrendingUp,
  CheckCircle2,
  Circle,
  ArrowRight,
  Calculator,
  Bot,
  Wrench,
  ChevronRight,
  Rocket,
  User,
  Building2,
  ShoppingCart,
  MapPin,
  Loader2,
  Gift,
  Sparkles,
  Activity,
  Target,
  Clock,
  FileText,
  Palette,
  Store,
  DollarSign,
  Eye,
  Bookmark,
  History,
  Search,
  PlusCircle,
  LayoutDashboard,
  LineChart,
  Briefcase,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface DashboardSummary {
  user: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
    companyName: string | null;
    role: string | null;
    numberOfLocations: number;
  };
  subscription: {
    tier: string;
    status: string;
    endsAt: string | null;
    isPro: boolean;
    hasStripeCustomer: boolean;
  };
  onboarding: {
    completed: boolean;
    step: number;
    checklist: Record<string, boolean>;
  };
  recentActivity: any[];
}

const ONBOARDING_STEPS = [
  { key: "profileComplete", label: "Complete your profile", link: "/settings", icon: User },
  { key: "locationAdded", label: "Add your first location", link: "/pos", icon: MapPin },
  { key: "machinesAdded", label: "Set up your machines", link: "/pos", icon: Wrench },
  { key: "firstSaleComplete", label: "Process your first sale", link: "/pos", icon: ShoppingCart },
  { key: "teamInvited", label: "Invite team members", link: "/settings", icon: Users },
];

const QUICK_ACTIONS = [
  { label: "CLEANBI Explorer", href: "/cleanbi-explorer", icon: BarChart3, description: "Analyze any location instantly", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
  { label: "Design Studio", href: "/design-studio", icon: Palette, description: "Create laundromat layouts", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
  { label: "Marketplace", href: "/marketplace", icon: Store, description: "Browse listings for sale", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  { label: "Calculators", href: "/calculators", icon: Calculator, description: "50+ business calculators", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  { label: "Valuation Tool", href: "/valuation-tool", icon: DollarSign, description: "Estimate business value", color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-500/10" },
  { label: "Service Guy AI", href: "/service-guy-ai", icon: Bot, description: "AI equipment troubleshooting", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10" },
];

const DASHBOARD_NAV_ITEMS = [
  { id: "overview", label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics", href: "/analytics-dashboard", icon: LineChart },
  { id: "broker", label: "Broker", href: "/broker-dashboard", icon: Briefcase, roles: ["broker", "admin"] },
  { id: "buyer", label: "Buyer", href: "/buyer-dashboard", icon: ShoppingCart },
  { id: "admin", label: "Admin", href: "/admin", icon: Settings, roles: ["admin"] },
];

const TIER_CONFIG: Record<string, { icon: any; label: string; variant: "success" | "warning" | "gold" | "default" }> = {
  free: { icon: Gift, label: "Free Plan", variant: "default" },
  starter: { icon: Zap, label: "Starter", variant: "warning" },
  pro: { icon: TrendingUp, label: "Pro", variant: "success" },
  enterprise: { icon: Crown, label: "Enterprise", variant: "gold" },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

function getActivityIcon(type: string) {
  switch (type) {
    case "analysis": return BarChart3;
    case "design": return Palette;
    case "listing": return Store;
    case "calculator": return Calculator;
    case "login": return User;
    default: return Activity;
  }
}

function getActivityColor(type: string) {
  switch (type) {
    case "analysis": return "text-purple-600 bg-purple-500/10";
    case "design": return "text-blue-600 bg-blue-500/10";
    case "listing": return "text-emerald-600 bg-emerald-500/10";
    case "calculator": return "text-amber-600 bg-amber-500/10";
    case "login": return "text-gray-600 bg-gray-500/10";
    default: return "text-[#C8A661] bg-[#C8A661]/10";
  }
}

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: summary, isLoading } = useQuery<DashboardSummary>({
    queryKey: ["/api/dashboard/summary"],
    enabled: !!user,
  });

  const { data: cleanbiScores, isLoading: scoresLoading } = useCleanbiScores();
  const { data: designs, isLoading: designsLoading } = useDesigns();

  const skipOnboardingMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", "/api/onboarding/progress", { completed: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      toast({ title: "Onboarding skipped", description: "You can always come back to complete these steps later." });
    },
  });

  if (authLoading || isLoading) {
    return (
      <DashboardShell
        title="Dashboard"
        showDatePicker={false}
        showExportButtons={false}
      >
        <DashboardSkeleton
          kpiCount={4}
          showChart={true}
          showActivityList={true}
          showCardGrid={true}
          cardCount={6}
          testId="dashboard-loading"
        />
      </DashboardShell>
    );
  }

  const onboardingChecklist = summary?.onboarding.checklist || {};
  const completedSteps = ONBOARDING_STEPS.filter(step => onboardingChecklist[step.key]).length;
  const onboardingProgress = (completedSteps / ONBOARDING_STEPS.length) * 100;
  const showOnboarding = !summary?.onboarding.completed && completedSteps < ONBOARDING_STEPS.length;

  const tierKey = (summary?.subscription.tier || "free").toLowerCase();
  const tierConfig = TIER_CONFIG[tierKey] || TIER_CONFIG.free;
  const TierIcon = tierConfig.icon;

  const cleanbiCount = cleanbiScores?.length || 0;
  const designsCount = designs?.length || 0;
  const recentActivity = summary?.recentActivity || [];
  
  const usageChartData = cleanbiScores && cleanbiScores.length > 0 ? [{
    id: "CLEANBI Analyses",
    color: "#C8A661",
    data: cleanbiScores.slice(-12).map((score, index) => ({
      x: `Analysis ${index + 1}`,
      y: score.score || 0,
    })),
  }] : [];

  const savedItems = [
    ...(cleanbiScores?.slice(0, 3).map(s => ({
      type: "analysis" as const,
      title: s.address || "Analysis",
      subtitle: s.score ? `Score: ${s.score}` : "No score",
      date: s.createdAt,
      href: "/cleanbi-explorer",
    })) || []),
    ...(designs?.slice(0, 2).map(d => ({
      type: "design" as const,
      title: d.name || "Design",
      subtitle: `${d.squareFeet || 0} sq ft`,
      date: d.createdAt,
      href: "/design-studio",
    })) || []),
  ].slice(0, 5);

  return (
    <AuthGuard 
      title="Sign In to Access Dashboard" 
      description="Sign in to access your dashboard."
    >
      <SEO 
        title="Dashboard | WashBizHub" 
        description="Manage your laundromat business from one central dashboard. Access CLEANBI analytics, design studio, and business tools."
      />
      
      <DashboardShell
        title={`Welcome back${summary?.user.firstName ? `, ${summary.user.firstName}` : ""}!`}
        subtitle={summary?.user.companyName || "Your Laundromat Business"}
        showDatePicker={false}
        showExportButtons={false}
        headerActions={
          <div className="flex items-center gap-2">
            <Badge className={cn(
              "gap-1.5",
              tierKey === "pro" ? "bg-emerald-500 text-white" :
              tierKey === "enterprise" ? "bg-[#C8A661] text-[#0A1628]" :
              "bg-muted text-muted-foreground"
            )}>
              <TierIcon className="h-3 w-3" />
              {tierConfig.label}
            </Badge>
            <Link href="/settings">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" data-testid="button-settings">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        }
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
          data-testid="dashboard-page"
        >
          <motion.div variants={itemVariants}>
            <DashboardNav
              items={DASHBOARD_NAV_ITEMS}
              currentPath="/dashboard"
              userRole={summary?.user.role || "user"}
              variant="tabs"
              className="mb-2"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <KPIGroup>
              <KPICard
                value={cleanbiCount}
                label="CLEANBI Analyses"
                icon={BarChart3}
                variant="gold"
                trend={cleanbiCount > 0 ? { value: 12.5, direction: "up", label: "vs last month" } : undefined}
              />
              <KPICard
                value={designsCount}
                label="Saved Designs"
                icon={Palette}
                variant="default"
              />
              <KPICard
                value={0}
                label="Watched Listings"
                icon={Eye}
                variant="default"
                subtitle="Coming soon"
              />
              <KPICard
                value={tierConfig.label}
                label="Account Status"
                icon={TierIcon}
                variant={tierConfig.variant}
                formatValue={false}
              />
            </KPIGroup>
          </motion.div>

          {showOnboarding && (
            <motion.div variants={itemVariants}>
              <PremiumCard accentPosition="left" accentGradient testId="card-onboarding">
                <PremiumCardHeader
                  title="Get Started with WashBizHub"
                  subtitle="Complete these steps to unlock your full potential"
                  icon={<Rocket className="h-5 w-5" />}
                  action={
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => skipOnboardingMutation.mutate()}
                      disabled={skipOnboardingMutation.isPending}
                      data-testid="button-skip-onboarding"
                    >
                      {skipOnboardingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Skip for now"}
                    </Button>
                  }
                  testId="onboarding-header"
                />
                <PremiumCardContent testId="onboarding-content">
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <Progress value={onboardingProgress} className="flex-1 h-2" data-testid="progress-onboarding" />
                      <span className="text-sm font-semibold text-muted-foreground tabular-nums">{completedSteps}/{ONBOARDING_STEPS.length}</span>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      {ONBOARDING_STEPS.map((step) => {
                        const StepIcon = step.icon;
                        const isComplete = onboardingChecklist[step.key];
                        return (
                          <Link key={step.key} href={step.link}>
                            <div 
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                "hover-elevate active-elevate-2",
                                isComplete 
                                  ? "bg-emerald-500/5 border-emerald-500/20" 
                                  : "border-border hover:border-[#C8A661]/30"
                              )}
                              data-testid={`onboarding-step-${step.key}`}
                            >
                              <div className={cn("shrink-0", isComplete ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
                                {isComplete ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn("text-sm font-medium truncate", isComplete && "line-through text-muted-foreground")}>
                                  {step.label}
                                </p>
                              </div>
                              <StepIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </PremiumCardContent>
              </PremiumCard>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
              <DashboardSection
                title="Quick Actions"
                description="Jump into your most-used tools"
                action={
                  <Link href="/tools">
                    <Button variant="ghost" size="sm" className="gap-1" data-testid="button-view-all-tools">
                      View All <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                }
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  {QUICK_ACTIONS.map((action, index) => {
                    const ActionIcon = action.icon;
                    return (
                      <motion.div
                        key={action.href}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.25 }}
                      >
                        <Link href={action.href}>
                          <Card className="group hover-elevate active-elevate-2 cursor-pointer transition-all border" data-testid={`action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}>
                            <CardContent className="flex items-center gap-4 p-4">
                              <div className={cn("p-3 rounded-lg transition-transform group-hover:scale-110", action.bg)}>
                                <ActionIcon className={cn("w-5 h-5", action.color)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground">{action.label}</p>
                                <p className="text-sm text-muted-foreground truncate">{action.description}</p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </DashboardSection>

              <ChartCard
                title="CLEANBI Usage Analytics"
                subtitle="Your analysis activity over time"
                isLoading={scoresLoading}
                isEmpty={usageChartData.length === 0 || usageChartData[0].data.length === 0}
                emptyTitle="No analyses yet"
                emptyDescription="Run your first CLEANBI analysis to see usage trends."
                emptyAction={{
                  label: "Start Analysis",
                  onClick: () => window.location.href = "/cleanbi-explorer",
                }}
                minHeight="250px"
              >
                {usageChartData.length > 0 && usageChartData[0].data.length > 0 && (
                  <ResponsiveLine
                    data={usageChartData}
                    margin={{ top: 20, right: 20, bottom: 40, left: 50 }}
                    xScale={{ type: "point" }}
                    yScale={{ type: "linear", min: 0, max: 100 }}
                    curve="monotoneX"
                    colors={["#C8A661"]}
                    lineWidth={3}
                    pointSize={8}
                    pointColor="#0A1628"
                    pointBorderWidth={2}
                    pointBorderColor="#C8A661"
                    enableGridX={false}
                    gridYValues={5}
                    axisBottom={{
                      tickSize: 0,
                      tickPadding: 10,
                      tickRotation: 0,
                    }}
                    axisLeft={{
                      tickSize: 0,
                      tickPadding: 10,
                      tickValues: 5,
                      format: (v) => `${v}`,
                    }}
                    enableArea={true}
                    areaOpacity={0.15}
                    theme={{
                      axis: {
                        ticks: {
                          text: { fill: "#888" },
                        },
                      },
                      grid: {
                        line: { stroke: "#e5e7eb", strokeWidth: 1 },
                      },
                    }}
                  />
                )}
              </ChartCard>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              <Card className="border shadow-sm" data-testid="card-recent-activity">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <History className="h-4 w-4 text-[#C8A661]" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  {recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivity.slice(0, 5).map((activity, index) => {
                        const ActivityIcon = getActivityIcon(activity.type);
                        const colorClass = getActivityColor(activity.type);
                        return (
                          <div key={index} className="flex items-start gap-3" data-testid={`activity-item-${index}`}>
                            <div className={cn("p-1.5 rounded-lg mt-0.5", colorClass.split(" ")[1])}>
                              <ActivityIcon className={cn("w-3.5 h-3.5", colorClass.split(" ")[0])} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{activity.title || "Activity"}</p>
                              <p className="text-xs text-muted-foreground">
                                {activity.createdAt ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true }) : "Recently"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState
                      variant="no-data"
                      icon={Clock}
                      title="No recent activity"
                      description="Your recent actions will appear here."
                      className="py-6"
                      testId="empty-activity"
                    />
                  )}
                </CardContent>
              </Card>

              <Card className="border shadow-sm" data-testid="card-saved-items">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Bookmark className="h-4 w-4 text-[#C8A661]" />
                      Your Saved Items
                    </CardTitle>
                    <Link href="/score-history">
                      <Button variant="ghost" size="sm" className="h-7 text-xs" data-testid="button-view-all-saved">
                        View All
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  {savedItems.length > 0 ? (
                    <div className="space-y-2">
                      {savedItems.map((item, index) => {
                        const ItemIcon = item.type === "analysis" ? BarChart3 : Palette;
                        return (
                          <Link key={index} href={item.href}>
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" data-testid={`saved-item-${index}`}>
                              <div className={cn(
                                "p-1.5 rounded-lg",
                                item.type === "analysis" ? "bg-purple-500/10" : "bg-blue-500/10"
                              )}>
                                <ItemIcon className={cn(
                                  "w-3.5 h-3.5",
                                  item.type === "analysis" ? "text-purple-600" : "text-blue-600"
                                )} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                                <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState
                      variant="no-data"
                      icon={Bookmark}
                      title="No saved items yet"
                      description="Run analyses and create designs to save them here."
                      primaryAction={{
                        label: "Explore CLEANBI",
                        onClick: () => window.location.href = "/cleanbi-explorer",
                      }}
                      className="py-6"
                      testId="empty-saved-items"
                    />
                  )}
                </CardContent>
              </Card>

              <Card className="border shadow-sm bg-gradient-to-br from-[#0A1628] to-[#1a3a5c] text-white" data-testid="card-help-cta">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-[#C8A661]/20 flex-shrink-0">
                      <Bot className="h-6 w-6 text-[#C8A661]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white mb-1">Need Equipment Help?</h3>
                      <p className="text-sm text-gray-300 mb-3">Get instant AI troubleshooting assistance</p>
                      <Link href="/service-guy-ai">
                        <Button size="sm" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] gap-1" data-testid="button-service-ai">
                          Ask Service Guy AI
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </DashboardShell>
    </AuthGuard>
  );
}
