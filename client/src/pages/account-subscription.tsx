import { useMutation } from "@tanstack/react-query";
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
} from "lucide-react";

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

  const currentTierConfig = PLATFORM_TIERS[currentTier as PlatformTier] || PLATFORM_TIERS.free;
  const tierPrice = getTierPrice(currentTier);

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

            <Card data-testid="card-usage">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Usage This Period
                </CardTitle>
                <CardDescription>CLEANBI analyses and feature usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">CLEANBI Analyses</span>
                    <span className="text-sm text-muted-foreground" data-testid="text-cleanbi-usage">
                      {quotaLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : isCleanbiUnlimited ? (
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#C8A661]" />
                          Unlimited
                        </span>
                      ) : (
                        `${cleanbiUsed} / ${cleanbiLimit}`
                      )}
                    </span>
                  </div>
                  {!isCleanbiUnlimited && (
                    <>
                      <Progress value={cleanbiPercentUsed} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {cleanbiRemaining > 0
                          ? `${cleanbiRemaining} analyses remaining today`
                          : "Daily limit reached - resets tomorrow"}
                      </p>
                    </>
                  )}
                </div>

                {currentTierConfig.limits.apiCalls !== 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">API Calls</span>
                      <span className="text-sm text-muted-foreground" data-testid="text-api-usage">
                        {currentTierConfig.limits.apiCalls === "unlimited" ? (
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#C8A661]" />
                            Unlimited
                          </span>
                        ) : (
                          `0 / ${currentTierConfig.limits.apiCalls}`
                        )}
                      </span>
                    </div>
                    {currentTierConfig.limits.apiCalls !== "unlimited" && (
                      <Progress value={0} className="h-2" />
                    )}
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Plan Limits</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-muted-foreground">Saved Reports</p>
                      <p className="font-medium" data-testid="text-saved-reports-limit">
                        {currentTierConfig.limits.savedReports === "unlimited"
                          ? "Unlimited"
                          : currentTierConfig.limits.savedReports}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-muted-foreground">Team Members</p>
                      <p className="font-medium" data-testid="text-team-members-limit">
                        {currentTierConfig.limits.teamMembers === "unlimited"
                          ? "Unlimited"
                          : currentTierConfig.limits.teamMembers}
                      </p>
                    </div>
                  </div>
                </div>
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
