import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  MetricCard,
  KPIRibbon,
  PremiumCard,
  PremiumCardHeader,
  PremiumCardContent,
  PremiumCardFooter,
  StatusBadge,
  DashboardSkeleton,
} from "@/components/premium";
import type { KPIMetric } from "@/components/premium";
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
  CreditCard,
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
  DollarSign,
  Target,
  Clock,
  Bell,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  { label: "POS Command Center", href: "/pos", icon: Monitor, description: "Manage orders, customers & machines", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
  { label: "Customer Portal", href: "/customer-portal", icon: Users, description: "Self-service for your customers", color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-500/10" },
  { label: "CLEANBI Explorer", href: "/cleanbi-explorer", icon: BarChart3, description: "Full map intelligence system", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
  { label: "Score History", href: "/score-history", icon: TrendingUp, description: "View your CLEANBI analysis history", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-500/10" },
  { label: "Referral Program", href: "/referral-program", icon: Gift, description: "Earn rewards for referrals", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  { label: "Service Guy AI", href: "/service-guy-ai", icon: Bot, description: "AI equipment troubleshooting", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10" },
  { label: "Calculators", href: "/calculators", icon: Calculator, description: "50+ business calculators", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  { label: "Equipment Market", href: "/equipment", icon: Wrench, description: "Shop equipment & parts", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" },
];

const TIER_CONFIG: Record<string, { icon: any; label: string; variant: "success" | "info" | "warning" | "premium" | "neutral" }> = {
  free: { icon: Gift, label: "Free Plan", variant: "neutral" },
  starter: { icon: Zap, label: "Starter", variant: "info" },
  pro: { icon: TrendingUp, label: "Pro", variant: "success" },
  enterprise: { icon: Crown, label: "Enterprise", variant: "premium" },
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

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: summary, isLoading } = useQuery<DashboardSummary>({
    queryKey: ["/api/dashboard/summary"],
    enabled: !!user,
  });

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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <DashboardSkeleton
            kpiCount={4}
            showChart={false}
            showActivityList={true}
            showCardGrid={true}
            cardCount={8}
            testId="dashboard-loading"
          />
        </div>
      </div>
    );
  }

  const onboardingChecklist = summary?.onboarding.checklist || {};
  const completedSteps = ONBOARDING_STEPS.filter(step => onboardingChecklist[step.key]).length;
  const onboardingProgress = (completedSteps / ONBOARDING_STEPS.length) * 100;
  const showOnboarding = !summary?.onboarding.completed && completedSteps < ONBOARDING_STEPS.length;

  const tierKey = (summary?.subscription.tier || "free").toLowerCase();
  const tierConfig = TIER_CONFIG[tierKey] || TIER_CONFIG.free;
  const TierIcon = tierConfig.icon;

  const kpiMetrics: KPIMetric[] = [
    {
      id: "locations",
      label: "Locations",
      value: summary?.user.numberOfLocations || 1,
      icon: MapPin,
      trend: { value: 0, direction: "neutral" },
    },
    {
      id: "subscription",
      label: "Plan",
      value: tierConfig.label,
      icon: TierIcon,
    },
    {
      id: "onboarding",
      label: "Setup Progress",
      value: `${Math.round(onboardingProgress)}%`,
      icon: Target,
      trend: completedSteps > 0 ? { value: completedSteps * 20, direction: "up" } : undefined,
    },
    {
      id: "status",
      label: "Account Status",
      value: summary?.subscription.status === "active" ? "Active" : summary?.subscription.status === "trialing" ? "Trial" : "Free",
      icon: Activity,
    },
  ];

  return (
    <AuthGuard 
      title="Sign In to Access Dashboard" 
      description="Sign in to access your dashboard."
    >
      <SEO 
        title="Dashboard | WashBizHub" 
        description="Manage your laundromat business from one central dashboard. Access POS, analytics, and tools."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5" data-testid="dashboard-page">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8"
        >
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e3a5f] via-[#2a4a6f] to-[#1e3a5f] p-8 md:p-10"
            data-testid="dashboard-hero"
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background:
                  "radial-gradient(circle at 70% 30%, rgba(184, 134, 11, 0.4), transparent 50%), radial-gradient(circle at 20% 80%, rgba(212, 160, 48, 0.3), transparent 50%)",
              }}
            />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDAgTCAyMCAwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjxwYXRoIGQ9Ik0gMCAwIEwgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <Avatar className="h-16 w-16 border-2 border-white/20 ring-4 ring-white/10">
                  <AvatarImage src={summary?.user.profileImageUrl || undefined} alt="Profile" />
                  <AvatarFallback className="bg-white/10 text-white text-xl font-semibold">
                    {summary?.user.firstName?.[0]}{summary?.user.lastName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white" data-testid="text-dashboard-title">
                    Welcome back{summary?.user.firstName ? `, ${summary.user.firstName}` : ""}!
                  </h1>
                  <p className="text-white/70 mt-1 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {summary?.user.companyName || "Your Laundromat Business"}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge
                  variant={tierConfig.variant}
                  label={tierConfig.label}
                  icon={TierIcon}
                  size="lg"
                  testId="badge-subscription-tier"
                />
                <Link href="/settings">
                  <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20" data-testid="button-settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <KPIRibbon metrics={kpiMetrics} testId="dashboard-kpi-ribbon" />
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
                                  : "border-border hover:border-accent/30"
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
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <PremiumCard testId="card-quick-actions">
                <PremiumCardHeader
                  title="Quick Actions"
                  subtitle="Access your most-used tools and features"
                  icon={<Sparkles className="h-5 w-5" />}
                  action={
                    <Link href="/calculator-marketplace">
                      <Button variant="ghost" size="sm" className="gap-1" data-testid="button-browse-all">
                        Browse All <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  }
                  testId="quick-actions-header"
                />
                <PremiumCardContent testId="quick-actions-content">
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
                            <div 
                              className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover-elevate active-elevate-2 cursor-pointer transition-all"
                              data-testid={`action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <div className={cn("p-3 rounded-lg transition-transform group-hover:scale-110", action.bg)}>
                                <ActionIcon className={cn("w-5 h-5", action.color)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground">{action.label}</p>
                                <p className="text-sm text-muted-foreground truncate">{action.description}</p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </PremiumCardContent>
              </PremiumCard>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              <PremiumCard accentPosition="top" accentGradient testId="card-subscription">
                <PremiumCardHeader
                  title="Subscription"
                  icon={<CreditCard className="h-5 w-5" />}
                  testId="subscription-header"
                />
                <PremiumCardContent testId="subscription-content">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-foreground">{tierConfig.label}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {summary?.subscription.status === "active" ? "Active Subscription" : 
                           summary?.subscription.status === "trialing" ? "Trial Period" : "Free Plan"}
                        </p>
                      </div>
                      <div className={cn(
                        "p-4 rounded-xl",
                        tierKey === "free" ? "bg-muted" :
                        tierKey === "starter" ? "bg-blue-500/10" :
                        tierKey === "pro" ? "bg-emerald-500/10" : "bg-amber-500/10"
                      )}>
                        <TierIcon className={cn(
                          "w-8 h-8",
                          tierKey === "free" ? "text-muted-foreground" :
                          tierKey === "starter" ? "text-blue-600 dark:text-blue-400" :
                          tierKey === "pro" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                        )} />
                      </div>
                    </div>
                    
                    {tierKey === "free" ? (
                      <Link href="/pricing">
                        <Button className="w-full gap-2" data-testid="button-upgrade">
                          <Zap className="w-4 h-4" />
                          Upgrade Now
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/settings">
                        <Button variant="outline" className="w-full gap-2" data-testid="button-manage-subscription">
                          Manage Subscription
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </PremiumCardContent>
              </PremiumCard>

              <PremiumCard testId="card-account">
                <PremiumCardHeader
                  title="Account"
                  icon={<Building2 className="h-5 w-5" />}
                  testId="account-header"
                />
                <PremiumCardContent testId="account-content">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={summary?.user.profileImageUrl || undefined} alt="Profile" />
                        <AvatarFallback className="bg-accent/10 text-accent font-semibold">
                          {summary?.user.firstName?.[0]}{summary?.user.lastName?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate" data-testid="text-user-name">
                          {summary?.user.firstName} {summary?.user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground truncate" data-testid="text-user-email">
                          {summary?.user.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-3 border-t border-border">
                      {summary?.user.companyName && (
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <Building2 className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate" data-testid="text-company">{summary.user.companyName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span data-testid="text-locations">{summary?.user.numberOfLocations || 1} Location(s)</span>
                      </div>
                      {summary?.user.role && (
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <User className="w-4 h-4 flex-shrink-0" />
                          <span data-testid="text-role" className="capitalize">{summary.user.role}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </PremiumCardContent>
              </PremiumCard>
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <PremiumCard 
              className="bg-gradient-to-r from-accent/5 via-transparent to-accent/5 border-accent/20"
              testId="card-help"
            >
              <PremiumCardContent className="py-6" testId="help-content">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-xl bg-accent/10">
                      <Bot className="h-7 w-7 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">Need help with your equipment?</h3>
                      <p className="text-muted-foreground">Ask Service Guy AI for instant troubleshooting assistance</p>
                    </div>
                  </div>
                  <Link href="/service-guy-ai">
                    <Button size="lg" className="gap-2" data-testid="button-service-ai">
                      Ask Service Guy AI
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </PremiumCardContent>
            </PremiumCard>
          </motion.div>
        </motion.div>
      </div>
    </AuthGuard>
  );
}
