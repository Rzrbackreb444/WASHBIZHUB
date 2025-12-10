import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Gift,
  Ticket,
  Mail,
  MessageSquare,
  Users,
  TrendingUp,
  Calendar,
  Star,
  Award,
  Percent,
  DollarSign,
  Clock,
  Send,
  Plus,
  Pencil,
  Trash2,
  Copy,
  RefreshCw,
  BarChart3,
  Target,
  UserPlus,
  Heart,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  Eye,
  MousePointer,
  CheckCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

const TIER_COLORS = {
  Bronze: "#CD7F32",
  Silver: "#C0C0C0",
  Gold: "#FFD700",
  Platinum: "#E5E4E2",
};

const CHART_COLORS = ["#0A1628", "#C8A661", "#22C55E", "#3B82F6", "#8B5CF6"];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

const couponFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().optional(),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed_amount", "free_service", "points_multiplier"]),
  discountValue: z.string().min(1, "Discount value is required"),
  usageLimit: z.string().optional(),
  usageLimitPerCustomer: z.string().default("1"),
  minimumOrderAmount: z.string().optional(),
  expiresAt: z.string().optional(),
  isFirstOrderOnly: z.boolean().default(false),
});

const campaignFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["email", "sms", "in_app", "push"]),
  subject: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  audienceType: z.enum(["all", "segment", "manual"]),
  scheduleType: z.enum(["one_time", "recurring"]),
  scheduledFor: z.string().optional(),
});

const loyaltyFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  pointsPerDollar: z.string().min(1, "Points per dollar is required"),
  birthdayBonusPoints: z.string().default("100"),
  anniversaryBonusPoints: z.string().default("50"),
  referralRewardPoints: z.string().default("200"),
  referralSignupPoints: z.string().default("100"),
  minimumRedemptionPoints: z.string().default("100"),
  pointsPerDollarRedemption: z.string().default("100"),
  pointsExpirationDays: z.string().default("365"),
});

export default function MarketingLoyalty() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedLaundromat, setSelectedLaundromat] = useState<string>("");
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [showLoyaltyDialog, setShowLoyaltyDialog] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);

  const { data: laundromats = [] } = useQuery({
    queryKey: ['/api/laundromats'],
  });

  const laundromatId = selectedLaundromat || (laundromats as any[])[0]?.id;

  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/marketing/dashboard', laundromatId],
    enabled: !!laundromatId,
  });

  const { data: loyaltyProgram } = useQuery({
    queryKey: ['/api/marketing/loyalty-program', laundromatId],
    enabled: !!laundromatId,
  });

  const { data: couponsData = [] } = useQuery({
    queryKey: ['/api/marketing/coupons', laundromatId],
    enabled: !!laundromatId,
  });

  const { data: campaignsData = [] } = useQuery({
    queryKey: ['/api/marketing/campaigns', laundromatId],
    enabled: !!laundromatId,
  });

  const { data: winBackRules = [] } = useQuery({
    queryKey: ['/api/marketing/win-back', laundromatId],
    enabled: !!laundromatId,
  });

  const { data: loyaltyTransactionsData = [] } = useQuery({
    queryKey: ['/api/marketing/loyalty-transactions', laundromatId],
    enabled: !!laundromatId,
  });

  const couponForm = useForm({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      discountType: "percentage" as const,
      discountValue: "",
      usageLimit: "",
      usageLimitPerCustomer: "1",
      minimumOrderAmount: "",
      expiresAt: "",
      isFirstOrderOnly: false,
    },
  });

  const campaignForm = useForm({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      name: "",
      type: "email" as const,
      subject: "",
      content: "",
      audienceType: "all" as const,
      scheduleType: "one_time" as const,
      scheduledFor: "",
    },
  });

  const loyaltyForm = useForm({
    resolver: zodResolver(loyaltyFormSchema),
    defaultValues: {
      name: "Loyalty Rewards",
      pointsPerDollar: "1",
      birthdayBonusPoints: "100",
      anniversaryBonusPoints: "50",
      referralRewardPoints: "200",
      referralSignupPoints: "100",
      minimumRedemptionPoints: "100",
      pointsPerDollarRedemption: "100",
      pointsExpirationDays: "365",
    },
  });

  const createCouponMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/marketing/coupons', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketing/coupons'] });
      setShowCouponDialog(false);
      couponForm.reset();
      toast({ title: "Coupon created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create coupon", variant: "destructive" });
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/marketing/coupons/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketing/coupons'] });
      toast({ title: "Coupon deleted" });
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/marketing/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketing/campaigns'] });
      setShowCampaignDialog(false);
      campaignForm.reset();
      toast({ title: "Campaign created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create campaign", variant: "destructive" });
    },
  });

  const saveLoyaltyMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/marketing/loyalty-program', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketing/loyalty-program'] });
      setShowLoyaltyDialog(false);
      toast({ title: "Loyalty program saved" });
    },
    onError: () => {
      toast({ title: "Failed to save loyalty program", variant: "destructive" });
    },
  });

  const onSubmitCoupon = (data: z.infer<typeof couponFormSchema>) => {
    createCouponMutation.mutate({
      ...data,
      laundromatId,
      discountValue: data.discountValue,
      usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
      usageLimitPerCustomer: parseInt(data.usageLimitPerCustomer),
      minimumOrderAmount: data.minimumOrderAmount || null,
      expiresAt: data.expiresAt || null,
    });
  };

  const onSubmitCampaign = (data: z.infer<typeof campaignFormSchema>) => {
    createCampaignMutation.mutate({
      ...data,
      laundromatId,
      scheduledFor: data.scheduledFor || null,
    });
  };

  const onSubmitLoyalty = (data: z.infer<typeof loyaltyFormSchema>) => {
    saveLoyaltyMutation.mutate({
      ...data,
      laundromatId,
      isActive: true,
    });
  };

  const stats = dashboardStats as any;
  const coupons = couponsData as any[];
  const campaigns = campaignsData as any[];
  const loyaltyTxs = loyaltyTransactionsData as any[];

  const tierDistribution = useMemo(() => {
    if (!loyaltyProgram) return [];
    const tiers = (loyaltyProgram as any).tiers || [];
    return tiers.map((tier: any, i: number) => ({
      name: tier.name,
      value: Math.floor(Math.random() * 100) + 20, // Mock data
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [loyaltyProgram]);

  return (
    <>
      <Helmet>
        <title>Marketing & Loyalty Engine | WashBizHub</title>
        <meta name="description" content="Enterprise-grade marketing automation, loyalty programs, and promotional tools for laundromats." />
      </Helmet>

      <div className="min-h-screen bg-muted/30" data-testid="marketing-loyalty-page">
        <div className="h-1 bg-[#C8A661]" />
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="page-title">
                Marketing & Loyalty Engine
              </h1>
              <p className="text-muted-foreground mt-1">
                Drive customer engagement with campaigns, coupons, and loyalty rewards
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={selectedLaundromat} onValueChange={setSelectedLaundromat}>
                <SelectTrigger className="w-[200px]" data-testid="select-laundromat">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {(laundromats as any[]).map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-card border">
              <TabsTrigger value="dashboard" data-testid="tab-dashboard">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="loyalty" data-testid="tab-loyalty">
                <Star className="w-4 h-4 mr-2" />
                Loyalty Program
              </TabsTrigger>
              <TabsTrigger value="coupons" data-testid="tab-coupons">
                <Ticket className="w-4 h-4 mr-2" />
                Coupons & Promos
              </TabsTrigger>
              <TabsTrigger value="campaigns" data-testid="tab-campaigns">
                <Mail className="w-4 h-4 mr-2" />
                Campaigns
              </TabsTrigger>
              <TabsTrigger value="winback" data-testid="tab-winback">
                <Heart className="w-4 h-4 mr-2" />
                Win-Back
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card border shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                        <Star className="h-5 w-5 text-[#C8A661]" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Points Issued</p>
                        <p className="text-2xl font-bold text-[#C8A661]" data-testid="stat-points-issued">
                          {stats?.loyalty?.totalPointsIssued?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                        <Ticket className="h-5 w-5 text-[#C8A661]" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Coupon Redemptions</p>
                        <p className="text-2xl font-bold text-[#C8A661]" data-testid="stat-redemptions">
                          {stats?.coupons?.totalRedemptions || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                        <Send className="h-5 w-5 text-[#C8A661]" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Campaigns Sent</p>
                        <p className="text-2xl font-bold text-[#C8A661]" data-testid="stat-campaigns-sent">
                          {stats?.campaigns?.totalSent || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                        <RefreshCw className="h-5 w-5 text-[#C8A661]" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Win-Back Conversions</p>
                        <p className="text-2xl font-bold text-[#C8A661]" data-testid="stat-winback">
                          {stats?.winBack?.totalConverted || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Campaign Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: "Sent", value: stats?.campaigns?.totalSent || 0 },
                          { name: "Opens", value: stats?.campaigns?.totalOpens || 0 },
                          { name: "Clicks", value: stats?.campaigns?.totalClicks || 0 },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <Tooltip />
                          <Bar dataKey="value" fill="#C8A661" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Loyalty Tier Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={tierDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            dataKey="value"
                            label={({ name }) => name}
                          >
                            {tierDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Loyalty Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Points</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loyaltyTxs.slice(0, 10).map((tx: any) => (
                          <TableRow key={tx.id}>
                            <TableCell className="text-sm">
                              {tx.createdAt ? format(new Date(tx.createdAt), "MMM d, yyyy") : "-"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={tx.type === "earn" ? "default" : "secondary"}>
                                {tx.type}
                              </Badge>
                            </TableCell>
                            <TableCell className={tx.points > 0 ? "text-green-600" : "text-red-600"}>
                              {tx.points > 0 ? "+" : ""}{tx.points}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {tx.description}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="loyalty" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Loyalty Program Settings</h2>
                  <p className="text-muted-foreground">Configure how customers earn and redeem points</p>
                </div>
                <Button onClick={() => setShowLoyaltyDialog(true)} data-testid="button-configure-loyalty">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Program
                </Button>
              </div>

              {loyaltyProgram ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="bg-card border shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#C8A661]" />
                        Earning Rules
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">Points per $1 spent</span>
                        <span className="font-semibold text-[#C8A661]">
                          {(loyaltyProgram as any).pointsPerDollar}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">Birthday Bonus</span>
                        <span className="font-semibold text-[#C8A661]">
                          {(loyaltyProgram as any).birthdayBonusPoints} pts
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">Referral Reward</span>
                        <span className="font-semibold text-[#C8A661]">
                          {(loyaltyProgram as any).referralRewardPoints} pts
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Gift className="w-5 h-5 text-[#C8A661]" />
                        Redemption Rules
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">Points per $1 discount</span>
                        <span className="font-semibold text-[#C8A661]">
                          {(loyaltyProgram as any).pointsPerDollarRedemption}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">Minimum Redemption</span>
                        <span className="font-semibold text-[#C8A661]">
                          {(loyaltyProgram as any).minimumRedemptionPoints} pts
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">Points Expiration</span>
                        <span className="font-semibold text-[#C8A661]">
                          {(loyaltyProgram as any).pointsExpirationDays} days
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-[#C8A661]" />
                        Tier Levels
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {((loyaltyProgram as any).tiers || []).map((tier: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: TIER_COLORS[tier.name as keyof typeof TIER_COLORS] || "#888" }}
                            />
                            <span className="font-medium">{tier.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {tier.minPoints}+ pts ({tier.pointsMultiplier}x)
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="bg-card border shadow-sm">
                  <CardContent className="p-12 text-center">
                    <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Loyalty Program Configured</h3>
                    <p className="text-muted-foreground mb-4">
                      Set up a loyalty program to reward your customers and increase retention
                    </p>
                    <Button onClick={() => setShowLoyaltyDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Loyalty Program
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="coupons" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Coupons & Promo Codes</h2>
                  <p className="text-muted-foreground">Create and manage promotional offers</p>
                </div>
                <Button onClick={() => setShowCouponDialog(true)} data-testid="button-create-coupon">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Coupon
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((coupon) => (
                  <Card key={coupon.id} className="bg-card border shadow-sm" data-testid={`coupon-card-${coupon.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{coupon.name}</CardTitle>
                          <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                            {coupon.code}
                          </code>
                        </div>
                        <Badge variant={coupon.isActive ? "default" : "secondary"}>
                          {coupon.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-2xl font-bold text-[#C8A661]">
                        {coupon.discountType === "percentage" ? (
                          <>
                            <Percent className="w-5 h-5" />
                            {coupon.discountValue}% OFF
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-5 h-5" />
                            ${coupon.discountValue} OFF
                          </>
                        )}
                      </div>
                      
                      {coupon.description && (
                        <p className="text-sm text-muted-foreground">{coupon.description}</p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {coupon.usageLimit && (
                          <Badge variant="outline">
                            {coupon.usedCount}/{coupon.usageLimit} used
                          </Badge>
                        )}
                        {coupon.expiresAt && (
                          <Badge variant="outline">
                            <Clock className="w-3 h-3 mr-1" />
                            Expires {format(new Date(coupon.expiresAt), "MMM d")}
                          </Badge>
                        )}
                        {coupon.isFirstOrderOnly && (
                          <Badge variant="outline">First order only</Badge>
                        )}
                      </div>

                      <Separator />

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            navigator.clipboard.writeText(coupon.code);
                            toast({ title: "Copied to clipboard" });
                          }}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteCouponMutation.mutate(coupon.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {coupons.length === 0 && (
                <Card className="bg-card border shadow-sm">
                  <CardContent className="p-12 text-center">
                    <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Coupons Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first coupon to offer promotions to customers
                    </p>
                    <Button onClick={() => setShowCouponDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Coupon
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="campaigns" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Marketing Campaigns</h2>
                  <p className="text-muted-foreground">Send targeted messages to your customers</p>
                </div>
                <Button onClick={() => setShowCampaignDialog(true)} data-testid="button-create-campaign">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </div>

              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="bg-card border shadow-sm" data-testid={`campaign-card-${campaign.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                            {campaign.type === "email" && <Mail className="h-5 w-5 text-[#C8A661]" />}
                            {campaign.type === "sms" && <MessageSquare className="h-5 w-5 text-[#C8A661]" />}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{campaign.name}</h3>
                            <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge variant={
                                campaign.status === "sent" ? "default" :
                                campaign.status === "scheduled" ? "secondary" : "outline"
                              }>
                                {campaign.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {campaign.estimatedReach || 0} recipients
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Eye className="w-3 h-3" />
                              Opens
                            </div>
                            <p className="font-semibold">{campaign.totalOpens || 0}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MousePointer className="w-3 h-3" />
                              Clicks
                            </div>
                            <p className="font-semibold">{campaign.totalClicks || 0}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <CheckCircle className="w-3 h-3" />
                              Conversions
                            </div>
                            <p className="font-semibold">{campaign.totalConversions || 0}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {campaigns.length === 0 && (
                <Card className="bg-card border shadow-sm">
                  <CardContent className="p-12 text-center">
                    <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Campaigns Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first campaign to engage with customers
                    </p>
                    <Button onClick={() => setShowCampaignDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Campaign
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="winback" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Win-Back Automation</h2>
                  <p className="text-muted-foreground">Automatically re-engage lapsed customers</p>
                </div>
                <Button data-testid="button-create-winback">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Rule
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-card border shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                    <p className="text-3xl font-bold text-[#C8A661]">
                      {stats?.winBack?.totalTriggered || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Customers Targeted</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-3">
                      <RefreshCw className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-[#C8A661]">
                      {stats?.winBack?.totalConverted || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Customers Won Back</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-3">
                      <Percent className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-[#C8A661]">
                      {stats?.winBack?.totalTriggered 
                        ? Math.round((stats.winBack.totalConverted / stats.winBack.totalTriggered) * 100) 
                        : 0}%
                    </p>
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card border shadow-sm">
                <CardHeader>
                  <CardTitle>Active Win-Back Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  {(winBackRules as any[]).length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rule Name</TableHead>
                          <TableHead>Trigger</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Performance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(winBackRules as any[]).map((rule) => (
                          <TableRow key={rule.id}>
                            <TableCell className="font-medium">{rule.name}</TableCell>
                            <TableCell>{rule.daysSinceLastVisit} days inactive</TableCell>
                            <TableCell>
                              <Badge variant="outline">{rule.actionType}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={rule.isActive ? "default" : "secondary"}>
                                {rule.isActive ? "Active" : "Paused"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {rule.totalTriggered} sent, {rule.totalConverted} converted
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No win-back rules configured yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Dialog open={showCouponDialog} onOpenChange={setShowCouponDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Coupon</DialogTitle>
              <DialogDescription>Set up a new promotional code</DialogDescription>
            </DialogHeader>
            <Form {...couponForm}>
              <form onSubmit={couponForm.handleSubmit(onSubmitCoupon)} className="space-y-4">
                <FormField
                  control={couponForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coupon Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Summer Sale" {...field} data-testid="input-coupon-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={couponForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="SUMMER20 (auto-generated if empty)" {...field} data-testid="input-coupon-code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={couponForm.control}
                    name="discountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-discount-type">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                            <SelectItem value="free_service">Free Service</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={couponForm.control}
                    name="discountValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Value</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="20" {...field} data-testid="input-discount-value" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={couponForm.control}
                    name="usageLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Usage Limit</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="100" {...field} data-testid="input-usage-limit" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={couponForm.control}
                    name="expiresAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expires On</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-expires-at" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={couponForm.control}
                  name="isFirstOrderOnly"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>First Order Only</FormLabel>
                        <FormDescription className="text-xs">
                          Only valid for new customers
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowCouponDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createCouponMutation.isPending} data-testid="button-submit-coupon">
                    {createCouponMutation.isPending ? "Creating..." : "Create Coupon"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={showCampaignDialog} onOpenChange={setShowCampaignDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Campaign</DialogTitle>
              <DialogDescription>Set up a new marketing campaign</DialogDescription>
            </DialogHeader>
            <Form {...campaignForm}>
              <form onSubmit={campaignForm.handleSubmit(onSubmitCampaign)} className="space-y-4">
                <FormField
                  control={campaignForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Holiday Special" {...field} data-testid="input-campaign-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={campaignForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Channel</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-campaign-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="in_app">In-App</SelectItem>
                          <SelectItem value="push">Push Notification</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={campaignForm.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject Line</FormLabel>
                      <FormControl>
                        <Input placeholder="Don't miss out!" {...field} data-testid="input-campaign-subject" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={campaignForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Write your message..." 
                          className="min-h-[100px]"
                          {...field} 
                          data-testid="input-campaign-content"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={campaignForm.control}
                    name="audienceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Audience</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-audience-type">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Customers</SelectItem>
                            <SelectItem value="segment">Segment</SelectItem>
                            <SelectItem value="manual">Manual Selection</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={campaignForm.control}
                    name="scheduleType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schedule</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-schedule-type">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="one_time">One-time</SelectItem>
                            <SelectItem value="recurring">Recurring</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowCampaignDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createCampaignMutation.isPending} data-testid="button-submit-campaign">
                    {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={showLoyaltyDialog} onOpenChange={setShowLoyaltyDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Configure Loyalty Program</DialogTitle>
              <DialogDescription>Set up how customers earn and redeem points</DialogDescription>
            </DialogHeader>
            <Form {...loyaltyForm}>
              <form onSubmit={loyaltyForm.handleSubmit(onSubmitLoyalty)} className="space-y-4">
                <FormField
                  control={loyaltyForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Program Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Loyalty Rewards" {...field} data-testid="input-loyalty-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />
                <h4 className="font-medium">Earning Rules</h4>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={loyaltyForm.control}
                    name="pointsPerDollar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Points per $1 spent</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} data-testid="input-points-per-dollar" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loyaltyForm.control}
                    name="birthdayBonusPoints"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birthday Bonus</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} data-testid="input-birthday-bonus" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={loyaltyForm.control}
                    name="referralRewardPoints"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referral Reward</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} data-testid="input-referral-reward" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loyaltyForm.control}
                    name="referralSignupPoints"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Customer Signup</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} data-testid="input-signup-points" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />
                <h4 className="font-medium">Redemption Rules</h4>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={loyaltyForm.control}
                    name="pointsPerDollarRedemption"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Points per $1 off</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} data-testid="input-points-per-dollar-redemption" />
                        </FormControl>
                        <FormDescription className="text-xs">
                          e.g., 100 = 100 points for $1 off
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loyaltyForm.control}
                    name="minimumRedemptionPoints"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum to Redeem</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} data-testid="input-min-redemption" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={loyaltyForm.control}
                  name="pointsExpirationDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Points Expiration (days)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} data-testid="input-expiration-days" />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Points expire after this many days of inactivity
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowLoyaltyDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saveLoyaltyMutation.isPending} data-testid="button-submit-loyalty">
                    {saveLoyaltyMutation.isPending ? "Saving..." : "Save Program"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
