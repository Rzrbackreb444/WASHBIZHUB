import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CreditCard,
  Crown,
  TrendingUp,
  Zap,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Bell,
  User,
  Building2,
  LogOut,
  Pause,
  Play,
  XCircle,
  Mail,
  AtSign,
  FileText,
} from "lucide-react";

export default function SettingsPage() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();
  
  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    username: user?.username || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    tagline: user?.tagline || "",
  });
  
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

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/users/profile", profileData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditingProfile(false);
      toast({
        title: "Profile updated!",
        description: "Your profile information has been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

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

  const pauseMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/subscriptions/pause", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Subscription paused",
        description: "Your subscription has been paused. You can resume anytime.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to pause subscription",
        variant: "destructive",
      });
    },
  });

  const resumeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/subscriptions/resume", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Subscription resumed",
        description: "Your subscription is now active again.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to resume subscription",
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
      setCancelReason("");
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

  const billingPortalMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/subscriptions/billing-portal");
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account, subscription, and preferences</p>
          </div>
        </div>

        <Tabs defaultValue="subscription" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl">
            <TabsTrigger value="subscription" data-testid="tab-subscription">
              <CreditCard className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Subscription</span>
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">
              <User className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="account" data-testid="tab-account">
              <Building2 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications">
              <Bell className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="billing" data-testid="tab-billing">
              <FileText className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Billing</span>
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
                      {user.stripeSubscriptionId ? "Active subscription" : "Free account - upgrade to unlock premium features"}
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
                  {user.stripeCustomerId && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => billingPortalMutation.mutate()}
                      disabled={billingPortalMutation.isPending}
                      data-testid="button-manage-billing"
                    >
                      {billingPortalMutation.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-2" />
                      ) : (
                        <CreditCard className="w-3 h-3 mr-2" />
                      )}
                      Manage Billing
                      <ExternalLink className="w-3 h-3 ml-2" />
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

            {/* Subscription Actions */}
            {user.stripeSubscriptionId && (
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Management</CardTitle>
                  <CardDescription>Pause, resume, or manage your subscription</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      onClick={() => pauseMutation.mutate()}
                      disabled={pauseMutation.isPending}
                      data-testid="button-pause-subscription"
                    >
                      {pauseMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Pause className="w-4 h-4 mr-2" />
                      )}
                      Pause Subscription
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => resumeMutation.mutate()}
                      disabled={resumeMutation.isPending}
                      data-testid="button-resume-subscription"
                    >
                      {resumeMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      Resume Subscription
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pause your subscription to temporarily stop billing. You can resume anytime without losing your data.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Upgrade Options */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
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
                    Cancel your subscription. You'll retain access until the end of your billing period. Consider pausing instead if you just need a break.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Reason for cancelling (optional)</label>
                    <Textarea
                      placeholder="Your feedback helps us improve. Let us know why you're cancelling..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      data-testid="input-cancel-reason"
                      className="min-h-[100px]"
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
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information and how you appear on the platform</CardDescription>
                </div>
                <Button
                  variant={isEditingProfile ? "outline" : "default"}
                  size="sm"
                  onClick={() => isEditingProfile ? setIsEditingProfile(false) : setIsEditingProfile(true)}
                  data-testid="button-edit-profile"
                >
                  {isEditingProfile ? "Cancel" : "Edit Profile"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">First Name</label>
                        <Input
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          placeholder="John"
                          data-testid="input-first-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Last Name</label>
                        <Input
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          placeholder="Doe"
                          data-testid="input-last-name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <AtSign className="w-4 h-4" />
                        Username <span className="text-xs text-muted-foreground">(used in forums and profile)</span>
                      </label>
                      <Input
                        value={profileData.username}
                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                        placeholder="john_doe"
                        data-testid="input-username"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone Number</label>
                      <Input
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                        type="tel"
                        data-testid="input-phone"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tagline <span className="text-xs text-muted-foreground">(short bio for forum posts)</span></label>
                      <Input
                        value={profileData.tagline}
                        onChange={(e) => setProfileData({ ...profileData, tagline: e.target.value })}
                        placeholder="Laundromat investor & coffee enthusiast"
                        maxLength={100}
                        data-testid="input-tagline"
                      />
                      <p className="text-xs text-muted-foreground">{profileData.tagline.length}/100</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bio <span className="text-xs text-muted-foreground">(tell us about yourself)</span></label>
                      <Textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        placeholder="I've been in the laundromat business for 5 years and love helping others succeed in the industry..."
                        maxLength={500}
                        data-testid="input-bio"
                        className="min-h-[120px]"
                      />
                      <p className="text-xs text-muted-foreground">{profileData.bio.length}/500</p>
                    </div>

                    <Button
                      onClick={() => updateProfileMutation.mutate()}
                      disabled={updateProfileMutation.isPending}
                      data-testid="button-save-profile"
                      className="w-full"
                    >
                      {updateProfileMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      )}
                      Save Profile Changes
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">First Name</label>
                        <p className="text-lg font-medium">{profileData.firstName || "Not set"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                        <p className="text-lg font-medium">{profileData.lastName || "Not set"}</p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Address
                      </label>
                      <p className="text-lg font-medium">{user.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">Email is managed through your account settings</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <AtSign className="w-4 h-4" />
                        Username
                      </label>
                      <p className="text-lg font-medium">{profileData.username || "Not set"}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                      <p className="text-lg font-medium">{profileData.phone || "Not set"}</p>
                    </div>

                    <Separator />

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tagline</label>
                      <p className="text-base">{profileData.tagline || "No tagline set"}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Bio</label>
                      <p className="text-base text-muted-foreground">{profileData.bio || "No bio set"}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account and security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg hover-elevate">
                  <div>
                    <h3 className="font-medium">Account ID</h3>
                    <p className="text-sm text-muted-foreground">{user.id}</p>
                  </div>
                  <Badge variant="secondary">Verified</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover-elevate">
                  <div>
                    <h3 className="font-medium">Member Since</h3>
                    <p className="text-sm text-muted-foreground">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sign Out Section */}
            <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </CardTitle>
                <CardDescription>Sign out of your account on this device</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={logout}
                  data-testid="button-sign-out"
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
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

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Invoices</CardTitle>
                <CardDescription>View and manage your billing information</CardDescription>
              </CardHeader>
              <CardContent>
                {user.stripeCustomerId ? (
                  <Button
                    onClick={() => billingPortalMutation.mutate()}
                    disabled={billingPortalMutation.isPending}
                    data-testid="button-billing-portal"
                    className="w-full"
                  >
                    {billingPortalMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CreditCard className="w-4 h-4 mr-2" />
                    )}
                    Open Stripe Billing Portal
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No billing information yet. Upgrade your plan to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
