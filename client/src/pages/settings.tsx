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
  Briefcase,
  Share2,
  Users,
  Linkedin,
  Globe,
  Youtube,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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

  // Professional tab state
  const [professionalData, setProfessionalData] = useState({
    role: user?.role || "",
    companyName: user?.companyName || "",
    numberOfLocations: user?.numberOfLocations?.toString() || "0",
    yearsInIndustry: "",
    specializations: [] as string[],
  });

  // Social tab state
  const [socialData, setSocialData] = useState({
    linkedinUrl: "",
    twitterUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    websiteUrl: "",
    youtubeChannel: "",
  });

  // Community tab state
  const [communityData, setCommunityData] = useState({
    profileVisibility: "public",
    openToMentoring: false,
    openToNetworking: false,
    areasOfExpertise: [] as string[],
    lookingFor: [] as string[],
  });

  // Options for dropdowns/checkboxes
  const roleOptions = [
    "Owner",
    "Investor",
    "Operator",
    "Broker",
    "Service Tech",
    "Consultant",
    "Aspiring Owner",
    "Other",
  ];

  const locationCountOptions = ["0", "1-3", "4-10", "10+"];

  const specializationOptions = [
    "Coin Laundry",
    "Card/Hybrid",
    "Drop-Off/WDF",
    "Pick-up/Delivery",
    "Commercial",
    "Multi-Housing",
  ];

  const visibilityOptions = [
    { value: "public", label: "Public" },
    { value: "members", label: "Members Only" },
    { value: "private", label: "Private" },
  ];

  const expertiseOptions = [
    "Operations",
    "Marketing",
    "Finance",
    "Equipment",
    "Technology",
    "Real Estate",
    "Staffing",
    "Customer Service",
  ];

  const lookingForOptions = [
    "Partnerships",
    "Mentorship",
    "Consulting",
    "Equipment Deals",
    "Financing",
    "Buyers",
    "Sellers",
  ];

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

  // Update professional info mutation
  const updateProfessionalMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/users/profile", {
        role: professionalData.role,
        companyName: professionalData.companyName,
        numberOfLocations: professionalData.numberOfLocations === "10+" ? 10 : parseInt(professionalData.numberOfLocations.split("-")[0]) || 0,
        yearsInIndustry: parseInt(professionalData.yearsInIndustry) || 0,
        specializations: professionalData.specializations,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Professional info updated!",
        description: "Your professional information has been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update professional info",
        variant: "destructive",
      });
    },
  });

  // Update social links mutation
  const updateSocialMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/users/profile", {
        linkedinUrl: socialData.linkedinUrl,
        twitterUrl: socialData.twitterUrl,
        facebookUrl: socialData.facebookUrl,
        instagramUrl: socialData.instagramUrl,
        websiteUrl: socialData.websiteUrl,
        youtubeChannel: socialData.youtubeChannel,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Social links updated!",
        description: "Your social links have been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update social links",
        variant: "destructive",
      });
    },
  });

  // Update community settings mutation
  const updateCommunityMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/users/profile", {
        profileVisibility: communityData.profileVisibility,
        openToMentoring: communityData.openToMentoring,
        openToNetworking: communityData.openToNetworking,
        areasOfExpertise: communityData.areasOfExpertise,
        lookingFor: communityData.lookingFor,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Community settings updated!",
        description: "Your community preferences have been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update community settings",
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
          <TabsList className="flex flex-wrap gap-1 h-auto p-1 w-full max-w-4xl">
            <TabsTrigger value="subscription" data-testid="tab-subscription" className="flex-1 min-w-[80px]">
              <CreditCard className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Subscription</span>
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile" className="flex-1 min-w-[80px]">
              <User className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="professional" data-testid="tab-professional" className="flex-1 min-w-[80px]">
              <Briefcase className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Professional</span>
            </TabsTrigger>
            <TabsTrigger value="social" data-testid="tab-social" className="flex-1 min-w-[80px]">
              <Share2 className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Social</span>
            </TabsTrigger>
            <TabsTrigger value="community" data-testid="tab-community" className="flex-1 min-w-[80px]">
              <Users className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Community</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications" className="flex-1 min-w-[80px]">
              <Bell className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="billing" data-testid="tab-billing" className="flex-1 min-w-[80px]">
              <FileText className="w-4 h-4 mr-1 sm:mr-2" />
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

          {/* Professional Tab */}
          <TabsContent value="professional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Professional Information
                </CardTitle>
                <CardDescription>Tell us about your role in the laundromat industry</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="role">Your Role</Label>
                    <Select
                      value={professionalData.role}
                      onValueChange={(value) => setProfessionalData(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger data-testid="select-role">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="investor">Investor</SelectItem>
                        <SelectItem value="operator">Operator</SelectItem>
                        <SelectItem value="broker">Broker</SelectItem>
                        <SelectItem value="service_tech">Service Technician</SelectItem>
                        <SelectItem value="consultant">Consultant</SelectItem>
                        <SelectItem value="aspiring">Aspiring Owner</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={professionalData.companyName}
                      onChange={(e) => setProfessionalData(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Your business name"
                      data-testid="input-company-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="locations">Number of Locations</Label>
                    <Select
                      value={professionalData.numberOfLocations}
                      onValueChange={(value) => setProfessionalData(prev => ({ ...prev, numberOfLocations: value }))}
                    >
                      <SelectTrigger data-testid="select-locations">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 (Looking to start)</SelectItem>
                        <SelectItem value="1-3">1-3 locations</SelectItem>
                        <SelectItem value="4-10">4-10 locations</SelectItem>
                        <SelectItem value="10+">10+ locations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearsInIndustry">Years in Industry</Label>
                    <Input
                      id="yearsInIndustry"
                      type="number"
                      value={professionalData.yearsInIndustry}
                      onChange={(e) => setProfessionalData(prev => ({ ...prev, yearsInIndustry: e.target.value }))}
                      placeholder="0"
                      data-testid="input-years-industry"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Specializations</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Coin Laundry', 'Card/Hybrid', 'Drop-Off/WDF', 'Pick-up/Delivery', 'Commercial', 'Multi-Housing'].map((spec) => (
                      <div key={spec} className="flex items-center space-x-2">
                        <Checkbox
                          id={`spec-${spec}`}
                          checked={professionalData.specializations.includes(spec)}
                          onCheckedChange={(checked) => {
                            setProfessionalData(prev => ({
                              ...prev,
                              specializations: checked
                                ? [...prev.specializations, spec]
                                : prev.specializations.filter(s => s !== spec)
                            }));
                          }}
                          data-testid={`checkbox-spec-${spec.toLowerCase().replace(/[\/\s]/g, '-')}`}
                        />
                        <Label htmlFor={`spec-${spec}`} className="text-sm font-normal cursor-pointer">{spec}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => updateProfessionalMutation.mutate()}
                  disabled={updateProfessionalMutation.isPending}
                  data-testid="button-save-professional"
                  className="w-full"
                >
                  {updateProfessionalMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Save Professional Info
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Social Links
                </CardTitle>
                <CardDescription>Connect your social profiles to build your network</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    value={socialData.linkedinUrl}
                    onChange={(e) => setSocialData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                    placeholder="https://linkedin.com/in/yourprofile"
                    data-testid="input-linkedin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="flex items-center gap-2">
                    <AtSign className="w-4 h-4" />
                    Twitter / X
                  </Label>
                  <Input
                    id="twitter"
                    value={socialData.twitterUrl}
                    onChange={(e) => setSocialData(prev => ({ ...prev, twitterUrl: e.target.value }))}
                    placeholder="https://twitter.com/yourhandle"
                    data-testid="input-twitter"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Facebook
                  </Label>
                  <Input
                    id="facebook"
                    value={socialData.facebookUrl}
                    onChange={(e) => setSocialData(prev => ({ ...prev, facebookUrl: e.target.value }))}
                    placeholder="https://facebook.com/yourpage"
                    data-testid="input-facebook"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <AtSign className="w-4 h-4" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    value={socialData.instagramUrl}
                    onChange={(e) => setSocialData(prev => ({ ...prev, instagramUrl: e.target.value }))}
                    placeholder="https://instagram.com/yourhandle"
                    data-testid="input-instagram"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={socialData.websiteUrl}
                    onChange={(e) => setSocialData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                    placeholder="https://yourwebsite.com"
                    data-testid="input-website"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube" className="flex items-center gap-2">
                    <Youtube className="w-4 h-4" />
                    YouTube Channel
                  </Label>
                  <Input
                    id="youtube"
                    value={socialData.youtubeChannel}
                    onChange={(e) => setSocialData(prev => ({ ...prev, youtubeChannel: e.target.value }))}
                    placeholder="https://youtube.com/@yourchannel"
                    data-testid="input-youtube"
                  />
                </div>

                <Button
                  onClick={() => updateSocialMutation.mutate()}
                  disabled={updateSocialMutation.isPending}
                  data-testid="button-save-social"
                  className="w-full mt-4"
                >
                  {updateSocialMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Save Social Links
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Community Settings
                </CardTitle>
                <CardDescription>Control your visibility and networking preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="visibility">Profile Visibility</Label>
                  <Select
                    value={communityData.profileVisibility}
                    onValueChange={(value) => setCommunityData(prev => ({ ...prev, profileVisibility: value }))}
                  >
                    <SelectTrigger data-testid="select-visibility">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Anyone can view</SelectItem>
                      <SelectItem value="members">Members Only - Subscribers can view</SelectItem>
                      <SelectItem value="private">Private - Only you can view</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Open to Mentoring</Label>
                      <p className="text-sm text-muted-foreground">Let others know you're willing to mentor new operators</p>
                    </div>
                    <Switch
                      checked={communityData.openToMentoring}
                      onCheckedChange={(checked) => setCommunityData(prev => ({ ...prev, openToMentoring: checked }))}
                      data-testid="switch-mentoring"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Open to Networking</Label>
                      <p className="text-sm text-muted-foreground">Allow members to connect with you for business opportunities</p>
                    </div>
                    <Switch
                      checked={communityData.openToNetworking}
                      onCheckedChange={(checked) => setCommunityData(prev => ({ ...prev, openToNetworking: checked }))}
                      data-testid="switch-networking"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Areas of Expertise</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Operations', 'Marketing', 'Finance', 'Equipment', 'Technology', 'Real Estate', 'Staffing', 'Customer Service'].map((area) => (
                      <div key={area} className="flex items-center space-x-2">
                        <Checkbox
                          id={`expertise-${area}`}
                          checked={communityData.areasOfExpertise.includes(area)}
                          onCheckedChange={(checked) => {
                            setCommunityData(prev => ({
                              ...prev,
                              areasOfExpertise: checked
                                ? [...prev.areasOfExpertise, area]
                                : prev.areasOfExpertise.filter(a => a !== area)
                            }));
                          }}
                          data-testid={`checkbox-expertise-${area.toLowerCase()}`}
                        />
                        <Label htmlFor={`expertise-${area}`} className="text-sm font-normal cursor-pointer">{area}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Looking For</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Partnerships', 'Mentorship', 'Consulting', 'Equipment Deals', 'Financing', 'Buyers', 'Sellers'].map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          id={`looking-${item}`}
                          checked={communityData.lookingFor.includes(item)}
                          onCheckedChange={(checked) => {
                            setCommunityData(prev => ({
                              ...prev,
                              lookingFor: checked
                                ? [...prev.lookingFor, item]
                                : prev.lookingFor.filter(l => l !== item)
                            }));
                          }}
                          data-testid={`checkbox-looking-${item.toLowerCase().replace(/\s/g, '-')}`}
                        />
                        <Label htmlFor={`looking-${item}`} className="text-sm font-normal cursor-pointer">{item}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => updateCommunityMutation.mutate()}
                  disabled={updateCommunityMutation.isPending}
                  data-testid="button-save-community"
                  className="w-full"
                >
                  {updateCommunityMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Save Community Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
