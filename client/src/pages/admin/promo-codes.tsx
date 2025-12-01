import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeft, 
  Plus, 
  Ticket, 
  Copy, 
  Trash2, 
  Calendar,
  Users,
  DollarSign,
  CheckCircle2,
  XCircle,
  Loader2,
  Share2,
  Eye
} from "lucide-react";

const createPromoSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(50),
  description: z.string().optional(),
  discountType: z.enum(["percent", "fixed"]),
  discountAmount: z.coerce.number().min(1, "Discount must be at least 1"),
  maxRedemptions: z.coerce.number().min(1).optional().or(z.literal("")),
  maxRedemptionsPerUser: z.coerce.number().min(1).default(1),
  expiresAt: z.string().optional(),
  syncToStripe: z.boolean().default(true),
});

type PromoFormData = z.infer<typeof createPromoSchema>;

interface PromoCode {
  id: string;
  code: string;
  description?: string;
  discountType: string;
  discountAmount: number;
  stripeCouponId?: string;
  stripePromotionCodeId?: string;
  maxRedemptions?: number;
  maxRedemptionsPerUser: number;
  currentRedemptions: number;
  startsAt: string;
  expiresAt?: string;
  applicableProducts?: string[];
  isActive: boolean;
  createdAt: string;
  redemptionCount?: number;
  totalDiscountGiven?: number;
  remainingUses?: number;
}

export default function AdminPromoCodes() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<PromoCode | null>(null);

  const form = useForm<PromoFormData>({
    resolver: zodResolver(createPromoSchema),
    defaultValues: {
      code: "",
      description: "",
      discountType: "percent",
      discountAmount: 20,
      maxRedemptions: "",
      maxRedemptionsPerUser: 1,
      expiresAt: "",
      syncToStripe: true,
    },
  });

  const { data: promoCodes, isLoading } = useQuery<PromoCode[]>({
    queryKey: ['/api/admin/promo-codes'],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: async (data: PromoFormData) => {
      const payload = {
        ...data,
        maxRedemptions: data.maxRedemptions === "" ? undefined : data.maxRedemptions,
        expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : undefined,
      };
      return apiRequest('/api/admin/promo-codes', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promo-codes'] });
      toast({ title: "Promo code created", description: "The promo code has been created successfully." });
      setCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error creating promo code", 
        description: error.message || "Something went wrong",
        variant: "destructive" 
      });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin/promo-codes/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promo-codes'] });
      toast({ title: "Promo code deactivated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: `Promo code "${code}" copied to clipboard` });
  };

  const generateShareMessage = (code: string, discount: string) => {
    const message = `🎉 EXCLUSIVE DEAL for our Facebook Group members! 

Use code: ${code}
Get ${discount} off your WashBizHub subscription!

Start analyzing locations with CLEANBI™ and grow your laundromat empire! 🧺

👉 https://washbizhub.com/pricing`;
    navigator.clipboard.writeText(message);
    toast({ title: "Share message copied!", description: "Ready to paste in your Facebook group" });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    setLocation('/');
    return null;
  }

  const formatDiscount = (type: string, amount: number) => {
    return type === "percent" ? `${amount}%` : `$${(amount / 100).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation('/admin')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Ticket className="w-8 h-8 text-primary" />
              Promo Codes
            </h1>
            <p className="text-muted-foreground">
              Create and manage discount codes for your Facebook group
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-promo">
                <Plus className="w-4 h-4 mr-2" />
                Create Promo Code
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Promo Code</DialogTitle>
                <DialogDescription>
                  Create a discount code to share with your Facebook group members
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promo Code</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="FBGROUP50" 
                            {...field} 
                            className="uppercase"
                            data-testid="input-promo-code"
                          />
                        </FormControl>
                        <FormDescription>
                          This is what users will enter at checkout
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Internal)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Facebook group launch promo" 
                            {...field}
                            data-testid="input-promo-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="discountType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-discount-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="percent">Percentage (%)</SelectItem>
                              <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="discountAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {form.watch("discountType") === "percent" ? "Percentage" : "Amount (cents)"}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder={form.watch("discountType") === "percent" ? "20" : "1000"}
                              {...field}
                              data-testid="input-discount-amount"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="maxRedemptions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Total Uses</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Unlimited" 
                              {...field}
                              data-testid="input-max-redemptions"
                            />
                          </FormControl>
                          <FormDescription>Leave empty for unlimited</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="maxRedemptionsPerUser"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Uses Per User</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              data-testid="input-max-per-user"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="expiresAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiration Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            {...field}
                            data-testid="input-expires-at"
                          />
                        </FormControl>
                        <FormDescription>Leave empty for no expiration</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="syncToStripe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Sync to Stripe</FormLabel>
                          <FormDescription>
                            Create matching coupon in Stripe
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-sync-stripe"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending}
                      data-testid="button-submit-promo"
                    >
                      {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Create Promo Code
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{promoCodes?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {promoCodes?.filter(p => p.isActive).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Redemptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {promoCodes?.reduce((sum, p) => sum + (p.redemptionCount || 0), 0) || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Discounts Given</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                ${((promoCodes?.reduce((sum, p) => sum + (p.totalDiscountGiven || 0), 0) || 0) / 100).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Promo Codes</CardTitle>
            <CardDescription>Manage your discount codes</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : promoCodes && promoCodes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Redemptions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoCodes.map((promo) => (
                    <TableRow key={promo.id} data-testid={`row-promo-${promo.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-lg font-mono font-bold bg-muted px-2 py-1 rounded">
                            {promo.code}
                          </code>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(promo.code)}
                            data-testid={`button-copy-${promo.id}`}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        {promo.description && (
                          <p className="text-xs text-muted-foreground mt-1">{promo.description}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-lg">
                          {formatDiscount(promo.discountType, promo.discountAmount)} OFF
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{promo.currentRedemptions}</span>
                          {promo.maxRedemptions && (
                            <span className="text-muted-foreground">/ {promo.maxRedemptions}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {promo.isActive ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                        {promo.stripePromotionCodeId && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Stripe Synced
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {promo.expiresAt ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-3 h-3" />
                            {new Date(promo.expiresAt).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => generateShareMessage(
                              promo.code, 
                              formatDiscount(promo.discountType, promo.discountAmount)
                            )}
                            title="Copy share message"
                            data-testid={`button-share-${promo.id}`}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                          {promo.isActive && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => deactivateMutation.mutate(promo.id)}
                              disabled={deactivateMutation.isPending}
                              title="Deactivate"
                              data-testid={`button-deactivate-${promo.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No promo codes yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first promo code to share with your Facebook group
                </p>
                <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-create-first">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Promo Code
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Quick Share Templates
            </CardTitle>
            <CardDescription>
              Ready-to-use messages for your Facebook group
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Launch Announcement Template:</p>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {`🚀 EXCLUSIVE for our group members!

We just launched CLEANBI™ - the ultimate location analysis tool for laundromat investors!

🎁 Use code: [YOUR_CODE] to get [DISCOUNT] off any subscription!

What you'll get:
✅ Instant CLEANBI™ scores for any address
✅ Competitor mapping & analysis
✅ Demographics & traffic data
✅ Revenue projections

Try it now: https://washbizhub.com/cleanbi-explorer

Limited time offer! 🔥`}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => {
                  navigator.clipboard.writeText(`🚀 EXCLUSIVE for our group members!

We just launched CLEANBI™ - the ultimate location analysis tool for laundromat investors!

🎁 Use code: [YOUR_CODE] to get [DISCOUNT] off any subscription!

What you'll get:
✅ Instant CLEANBI™ scores for any address
✅ Competitor mapping & analysis
✅ Demographics & traffic data
✅ Revenue projections

Try it now: https://washbizhub.com/cleanbi-explorer

Limited time offer! 🔥`);
                  toast({ title: "Template copied!" });
                }}
                data-testid="button-copy-template"
              >
                <Copy className="w-3 h-3 mr-2" />
                Copy Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
