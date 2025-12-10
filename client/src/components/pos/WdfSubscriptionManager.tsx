import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  Calendar,
  Scale,
  TrendingUp,
  Pause,
  Play,
  X,
  RefreshCw,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  ChevronRight,
} from "lucide-react";

type WdfSubscription = {
  id: string;
  planName: string;
  planType: "weekly" | "monthly";
  poundAllocation: number;
  usedPounds: number;
  rolloverPounds: number;
  maxRollover: number;
  subscriptionPrice: number;
  overageRate: number;
  status: "active" | "paused" | "cancelled" | "past_due";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  serviceType: string;
  customerName?: string;
};

type SubscriptionPlan = {
  id: string;
  name: string;
  type: "weekly" | "monthly";
  poundAllocation: number;
  price: number;
  overageRate: number;
  popular?: boolean;
};

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  { id: "weekly-basic", name: "Weekly Wash", type: "weekly", poundAllocation: 15, price: 24.99, overageRate: 2.00 },
  { id: "weekly-plus", name: "Weekly Plus", type: "weekly", poundAllocation: 25, price: 39.99, overageRate: 1.75, popular: true },
  { id: "monthly-starter", name: "Monthly Starter", type: "monthly", poundAllocation: 40, price: 59.99, overageRate: 1.75 },
  { id: "monthly-family", name: "Family Plan", type: "monthly", poundAllocation: 80, price: 99.99, overageRate: 1.50, popular: true },
  { id: "monthly-unlimited", name: "Unlimited", type: "monthly", poundAllocation: 999, price: 149.99, overageRate: 1.25 },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

type WdfSubscriptionManagerProps = {
  customerId?: string;
  laundromatId?: string;
};

export default function WdfSubscriptionManager({
  customerId,
  laundromatId,
}: WdfSubscriptionManagerProps) {
  const { toast } = useToast();
  const [showNewPlanDialog, setShowNewPlanDialog] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<WdfSubscription | null>(null);
  const [pauseReason, setPauseReason] = useState("");

  const { data: subscriptions = [], isLoading } = useQuery<WdfSubscription[]>({
    queryKey: ['/api/pos/wdf/subscriptions', customerId],
    enabled: !!customerId || !!laundromatId,
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async (plan: SubscriptionPlan) => {
      return apiRequest('/api/pos/wdf/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          customerId,
          laundromatId,
          planName: plan.name,
          planType: plan.type,
          poundAllocation: plan.poundAllocation,
          subscriptionPrice: plan.price,
          overageRate: plan.overageRate,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pos/wdf/subscriptions'] });
      setShowNewPlanDialog(false);
      toast({ title: "Subscription Created", description: "The subscription plan has been activated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create subscription.", variant: "destructive" });
    },
  });

  const pauseSubscriptionMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return apiRequest(`/api/pos/wdf/subscriptions/${id}/pause`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pos/wdf/subscriptions'] });
      setShowPauseDialog(false);
      setSelectedSubscription(null);
      toast({ title: "Subscription Paused", description: "The subscription has been paused." });
    },
  });

  const resumeSubscriptionMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/pos/wdf/subscriptions/${id}/resume`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pos/wdf/subscriptions'] });
      toast({ title: "Subscription Resumed", description: "The subscription is now active." });
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/pos/wdf/subscriptions/${id}/cancel`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pos/wdf/subscriptions'] });
      toast({ title: "Subscription Cancelled", description: "The subscription has been cancelled." });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</Badge>;
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Paused</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">Cancelled</Badge>;
      case "past_due":
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Past Due</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6" data-testid="wdf-subscription-manager">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Wash & Fold Subscriptions</h3>
          <p className="text-sm text-muted-foreground">Manage pound-based subscription plans</p>
        </div>
        <Button 
          onClick={() => setShowNewPlanDialog(true)}
          className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
          data-testid="button-new-subscription"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Subscription
        </Button>
      </div>

      {subscriptions.length === 0 ? (
        <Card className="bg-card border shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="font-semibold mb-2">No Active Subscriptions</h4>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
              Create a subscription plan to get recurring wash & fold service with pound allocations and savings.
            </p>
            <Button 
              onClick={() => setShowNewPlanDialog(true)}
              data-testid="button-create-first-subscription"
            >
              Create Subscription
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((subscription) => {
            const usagePercent = (parseFloat(String(subscription.usedPounds)) / subscription.poundAllocation) * 100;
            const availablePounds = subscription.poundAllocation - parseFloat(String(subscription.usedPounds)) + parseFloat(String(subscription.rolloverPounds));
            const daysRemaining = Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            
            return (
              <Card 
                key={subscription.id} 
                className="bg-card border shadow-sm overflow-hidden"
                data-testid={`subscription-card-${subscription.id}`}
              >
                <div className={`h-1 ${subscription.status === 'active' ? 'bg-green-500' : subscription.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-400'}`} />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold text-lg">{subscription.planName}</h4>
                        {getStatusBadge(subscription.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {subscription.planType === 'weekly' ? 'Weekly' : 'Monthly'} • {formatCurrency(subscription.subscriptionPrice)}/{subscription.planType === 'weekly' ? 'week' : 'month'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#C8A661]">
                        {availablePounds.toFixed(1)} lbs
                      </div>
                      <p className="text-xs text-muted-foreground">available</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Usage This Period</span>
                        <span className="font-medium">
                          {parseFloat(String(subscription.usedPounds)).toFixed(1)} / {subscription.poundAllocation} lbs
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(100, usagePercent)} 
                        className={`h-2 ${usagePercent > 90 ? '[&>div]:bg-orange-500' : usagePercent > 100 ? '[&>div]:bg-red-500' : ''}`}
                      />
                      {usagePercent > 100 && (
                        <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Overage: {(parseFloat(String(subscription.usedPounds)) - subscription.poundAllocation).toFixed(1)} lbs @ {formatCurrency(subscription.overageRate)}/lb
                        </p>
                      )}
                    </div>

                    {parseFloat(String(subscription.rolloverPounds)) > 0 && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <RefreshCw className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-700 dark:text-blue-400">
                          {parseFloat(String(subscription.rolloverPounds)).toFixed(1)} lbs rolled over from last period
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg">
                      <div className="text-center">
                        <Calendar className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">Period Ends</p>
                        <p className="text-sm font-medium">{formatDate(subscription.currentPeriodEnd)}</p>
                      </div>
                      <div className="text-center">
                        <Clock className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">Days Left</p>
                        <p className="text-sm font-medium">{daysRemaining} days</p>
                      </div>
                      <div className="text-center">
                        <DollarSign className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">Overage Rate</p>
                        <p className="text-sm font-medium">{formatCurrency(subscription.overageRate)}/lb</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex gap-2">
                      {subscription.status === 'active' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSubscription(subscription);
                              setShowPauseDialog(true);
                            }}
                            data-testid={`button-pause-${subscription.id}`}
                          >
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              if (confirm('Are you sure you want to cancel this subscription?')) {
                                cancelSubscriptionMutation.mutate(subscription.id);
                              }
                            }}
                            data-testid={`button-cancel-${subscription.id}`}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {subscription.status === 'paused' && (
                        <Button
                          size="sm"
                          onClick={() => resumeSubscriptionMutation.mutate(subscription.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          data-testid={`button-resume-${subscription.id}`}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Resume
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showNewPlanDialog} onOpenChange={setShowNewPlanDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose a Subscription Plan</DialogTitle>
            <DialogDescription>
              Select a plan that fits your laundry needs. All plans include pickup & delivery.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover-elevate ${
                  plan.popular ? 'border-[#C8A661] bg-[#C8A661]/5' : 'border-border'
                }`}
                onClick={() => createSubscriptionMutation.mutate(plan)}
                data-testid={`plan-option-${plan.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                      <Scale className="h-5 w-5 text-[#C8A661]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{plan.name}</h4>
                        {plan.popular && (
                          <Badge className="bg-[#C8A661] text-[#0A1628]">Popular</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {plan.poundAllocation === 999 ? 'Unlimited' : `${plan.poundAllocation} lbs`} / {plan.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">{formatCurrency(plan.price)}</div>
                    <p className="text-xs text-muted-foreground">per {plan.type === 'weekly' ? 'week' : 'month'}</p>
                    <p className="text-xs text-muted-foreground">
                      Overage: {formatCurrency(plan.overageRate)}/lb
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pause Subscription</DialogTitle>
            <DialogDescription>
              Your subscription will be paused. You can resume it at any time.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="pause-reason">Reason for pausing (optional)</Label>
            <Select value={pauseReason} onValueChange={setPauseReason}>
              <SelectTrigger data-testid="select-pause-reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacation">Going on vacation</SelectItem>
                <SelectItem value="moving">Moving to new location</SelectItem>
                <SelectItem value="financial">Financial reasons</SelectItem>
                <SelectItem value="not_using">Not using enough</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPauseDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedSubscription) {
                  pauseSubscriptionMutation.mutate({ id: selectedSubscription.id, reason: pauseReason });
                }
              }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
              data-testid="button-confirm-pause"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
