import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  CreditCard,
  Crown,
  TrendingUp,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Loader2,
  Shield,
  Bell,
  User,
  Building2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [cancelReason, setCancelReason] = useState("");

  const tiers = [
    {
      name: "Accelerate",
      price: 249,
      priceId: "price_accelerate_monthly",
      icon: Zap,
      color: "from-blue-500/20 to-cyan-500/20",
      features: ["1 Location", "500 transactions/mo", "2 users", "5GB storage"],
    },
    {
      name: "Scale",
      price: 499,
      priceId: "price_scale_monthly",
      icon: TrendingUp,
      color: "from-accent/30 to-yellow-500/30",
      popular: true,
      features: ["5 Locations", "Unlimited transactions", "10 users", "50GB storage"],
    },
    {
      name: "Summit",
      price: 899,
      priceId: "price_summit_monthly",
      icon: Crown,
      color: "from-purple-500/20 to-pink-500/20",
      features: ["Unlimited locations", "Unlimited everything", "White-label", "Dedicated support"],
    },
  ];

  const currentTier = user?.subscriptionTier || "basic";
  const currentTierData = tiers.find(t => t.name.toLowerCase() === currentTier.toLowerCase());

  const upgradeMutation = useMutation({
    mutationFn: async (priceId: string) => {
      const res = await apiRequest("POST", "/api/subscriptions/upgrade", { priceId });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        toast({
          title: "Subscription updated!",
          description: "Your plan has been upgraded successfully.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upgrade subscription",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (reason: string) => {
      await apiRequest("POST", "/api/subscriptions/cancel", { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Subscription cancelled",
        description: "Your subscription will remain active until the end of the billing period.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to manage your settings.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account, subscription, and preferences</p>
        </div>

        <Tabs defaultValue="subscription" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="subscription" data-testid="tab-subscription">
              <CreditCard className="w-4 h-4 mr-2" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="business" data-testid="tab-business">
              <Building2 className="w-4 h-4 mr-2" />
              Business
            </TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            {/* Current Plan */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Current Plan
                      {currentTierData && <currentTierData.icon className="w-5 h-5 text-primary" />}
                    </CardTitle>
                    <CardDescription>
                      {user.stripeSubscriptionId ? "Active subscription" : "No active subscription"}
                    </CardDescription>
                  </div>
                  {user.stripeCustomerId && (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Stripe Connected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{currentTierData?.name || "Free"}</h3>
                    <p className="text-muted-foreground">
                      {currentTierData ? `$${currentTierData.price}/month` : "$0/month"}
                    </p>
                  </div>
                  {user.stripeSubscriptionId && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href="https://billing.stripe.com/p/login/test_..."
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="button-manage-billing"
                      >
                        Manage Billing
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </a>
                    </Button>
                  )}
                </div>

                {currentTierData && (
                  <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                    {currentTierData.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upgrade Options */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Upgrade Your Plan</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {tiers.map((tier) => {
                  const isCurrent = tier.name.toLowerCase() === currentTier.toLowerCase();
                  const canUpgrade = tiers.indexOf(tier) > tiers.findIndex(t => t.name.toLowerCase() === currentTier.toLowerCase());

                  return (
                    <Card
                      key={tier.name}
                      className={`relative ${isCurrent ? "border-primary shadow-lg" : ""}`}
                      data-testid={`card-plan-${tier.name.toLowerCase()}`}
                    >
                      {tier.popular && !isCurrent && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                          Most Popular
                        </Badge>
                      )}
                      <CardHeader>
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tier.color} flex items-center justify-center mb-3`}>
                          <tier.icon className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle>{tier.name}</CardTitle>
                        <div className="text-3xl font-bold">
                          ${tier.price}
                          <span className="text-sm font-normal text-muted-foreground">/month</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          {tier.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                        <Button
                          className="w-full"
                          variant={isCurrent ? "secondary" : canUpgrade ? "default" : "outline"}
                          disabled={isCurrent || !canUpgrade || upgradeMutation.isPending}
                          onClick={() => upgradeMutation.mutate(tier.priceId)}
                          data-testid={`button-${isCurrent ? "current" : canUpgrade ? "upgrade" : "downgrade"}-${tier.name.toLowerCase()}`}
                        >
                          {upgradeMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : isCurrent ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Current Plan
                            </>
                          ) : canUpgrade ? (
                            "Upgrade Now"
                          ) : (
                            "Contact Support"
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Cancel Subscription */}
            {user.stripeSubscriptionId && (
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-5 h-5" />
                    Cancel Subscription
                  </CardTitle>
                  <CardDescription>
                    Cancel your subscription. You'll retain access until the end of your billing period.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Reason for cancelling (optional)</label>
                    <textarea
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Let us know why you're cancelling..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      data-testid="input-cancel-reason"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => cancelMutation.mutate(cancelReason)}
                    disabled={cancelMutation.isPending}
                    data-testid="button-cancel-subscription"
                  >
                    {cancelMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Cancel Subscription
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">First Name</label>
                    <p className="text-lg">{user.firstName || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Name</label>
                    <p className="text-lg">{user.lastName || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-lg">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Username</label>
                    <p className="text-lg">{user.username || "Not set"}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium">Tagline</label>
                  <p className="text-muted-foreground">{user.tagline || "No tagline set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Bio</label>
                  <p className="text-muted-foreground">{user.bio || "No bio set"}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Tab */}
          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Manage your business details and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Business settings will be available soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control how you receive updates and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Notification settings will be available soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
