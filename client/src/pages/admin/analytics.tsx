import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, Users, DollarSign, Eye, BarChart3, Download, 
  ShoppingCart, CreditCard, ArrowUpRight, ArrowDownRight,
  Globe, Activity, Clock, Zap, Target, PieChart, RefreshCw
} from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  StatCard, MetricCard, DonutChart, MiniBarChart, ProgressBar,
  DashboardGrid, SectionHeader, Gauge
} from "@/components/dashboard/DashboardComponents";

export default function AdminAnalytics() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stats, refetch, isFetching } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: isAuthenticated && user?.isAdmin,
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    setLocation('/');
    return null;
  }

  const revenueData = [
    { label: 'Jan', value: 12500 },
    { label: 'Feb', value: 15800 },
    { label: 'Mar', value: 18200 },
    { label: 'Apr', value: 22100 },
    { label: 'May', value: 19800 },
    { label: 'Jun', value: 25400 },
    { label: 'Jul', value: 28900 },
  ];

  const subscriptionData = [
    { label: 'Free', value: 2450, color: '#6b7280' },
    { label: 'Starter', value: 890, color: '#10b981' },
    { label: 'Pro', value: 420, color: '#3b82f6' },
    { label: 'Enterprise', value: 85, color: '#8b5cf6' },
  ];

  const trafficSourceData = [
    { label: 'Organic Search', value: 45, color: '#10b981' },
    { label: 'Direct', value: 25, color: '#3b82f6' },
    { label: 'Referral', value: 15, color: '#f59e0b' },
    { label: 'Social', value: 10, color: '#ec4899' },
    { label: 'Paid', value: 5, color: '#8b5cf6' },
  ];

  const topPages = [
    { name: 'CLEANBI Calculator', views: 12840, change: 24.5 },
    { name: 'Laundromat Valuation', views: 8920, change: 18.2 },
    { name: 'ROI Calculator', views: 7650, change: 12.8 },
    { name: 'Business Plan Templates', views: 5430, change: -3.2 },
    { name: 'Due Diligence Guide', views: 4210, change: 8.7 },
  ];

  const recentTransactions = [
    { id: 1, type: 'Pro Subscription', amount: 97, user: 'john@example.com', status: 'completed' },
    { id: 2, type: 'CLEANBI Report', amount: 97, user: 'sarah@laundry.co', status: 'completed' },
    { id: 3, type: 'Enterprise Plan', amount: 297, user: 'mike@enterprise.com', status: 'pending' },
    { id: 4, type: 'Starter Plan', amount: 47, user: 'anna@startup.io', status: 'completed' },
    { id: 5, type: 'CLEANBI Report', amount: 97, user: 'david@invest.com', status: 'completed' },
  ];

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
                <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
                <p className="text-indigo-200">Platform metrics and business insights</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <DashboardGrid cols={4}>
            <StatCard
              title="Total Revenue"
              value={`$${(stats?.revenue || 142890).toLocaleString()}`}
              subtitle="+20.1% from last month"
              icon={DollarSign}
              variant="green"
              trend={{ value: 20.1, isPositive: true }}
            />
            <StatCard
              title="Active Users"
              value={(stats?.activeUsers || 3845).toLocaleString()}
              subtitle="+180 this week"
              icon={Users}
              variant="blue"
              trend={{ value: 12.4, isPositive: true }}
            />
            <StatCard
              title="Page Views"
              value={`${((stats?.pageViews || 124500) / 1000).toFixed(1)}K`}
              subtitle="This month"
              icon={Eye}
              variant="purple"
              trend={{ value: 8.2, isPositive: true }}
            />
            <StatCard
              title="Conversion Rate"
              value={`${stats?.conversionRate || 4.8}%`}
              subtitle="Free to Pro"
              icon={TrendingUp}
              variant="pink"
              trend={{ value: 1.2, isPositive: true }}
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
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Revenue Trend</CardTitle>
              <Badge variant="secondary">Last 7 Months</Badge>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <MiniBarChart data={revenueData} height={260} showLabels={true} color="#10b981" />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">$142.7K</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Monthly</p>
                  <p className="text-2xl font-bold">$20.4K</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Growth Rate</p>
                  <p className="text-2xl font-bold text-green-500">+18.2%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart
                data={subscriptionData}
                size={160}
                thickness={24}
                centerValue={subscriptionData.reduce((a, b) => a + b.value, 0).toLocaleString()}
                centerLabel="Total"
                showLegend={true}
              />
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">MRR</span>
                  <span className="font-bold">$47,890</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Churn Rate</span>
                  <span className="font-bold text-amber-500">2.3%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Traffic & Performance Row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Traffic Sources */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                Traffic Sources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {trafficSourceData.map((source, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{source.label}</span>
                    <span className="font-semibold">{source.value}%</span>
                  </div>
                  <ProgressBar value={source.value} color={source.color.replace('#', '')} size="sm" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Pages */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-500" />
                Top Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPages.map((page, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {i + 1}
                      </div>
                      <span className="font-medium">{page.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">{page.views.toLocaleString()} views</span>
                      <Badge variant={page.change >= 0 ? "default" : "destructive"} className="min-w-[60px] justify-center">
                        {page.change >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {Math.abs(page.change)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metrics & Transactions Row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Key Metrics */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                Key Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Gauge value={78} maxValue={100} label="Health Score" size="lg" color="green" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <MetricCard
                  label="Avg Session"
                  value="4m 32s"
                  icon={Clock}
                  iconColor="#f59e0b"
                />
                <MetricCard
                  label="Bounce Rate"
                  value="32.4%"
                  icon={Zap}
                  iconColor="#ef4444"
                />
                <MetricCard
                  label="Downloads"
                  value="2,847"
                  icon={Download}
                  iconColor="#8b5cf6"
                />
                <MetricCard
                  label="Reports"
                  value="1,245"
                  icon={PieChart}
                  iconColor="#ec4899"
                />
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-500" />
                Recent Transactions
              </CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.status === 'completed' ? 'bg-green-500/10' : 'bg-amber-500/10'
                      }`}>
                        <ShoppingCart className={`w-5 h-5 ${
                          tx.status === 'completed' ? 'text-green-500' : 'text-amber-500'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{tx.type}</p>
                        <p className="text-sm text-muted-foreground">{tx.user}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${tx.amount}</p>
                      <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Download className="w-5 h-5" />
                <span>Export Reports</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Users className="w-5 h-5" />
                <span>Manage Users</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <DollarSign className="w-5 h-5" />
                <span>View Payments</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <BarChart3 className="w-5 h-5" />
                <span>SEO Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
