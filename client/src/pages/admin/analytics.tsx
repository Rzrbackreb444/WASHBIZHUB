import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, Users, DollarSign, Eye, BarChart3, Download, 
  ShoppingCart, CreditCard, ArrowUpRight, ArrowDownRight,
  Globe, Activity, Clock, Zap, Target, PieChart, RefreshCw,
  UserPlus, MapPin, FileCheck, Tag
} from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  StatCard, MetricCard, DonutChart, MiniBarChart, ProgressBar,
  DashboardGrid, SectionHeader, Gauge
} from "@/components/dashboard/DashboardComponents";
import { formatDistanceToNow } from "date-fns";

export default function AdminAnalytics() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch comprehensive analytics data
  const { data: analytics, refetch, isFetching } = useQuery<{
    revenue: {
      total: number;
      mrr: number;
      thisMonth: number;
      lastMonth: number;
      changePercent: number;
      byProduct: { name: string; amount: number; count: number }[];
      monthlyTrend: { month: string; amount: number }[];
    };
    users: {
      total: number;
      newThisWeek: number;
      newThisMonth: number;
      activeThisMonth: number;
      growthPercent: number;
    };
    subscriptions: {
      free: number;
      starter: number;
      pro: number;
      enterprise: number;
      churnRate: number;
    };
    cleanbi: {
      totalAnalyses: number;
      thisMonth: number;
      uniqueUsers: number;
    };
    activity: {
      id: number;
      type: string;
      description: string;
      email: string | null;
      metadata: any;
      createdAt: string;
    }[];
    transactions: {
      id: string;
      type: string;
      amount: number;
      email: string;
      status: string;
      createdAt: string;
    }[];
  }>({
    queryKey: ['/api/admin/analytics'],
    enabled: isAuthenticated && user?.isAdmin,
  });

  // Handle redirect in useEffect
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.isAdmin)) {
      setLocation('/');
    }
  }, [authLoading, isAuthenticated, user?.isAdmin, setLocation]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return <div className="flex items-center justify-center h-screen">Redirecting...</div>;
  }

  // Build chart data from live analytics
  const revenueData = analytics?.revenue?.monthlyTrend?.map(m => ({
    label: m.month,
    value: m.amount
  })) || [];

  const subscriptionData = [
    { label: 'Free', value: analytics?.subscriptions?.free || 0, color: '#6b7280' },
    { label: 'Starter', value: analytics?.subscriptions?.starter || 0, color: '#10b981' },
    { label: 'Pro', value: analytics?.subscriptions?.pro || 0, color: '#3b82f6' },
    { label: 'Enterprise', value: analytics?.subscriptions?.enterprise || 0, color: '#8b5cf6' },
  ];

  const totalSubscribers = subscriptionData.reduce((a, b) => a + b.value, 0);
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup': return UserPlus;
      case 'cleanbi_analysis': return MapPin;
      case 'purchase': return ShoppingCart;
      case 'subscription': return CreditCard;
      case 'promo_redemption': return Tag;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_signup': return 'text-blue-500 bg-blue-500/10';
      case 'cleanbi_analysis': return 'text-green-500 bg-green-500/10';
      case 'purchase': return 'text-purple-500 bg-purple-500/10';
      case 'subscription': return 'text-indigo-500 bg-indigo-500/10';
      case 'promo_redemption': return 'text-amber-500 bg-amber-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <Breadcrumb items={[
            { name: "Admin", url: "/admin" },
            { name: "Analytics", url: "/admin/analytics" }
          ]} />
        </div>
      </div>

      {/* Dashboard Header */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-900/20 to-slate-900 border-b">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/20 rounded-xl">
                <BarChart3 className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Live Analytics Dashboard</h1>
                <p className="text-indigo-200">Real-time metrics from Stripe & database</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="border-white/20 text-white hover:bg-white/10"
              data-testid="button-refresh-analytics"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Loading...' : 'Refresh'}
            </Button>
          </div>

          <DashboardGrid cols={4}>
            <StatCard
              title="Total Revenue"
              value={isFetching ? "..." : analytics?.revenue?.total ? `$${analytics.revenue.total.toLocaleString()}` : "$0"}
              subtitle={analytics?.revenue?.changePercent ? `${analytics.revenue.changePercent > 0 ? '+' : ''}${analytics.revenue.changePercent.toFixed(1)}% from last month` : "All time"}
              icon={DollarSign}
              variant="green"
              trend={analytics?.revenue?.changePercent ? { value: analytics.revenue.changePercent, isPositive: analytics.revenue.changePercent > 0 } : undefined}
            />
            <StatCard
              title="Total Users"
              value={isFetching ? "..." : analytics?.users?.total?.toLocaleString() ?? "0"}
              subtitle={analytics?.users?.newThisWeek ? `+${analytics.users.newThisWeek} this week` : "Registered users"}
              icon={Users}
              variant="blue"
              trend={analytics?.users?.growthPercent ? { value: analytics.users.growthPercent, isPositive: analytics.users.growthPercent > 0 } : undefined}
            />
            <StatCard
              title="CLEANBI Analyses"
              value={isFetching ? "..." : analytics?.cleanbi?.totalAnalyses?.toLocaleString() ?? "0"}
              subtitle={analytics?.cleanbi?.thisMonth ? `${analytics.cleanbi.thisMonth} this month` : "Total runs"}
              icon={MapPin}
              variant="purple"
            />
            <StatCard
              title="Monthly Revenue"
              value={isFetching ? "..." : analytics?.revenue?.mrr ? `$${analytics.revenue.mrr.toLocaleString()}` : "$0"}
              subtitle="MRR from subscriptions"
              icon={TrendingUp}
              variant="pink"
            />
          </DashboardGrid>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Revenue & Subscriptions Row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Trend Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-lg font-semibold">Revenue Trend</CardTitle>
              <Badge variant="secondary">Live from Stripe</Badge>
            </CardHeader>
            <CardContent>
              {revenueData.length > 0 ? (
                <div className="h-[280px]">
                  <MiniBarChart data={revenueData} height={260} showLabels={true} color="#10b981" />
                </div>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                  {isFetching ? 'Loading revenue data...' : 'No revenue data yet'}
                </div>
              )}
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold" data-testid="text-total-revenue">
                    ${(analytics?.revenue?.total || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold" data-testid="text-this-month-revenue">
                    ${(analytics?.revenue?.thisMonth || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Growth Rate</p>
                  <p className={`text-2xl font-bold ${(analytics?.revenue?.changePercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(analytics?.revenue?.changePercent || 0) >= 0 ? '+' : ''}{(analytics?.revenue?.changePercent || 0).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Subscriptions by Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart
                data={subscriptionData}
                size={160}
                thickness={24}
                centerValue={totalSubscribers.toLocaleString()}
                centerLabel="Total"
                showLegend={true}
              />
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">MRR</span>
                  <span className="font-bold" data-testid="text-mrr">
                    ${(analytics?.revenue?.mrr || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Churn Rate</span>
                  <span className="font-bold text-amber-500">
                    {(analytics?.subscriptions?.churnRate || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity & Products Row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activity Feed */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-500" />
                Live Activity Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {analytics?.activity && analytics.activity.length > 0 ? (
                  analytics.activity.map((item) => {
                    const IconComponent = getActivityIcon(item.type);
                    const colorClass = getActivityColor(item.type);
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium">{item.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.email || 'Anonymous'} • {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    {isFetching ? 'Loading activity...' : 'No recent activity'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Product */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                Revenue by Product
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics?.revenue?.byProduct && analytics.revenue.byProduct.length > 0 ? (
                analytics.revenue.byProduct.map((product, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{product.name}</span>
                      <span className="font-bold">${product.amount.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{product.count} sales</p>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  {isFetching ? 'Loading...' : 'No product data yet'}
                </div>
              )}
              
              {/* CLEANBI Stats */}
              <div className="pt-4 border-t mt-4">
                <h4 className="font-semibold mb-3">CLEANBI Usage</h4>
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard
                    label="Total Analyses"
                    value={(analytics?.cleanbi?.totalAnalyses || 0).toLocaleString()}
                    icon={MapPin}
                    iconColor="#22c55e"
                  />
                  <MetricCard
                    label="Unique Users"
                    value={(analytics?.cleanbi?.uniqueUsers || 0).toLocaleString()}
                    icon={Users}
                    iconColor="#3b82f6"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-500" />
              Recent Transactions (Live from Stripe)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.transactions && analytics.transactions.length > 0 ? (
                analytics.transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.status === 'paid' || tx.status === 'complete' ? 'bg-green-500/10' : 'bg-amber-500/10'
                      }`}>
                        <ShoppingCart className={`w-5 h-5 ${
                          tx.status === 'paid' || tx.status === 'complete' ? 'text-green-500' : 'text-amber-500'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{tx.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {tx.email} • {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${(tx.amount / 100).toFixed(2)}</p>
                      <Badge variant={tx.status === 'paid' || tx.status === 'complete' ? 'default' : 'secondary'} className="text-xs">
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  {isFetching ? 'Loading transactions...' : 'No recent transactions'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/admin/users">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 w-full">
                  <Users className="w-5 h-5" />
                  <span>Manage Users</span>
                </Button>
              </a>
              <a href="/admin/promo-codes">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 w-full">
                  <Tag className="w-5 h-5" />
                  <span>Promo Codes</span>
                </Button>
              </a>
              <a href="/admin/ads">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 w-full">
                  <DollarSign className="w-5 h-5" />
                  <span>Ad Invoices</span>
                </Button>
              </a>
              <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 w-full">
                  <BarChart3 className="w-5 h-5" />
                  <span>Stripe Dashboard</span>
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
