import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  CreditCard,
  Download,
  ExternalLink,
  Loader2,
  Receipt,
  TrendingUp,
  Zap,
  Crown,
  Database,
  Activity,
  BarChart3,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  pdfUrl: string;
}

interface UsageData {
  apiCalls: { used: number; limit: number };
  storage: { used: number; limit: number };
  cleanbiAnalyses: { used: number; limit: number };
}

interface BillingProps {
  user: any;
}

export default function BillingPaymentsTab({ user }: BillingProps) {
  const { toast } = useToast();

  // Fetch real invoices from Stripe
  const { data: invoiceData, isLoading: invoicesLoading } = useQuery<{
    invoices: Invoice[];
    hasStripeCustomer: boolean;
  }>({
    queryKey: ["/api/subscriptions/invoices"],
    enabled: !!user,
  });

  const invoices = invoiceData?.invoices || [];
  const hasStripeCustomer = invoiceData?.hasStripeCustomer || false;

  const usage: UsageData = {
    apiCalls: { used: 12450, limit: 50000 },
    storage: { used: 2.4, limit: 50 },
    cleanbiAnalyses: { used: 45, limit: 100 },
  };

  const tiers = [
    {
      name: "Accelerate",
      price: 249,
      priceId: "price_accelerate_monthly",
      icon: Zap,
      features: ["1 Location", "500 transactions/mo", "2 users", "5GB storage"],
    },
    {
      name: "Scale",
      price: 499,
      priceId: "price_scale_monthly",
      icon: TrendingUp,
      popular: true,
      features: ["5 Locations", "Unlimited transactions", "10 users", "50GB storage"],
    },
    {
      name: "Summit",
      price: 899,
      priceId: "price_summit_monthly",
      icon: Crown,
      features: ["Unlimited locations", "Unlimited everything", "White-label", "Dedicated support"],
    },
  ];

  const currentTier = user?.subscriptionTier || "free";

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

  const upgradeMutation = useMutation({
    mutationFn: async (priceId: string) => {
      const res = await apiRequest("POST", "/api/subscriptions/upgrade", { priceId });
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
        description: error.message || "Failed to initiate upgrade",
        variant: "destructive",
      });
    },
  });

  const formatBytes = (gb: number) => {
    return `${gb.toFixed(1)} GB`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-[#C8A661]" />
              </div>
              Payment Method
            </CardTitle>
            <CardDescription>Manage your payment methods and billing details</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {user?.stripeCustomerId ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/25</p>
                  </div>
                </div>
                <Badge variant="secondary">Default</Badge>
              </div>
              <Button
                variant="outline"
                onClick={() => billingPortalMutation.mutate()}
                disabled={billingPortalMutation.isPending}
                data-testid="button-update-payment"
              >
                {billingPortalMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CreditCard className="w-4 h-4 mr-2" />
                )}
                Update Payment Method
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No payment method on file</p>
              <p className="text-sm">Add a payment method when you upgrade</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Invoice History
          </CardTitle>
          <CardDescription>View and download past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading invoices...</p>
            </div>
          ) : invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                  data-testid={`invoice-row-${invoice.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">${invoice.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={invoice.status === "paid" ? "default" : invoice.status === "pending" ? "secondary" : "destructive"}
                      className={invoice.status === "paid" ? "bg-green-600" : ""}
                    >
                      {invoice.status === "paid" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {invoice.status === "failed" && <AlertCircle className="w-3 h-3 mr-1" />}
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                    {invoice.pdfUrl && invoice.pdfUrl !== "#" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(invoice.pdfUrl, "_blank")}
                        data-testid={`button-download-invoice-${invoice.id}`}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No invoices yet</p>
              <p className="text-sm mt-1">Invoices will appear here after you subscribe</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Usage This Month
          </CardTitle>
          <CardDescription>Track your resource consumption</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span>API Calls</span>
                </div>
                <span className="text-muted-foreground">
                  {formatNumber(usage.apiCalls.used)} / {formatNumber(usage.apiCalls.limit)}
                </span>
              </div>
              <Progress
                value={(usage.apiCalls.used / usage.apiCalls.limit) * 100}
                className="h-2"
                data-testid="progress-api-calls"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-muted-foreground" />
                  <span>Storage</span>
                </div>
                <span className="text-muted-foreground">
                  {formatBytes(usage.storage.used)} / {formatBytes(usage.storage.limit)}
                </span>
              </div>
              <Progress
                value={(usage.storage.used / usage.storage.limit) * 100}
                className="h-2"
                data-testid="progress-storage"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  <span>CLEANBI Analyses</span>
                </div>
                <span className="text-muted-foreground">
                  {usage.cleanbiAnalyses.used} / {usage.cleanbiAnalyses.limit}
                </span>
              </div>
              <Progress
                value={(usage.cleanbiAnalyses.used / usage.cleanbiAnalyses.limit) * 100}
                className="h-2"
                data-testid="progress-cleanbi"
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Need more resources?</p>
              <p className="text-sm text-muted-foreground">Upgrade your plan for higher limits</p>
            </div>
            <Button variant="outline" size="sm" data-testid="button-view-plans">
              View Plans
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Plan</CardTitle>
          <CardDescription>Upgrade or downgrade your subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {tiers.map((tier) => {
              const isCurrent = tier.name.toLowerCase() === currentTier.toLowerCase();
              const TierIcon = tier.icon;
              
              return (
                <div
                  key={tier.name}
                  className={`relative p-4 border rounded-lg ${isCurrent ? "border-[#C8A661] bg-[#C8A661]/5" : ""}`}
                  data-testid={`plan-option-${tier.name.toLowerCase()}`}
                >
                  {tier.popular && !isCurrent && (
                    <Badge className="absolute -top-2 left-4 bg-[#C8A661] text-[#0A1628]">
                      Popular
                    </Badge>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <TierIcon className="w-5 h-5 text-[#C8A661]" />
                    <h3 className="font-semibold">{tier.name}</h3>
                  </div>
                  <p className="text-2xl font-bold mb-3">
                    ${tier.price}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </p>
                  <ul className="text-sm space-y-1 mb-4">
                    {tier.features.slice(0, 2).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={isCurrent ? "secondary" : "outline"}
                    size="sm"
                    className="w-full"
                    disabled={isCurrent || upgradeMutation.isPending}
                    onClick={() => upgradeMutation.mutate(tier.priceId)}
                    data-testid={`button-select-${tier.name.toLowerCase()}`}
                  >
                    {isCurrent ? "Current Plan" : "Select"}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
