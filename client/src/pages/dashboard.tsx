import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DashboardSkeleton } from "@/components/Skeletons";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  Store,
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
} from "lucide-react";

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
  { label: "POS Command Center", href: "/pos", icon: Monitor, description: "Manage orders, customers & machines", color: "bg-blue-500/10 text-blue-600" },
  { label: "Customer Portal", href: "/customer-portal", icon: Users, description: "Self-service for your customers", color: "bg-teal-500/10 text-teal-600" },
  { label: "CLEANBI Explorer", href: "/cleanbi-explorer", icon: BarChart3, description: "Full map intelligence system", color: "bg-purple-500/10 text-purple-600" },
  { label: "Score History", href: "/score-history", icon: TrendingUp, description: "View your CLEANBI analysis history", color: "bg-indigo-500/10 text-indigo-600" },
  { label: "Referral Program", href: "/referral-program", icon: Gift, description: "Earn rewards for referrals", color: "bg-gold-500/10 text-gold-600" },
  { label: "Service Guy AI", href: "/service-guy-ai", icon: Bot, description: "AI equipment troubleshooting", color: "bg-orange-500/10 text-orange-600" },
  { label: "Calculators", href: "/calculators", icon: Calculator, description: "50+ business calculators", color: "bg-green-500/10 text-green-600" },
  { label: "Equipment Market", href: "/equipment", icon: Wrench, description: "Shop equipment & parts", color: "bg-red-500/10 text-red-600" },
];

const TIER_INFO: Record<string, { icon: any; label: string; color: string }> = {
  free: { icon: Gift, label: "Free", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  accelerate: { icon: Zap, label: "Accelerate", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  scale: { icon: TrendingUp, label: "Scale", color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" },
  summit: { icon: Crown, label: "Summit", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
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
    return <DashboardSkeleton data-testid="dashboard-loading" />;
  }

  const onboardingChecklist = summary?.onboarding.checklist || {};
  const completedSteps = ONBOARDING_STEPS.filter(step => onboardingChecklist[step.key]).length;
  const onboardingProgress = (completedSteps / ONBOARDING_STEPS.length) * 100;
  const showOnboarding = !summary?.onboarding.completed && completedSteps < ONBOARDING_STEPS.length;

  const tierKey = (summary?.subscription.tier || "free").toLowerCase();
  const tierInfo = TIER_INFO[tierKey] || TIER_INFO.free;
  const TierIcon = tierInfo.icon;

  return (
    <AuthGuard 
      title="Sign In to Access Dashboard" 
      description="Sign in to access your dashboard."
    >
      <SEO 
        title="Dashboard | WashBizHub" 
        description="Manage your laundromat business from one central dashboard. Access POS, analytics, and tools."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold" data-testid="text-dashboard-title">
                Welcome back{summary?.user.firstName ? `, ${summary.user.firstName}` : ""}!
              </h1>
              <p className="text-muted-foreground mt-1">
                {summary?.user.companyName || "Your laundromat business"} Dashboard
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`${tierInfo.color} gap-1`} data-testid="badge-subscription-tier">
                <TierIcon className="w-3 h-3" />
                {tierInfo.label}
              </Badge>
              <Link href="/settings">
                <Button variant="outline" size="sm" data-testid="button-settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>

          {showOnboarding && (
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent" data-testid="card-onboarding">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Rocket className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Get Started with WashBizHub</CardTitle>
                      <CardDescription>Complete these steps to unlock your full potential</CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => skipOnboardingMutation.mutate()}
                    disabled={skipOnboardingMutation.isPending}
                    data-testid="button-skip-onboarding"
                  >
                    {skipOnboardingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Skip for now"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Progress value={onboardingProgress} className="flex-1" data-testid="progress-onboarding" />
                  <span className="text-sm font-medium text-muted-foreground">{completedSteps}/{ONBOARDING_STEPS.length}</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {ONBOARDING_STEPS.map((step) => {
                    const StepIcon = step.icon;
                    const isComplete = onboardingChecklist[step.key];
                    return (
                      <Link key={step.key} href={step.link}>
                        <div 
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                            isComplete 
                              ? "bg-primary/5 border-primary/20" 
                              : "hover:bg-muted/50 border-transparent hover:border-border"
                          }`}
                          data-testid={`onboarding-step-${step.key}`}
                        >
                          <div className={`shrink-0 ${isComplete ? "text-primary" : "text-muted-foreground"}`}>
                            {isComplete ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isComplete ? "line-through text-muted-foreground" : ""}`}>
                              {step.label}
                            </p>
                          </div>
                          <StepIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2" data-testid="card-quick-actions">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Access your most-used tools and features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {QUICK_ACTIONS.map((action) => {
                    const ActionIcon = action.icon;
                    return (
                      <Link key={action.href} href={action.href}>
                        <div 
                          className="flex items-center gap-4 p-4 rounded-xl border hover-elevate cursor-pointer transition-all"
                          data-testid={`action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <div className={`p-3 rounded-lg ${action.color}`}>
                            <ActionIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{action.label}</p>
                            <p className="text-sm text-muted-foreground truncate">{action.description}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card data-testid="card-subscription">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{tierInfo.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {summary?.subscription.status === "active" ? "Active" : 
                         summary?.subscription.status === "trialing" ? "Trial" : "Free Plan"}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${tierInfo.color}`}>
                      <TierIcon className="w-6 h-6" />
                    </div>
                  </div>
                  
                  {tierKey === "free" && (
                    <Link href="/pricing">
                      <Button className="w-full" data-testid="button-upgrade">
                        <Zap className="w-4 h-4 mr-2" />
                        Upgrade Now
                      </Button>
                    </Link>
                  )}
                  
                  {tierKey !== "free" && (
                    <Link href="/settings">
                      <Button variant="outline" className="w-full" data-testid="button-manage-subscription">
                        Manage Subscription
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="card-account">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Account
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    {summary?.user.profileImageUrl ? (
                      <img 
                        src={summary.user.profileImageUrl} 
                        alt="Profile" 
                        className="w-10 h-10 rounded-full"
                        data-testid="img-profile"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" data-testid="text-user-name">
                        {summary?.user.firstName} {summary?.user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground truncate" data-testid="text-user-email">
                        {summary?.user.email}
                      </p>
                    </div>
                  </div>
                  
                  {summary?.user.companyName && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                      <Store className="w-4 h-4" />
                      <span data-testid="text-company">{summary.user.companyName}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span data-testid="text-locations">{summary?.user.numberOfLocations || 1} Location(s)</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card data-testid="card-help">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Need help with your equipment?</h3>
                    <p className="text-sm text-muted-foreground">Ask Service Guy AI for instant troubleshooting</p>
                  </div>
                </div>
                <Link href="/service-guy-ai">
                  <Button data-testid="button-service-ai">
                    Ask Service Guy AI
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
