import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUsageQuota } from "@/hooks/useUsageQuota";
import { useSubscription, getTierDisplayName, getTierPrice, getTierColor } from "@/hooks/useSubscription";
import { apiRequest } from "@/lib/queryClient";
import { PLATFORM_TIERS, type PlatformTier } from "@/lib/tier-config";
import { Link } from "wouter";
import { format, formatDistanceToNow } from "date-fns";
import {
  CreditCard,
  Crown,
  Zap,
  CheckCircle2,
  ExternalLink,
  Loader2,
  BarChart3,
  Calendar,
  ArrowRight,
  Gift,
  Building2,
  Sparkles,
  Clock,
  AlertCircle,
  ChevronLeft,
  MapPin,
  History,
  Lock,
  XCircle,
  TrendingUp,
  Activity,
} from "lucide-react";

interface UserActivityData {
  recentAnalyses: Array<{
    id: string;
    address: string;
    reportType: string;
    date: string;
  }>;
  thisMonthCount: number;
  quotaResetDate: string;
}

export default function AccountSubscription() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { tier: currentTier, tierLevel, isLoading: subscriptionLoading } = useSubscription();
  const {
    used: cleanbiUsed,
    limit: cleanbiLimit,
    remaining: cleanbiRemaining,
    percentUsed: cleanbiPercentUsed,
    isUnlimited: isCleanbiUnlimited,
    tierName,
    isLoading: quotaLoading,
  } = useUsageQuota();

  const { data: activityData, isLoading: activityLoading } = useQuery<UserActivityData>({
    queryKey: ["/api/user/activity"],
    enabled: !!user,
    staleTime: 60000,
  });

  const currentTierConfig = PLATFORM_TIERS[currentTier as PlatformTier] || PLATFORM_TIERS.free;
  const tierPrice = getTierPrice(currentTier);
  const highestTier = currentTier === 'enterprise';

  const createSubscriptionMutation = useMutation({
    mutationFn: async (tierId: string) => {
      const res = await apiRequest("POST", "/api/create-subscription", { tier: tierId });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      } else if (data.success) {
        toast({
          title: "Subscription updated!",
          description: "Your plan has been changed successfully.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process subscription",
        variant: "destructive",
      });
    },
  });

  const customerPortalMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/stripe/customer-portal");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to open billing portal",
        variant: "destructive",
      });
    },
  });

  if (authLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" data-testid="loader-auth" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to manage your subscription.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/login">
              <Button data-testid="button-login">Log In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isTrialActive = user.stripeSubscriptionId && user.subscriptionTier !== "free" && !user.stripeCustomerId;
  const hasActiveSubscription = !!user.stripeSubscriptionId;

  const allTierFeatures = [
    { key: 'cleanbiUnlimited', text: 'Unlimited CLEANBI Analyses', tiers: ['starter', 'pro', 'enterprise'] },
    { key: 'categoryBreakdowns', text: 'Full Category Breakdowns', tiers: ['starter', 'pro', 'enterprise'] },
    { key: 'aiRecommendations', text: 'AI-Powered Recommendations', tiers: ['starter', 'pro', 'enterprise'] },
    { key: '3dFlyover', text: '3D Aerial View Flyovers', tiers: ['starter', 'pro', 'enterprise'] },
    { key: 'walkScore', text: 'Walk Score & Transit Score', tiers: ['starter', 'pro', 'enterprise'] },
    { key: 'solarAnalysis', text: 'Solar Potential Analysis', tiers: ['starter', 'pro', 'enterprise'] },
    { key: 'pdfExport', text: 'Export PDF Reports', tiers: ['starter', 'pro', 'enterprise'] },
    { key: 'roiCalculators', text: 'ROI & Valuation Calculators', tiers: ['pro', 'enterprise'] },
    { key: 'monteCarlo', text: 'Monte Carlo Simulations', tiers: ['pro', 'enterprise'] },
    { key: 'bulkAnalysis', text: 'Bulk Location Analysis', tiers: ['pro', 'enterprise'] },
    { key: 'apiAccess', text: 'API Access', tiers: ['pro', 'enterprise'] },
    { key: 'ownershipData', text: 'Ownership & Lien Data', tiers: ['enterprise'] },
    { key: 'whiteLabel', text: 'White-Label Reports', tiers: ['enterprise'] },
    { key: 'teamCollab', text: 'Team Collaboration', tiers: ['enterprise'] },
  ];

  const isFeatureIncluded = (tiers: string[]) => tiers.includes(currentTier);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="gap-1" data-testid="button-back-settings">
              <ChevronLeft className="w-4 h-4" />
              Back to Settings
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">Subscription Management</h1>
            <p className="text-muted-foreground">Manage your plan, billing, and usage</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card data-testid="card-current-plan">
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${currentTierConfig.iconBg} flex items-center justify-center`}>
                      <currentTierConfig.icon className={`w-6 h-6 ${currentTierConfig.iconColor}`} />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Current Plan
                        {isTrialActive && (
                          <Badge variant="secondary" className="gap-1" data-testid="badge-trial">
                            <Clock className="w-3 h-3" />
                            Trial
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {hasActiveSubscription ? "Active subscription" : "Free plan - upgrade to unlock premium features"}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getTierColor(currentTier)} data-testid="badge-tier">
                    {currentTierConfig.name}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-3xl font-bold" data-testid="text-price">
                      ${tierPrice}
                      <span className="text-base font-normal text-muted-foreground">/month</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{currentTierConfig.tagline}</p>
                  </div>

                  {user.stripeSubscriptionId && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span data-testid="text-billing-date">
                        {user.cleanbiQuotaResetDate
                          ? `Next billing: ${new Date(user.cleanbiQuotaResetDate).toLocaleDateString()}`
                          : "Active subscription"}
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-3">Included Features</h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {currentTierConfig.features.slice(0, 8).map((feature, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 text-sm ${!feature.included ? "text-muted-foreground line-through" : ""}`}
                        data-testid={`text-feature-${i}`}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 ${feature.included ? (feature.highlight ? "text-[#C8A661]" : "text-primary") : "text-muted-foreground/50"}`}
                        />
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-comparison">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Feature Comparison
                </CardTitle>
                <CardDescription>See what's included in your plan vs. upgrades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allTierFeatures.map((feature) => {
                    const included = isFeatureIncluded(feature.tiers);
                    const upgradeTier = !included ? feature.tiers[0] : null;
                    
                    return (
                      <div
                        key={feature.key}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          included ? 'bg-primary/5' : 'bg-muted/30'
                        }`}
                        data-testid={`feature-row-${feature.key}`}
                      >
                        <div className="flex items-center gap-3">
                          {included ? (
                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                          ) : (
                            <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
                          )}
                          <span className={included ? '' : 'text-muted-foreground'}>{feature.text}</span>
                        </div>
                        {!included && upgradeTier && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => createSubscriptionMutation.mutate(upgradeTier)}
                            disabled={createSubscriptionMutation.isPending}
                            className="shrink-0"
                            data-testid={`button-unlock-${feature.key}`}
                          >
                            Unlock with {PLATFORM_TIERS[upgradeTier as PlatformTier]?.name}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {!highestTier && (
                  <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#C8A661]/10 to-primary/10 border border-[#C8A661]/20">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#C8A661]" />
                          Unlock All Features
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Upgrade to get the most out of CLEANBI
                        </p>
                      </div>
                      <Button
                        onClick={() => createSubscriptionMutation.mutate(tierLevel < 1 ? 'starter' : tierLevel < 2 ? 'pro' : 'enterprise')}
                        disabled={createSubscriptionMutation.isPending}
                        className="bg-[#C8A661] hover:bg-[#C8A661]/90 text-white"
                        data-testid="button-upgrade-main"
                      >
                        {createSubscriptionMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Crown className="w-4 h-4 mr-2" />
                        )}
                        Upgrade Now
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-plans">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C8A661]" />
                  Available Plans
                </CardTitle>
                <CardDescription>Choose the plan that fits your needs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {Object.values(PLATFORM_TIERS).map((tier) => {
                    const isCurrent = tier.id === currentTier;
                    const tierLevelNum = Object.keys(PLATFORM_TIERS).indexOf(tier.id);
                    const canUpgrade = tierLevelNum > tierLevel;
                    const canDowngrade = tierLevelNum < tierLevel;

                    return (
                      <div
                        key={tier.id}
                        className={`relative p-4 rounded-xl border-2 transition-all ${
                          isCurrent
                            ? "border-primary bg-primary/5"
                            : tier.popular
                              ? "border-[#C8A661]/50 bg-[#C8A661]/5"
                              : "border-border hover:border-muted-foreground/30"
                        }`}
                        data-testid={`card-plan-${tier.id}`}
                      >
                        {tier.badge && !isCurrent && (
                          <Badge className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs ${tier.badgeColor}`}>
                            {tier.badge}
                          </Badge>
                        )}

                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-10 h-10 rounded-lg ${tier.iconBg} flex items-center justify-center`}>
                            <tier.icon className={`w-5 h-5 ${tier.iconColor}`} />
                          </div>
                          {isCurrent && (
                            <Badge variant="secondary" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>

                        <h3 className="font-semibold mb-1">{tier.name}</h3>
                        <p className="text-2xl font-bold mb-1">
                          ${tier.price}
                          <span className="text-sm font-normal text-muted-foreground">/mo</span>
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">{tier.tagline}</p>

                        <div className="space-y-1.5 mb-4">
                          {tier.features.slice(0, 4).map((f, i) => (
                            <div
                              key={i}
                              className={`flex items-center gap-1.5 text-xs ${!f.included ? "text-muted-foreground/60" : ""}`}
                            >
                              <CheckCircle2
                                className={`w-3 h-3 shrink-0 ${f.included ? "text-primary" : "text-muted-foreground/40"}`}
                              />
                              <span className="truncate">{f.text}</span>
                            </div>
                          ))}
                        </div>

                        <Button
                          className="w-full"
                          size="sm"
                          variant={isCurrent ? "secondary" : canUpgrade ? "default" : "outline"}
                          disabled={isCurrent || createSubscriptionMutation.isPending}
                          onClick={() => createSubscriptionMutation.mutate(tier.id)}
                          data-testid={`button-${isCurrent ? "current" : canUpgrade ? "upgrade" : "downgrade"}-${tier.id}`}
                        >
                          {createSubscriptionMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isCurrent ? (
                            "Current Plan"
                          ) : canUpgrade ? (
                            <>
                              Upgrade
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </>
                          ) : (
                            "Downgrade"
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card data-testid="card-usage-stats">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Usage Statistics
                </CardTitle>
                <CardDescription>Your CLEANBI usage this billing period</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
                  <p className="text-sm text-muted-foreground mb-1">CLEANBI Analyses Used</p>
                  {quotaLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  ) : isCleanbiUnlimited ? (
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#C8A661]" />
                      <span className="text-3xl font-bold text-[#C8A661]">Unlimited</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-3xl font-bold" data-testid="text-usage-count">
                        {cleanbiUsed} <span className="text-muted-foreground text-lg font-normal">/ {cleanbiLimit}</span>
                      </p>
                      <Progress value={cleanbiPercentUsed} className="h-3 mt-3" />
                      <p className="text-xs text-muted-foreground mt-2">
                        {cleanbiRemaining > 0
                          ? `${cleanbiRemaining} analyses remaining today`
                          : "Daily limit reached"}
                      </p>
                    </>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      This Month
                    </span>
                    <span className="font-medium" data-testid="text-monthly-count">
                      {activityLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : activityData?.thisMonthCount || 0} analyses
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Quota Resets
                    </span>
                    <span className="font-medium" data-testid="text-reset-date">
                      {activityData?.quotaResetDate 
                        ? format(new Date(activityData.quotaResetDate), 'MMM d, yyyy')
                        : 'End of billing period'
                      }
                    </span>
                  </div>
                </div>

                {!isCleanbiUnlimited && (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <p className="text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      Upgrade to get unlimited daily analyses
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-recent-activity">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest CLEANBI analyses</CardDescription>
              </CardHeader>
              <CardContent>
                {activityLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : activityData?.recentAnalyses && activityData.recentAnalyses.length > 0 ? (
                  <div className="space-y-3">
                    {activityData.recentAnalyses.slice(0, 5).map((analysis, i) => (
                      <div
                        key={analysis.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        data-testid={`activity-item-${i}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" title={analysis.address}>
                            {analysis.address}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(analysis.date), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {analysis.reportType}
                        </Badge>
                      </div>
                    ))}
                    <Link href="/score-history">
                      <Button variant="ghost" className="w-full mt-2" size="sm" data-testid="button-view-history">
                        View Full History
                        <ArrowRight className="w-3 h-3 ml-2" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No analyses yet</p>
                    <Link href="/cleanbi">
                      <Button variant="outline" size="sm" className="mt-3" data-testid="button-start-analyzing">
                        Start Analyzing Locations
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-billing">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Billing
                </CardTitle>
                <CardDescription>Manage payment methods and invoices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => customerPortalMutation.mutate()}
                  disabled={customerPortalMutation.isPending || !user.stripeCustomerId}
                  data-testid="button-manage-billing"
                >
                  {customerPortalMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  Manage Billing
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Button>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Update payment method
                  </p>
                  <p className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    View invoices & receipts
                  </p>
                  <p className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Cancel subscription
                  </p>
                </div>

                {!user.stripeCustomerId && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Billing portal is available after your first subscription purchase.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {currentTier === "free" && (
              <Card className="border-[#C8A661]/30 bg-gradient-to-br from-[#C8A661]/5 to-transparent" data-testid="card-upgrade-cta">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#C8A661]/20 flex items-center justify-center">
                      <Crown className="w-5 h-5 text-[#C8A661]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Unlock Full Power</h3>
                      <p className="text-sm text-muted-foreground">Start your 7-day free trial</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get unlimited CLEANBI analyses, AI recommendations, and advanced features.
                  </p>
                  <Button
                    className="w-full bg-[#C8A661] hover:bg-[#C8A661]/90 text-white"
                    onClick={() => createSubscriptionMutation.mutate("starter")}
                    disabled={createSubscriptionMutation.isPending}
                    data-testid="button-start-trial"
                  >
                    {createSubscriptionMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Zap className="w-4 h-4 mr-2" />
                    )}
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
