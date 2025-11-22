import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, TrendingUp, DollarSign, Users, BarChart3, Calendar, MapPin, Target, Zap } from 'lucide-react';
import { SEO } from '@/components/SEO';

// Bloomberg-style broker analytics dashboard
const REVENUE_DATA = [
  { month: 'Jan', revenue: 45000, listings: 12, sales: 3 },
  { month: 'Feb', revenue: 52000, listings: 15, sales: 4 },
  { month: 'Mar', revenue: 48000, listings: 14, sales: 3 },
  { month: 'Apr', revenue: 61000, listings: 18, sales: 5 },
  { month: 'May', revenue: 55000, listings: 16, sales: 4 },
  { month: 'Jun', revenue: 72000, listings: 20, sales: 6 },
];

const LISTING_PERFORMANCE = [
  { name: '$300K-$500K', value: 35, color: '#3b82f6' },
  { name: '$500K-$800K', value: 45, color: '#8b5cf6' },
  { name: '$800K+', value: 20, color: '#ec4899' },
];

const TOP_METRICS = [
  { label: 'Total Sales', value: '$1.2M', icon: DollarSign, trend: '+23%' },
  { label: 'Active Listings', value: '24', icon: Building2, trend: '+4' },
  { label: 'Lead Quality', value: '92%', icon: Target, trend: '+8%' },
  { label: 'Conversion Rate', value: '18%', icon: Zap, trend: '+2%' },
];

export default function BrokerDashboardPro() {
  const [timeRange, setTimeRange] = useState('6m');

  return (
    <>
      <SEO
        title="Broker Dashboard | Advanced Analytics | WashBizHub"
        description="Bloomberg-grade broker dashboard with real-time analytics, revenue tracking, listing performance, and lead management."
        canonicalUrl="/broker-pro"
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-12 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-8 h-8" />
                  <h1 className="text-4xl font-bold">Broker Analytics</h1>
                </div>
                <p className="text-slate-300">Real-time performance tracking & lead management</p>
              </div>
              <div className="flex gap-2">
                <Button variant={timeRange === '1m' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('1m')}>
                  1M
                </Button>
                <Button variant={timeRange === '3m' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('3m')}>
                  3M
                </Button>
                <Button variant={timeRange === '6m' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('6m')}>
                  6M
                </Button>
                <Button variant={timeRange === '1y' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('1y')}>
                  1Y
                </Button>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid md:grid-cols-4 gap-4">
              {TOP_METRICS.map(metric => (
                <div key={metric.label} className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">{metric.label}</span>
                    <metric.icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{metric.value}</div>
                  <div className="text-xs text-green-400 mt-1">{metric.trend} vs last period</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Revenue & Listings */}
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2" data-testid="card-revenue-chart">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Total sales revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={REVENUE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card data-testid="card-listing-distribution">
              <CardHeader>
                <CardTitle>Listing Price Distribution</CardTitle>
                <CardDescription>By price range</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={LISTING_PERFORMANCE} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {LISTING_PERFORMANCE.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Listing Management & Performance */}
          <Tabs defaultValue="listings" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="listings">Active Listings (24)</TabsTrigger>
              <TabsTrigger value="leads">Hot Leads (8)</TabsTrigger>
              <TabsTrigger value="closed">Closed Deals (12)</TabsTrigger>
            </TabsList>

            <TabsContent value="listings" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex-1">
                          <h4 className="font-semibold">Premium Northeast Philadelphia Laundromat</h4>
                          <p className="text-sm text-muted-foreground">$450K • 32 machines • 89 CLEANBI</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">24 days</div>
                          <p className="text-sm text-muted-foreground">1,248 views</p>
                        </div>
                        <Button variant="outline" size="sm" className="ml-4">
                          Manage
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leads" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    8 qualified leads • Average response time: 2.3 hours
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="closed" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-green-600">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                    12 successful sales • Total value: $5.2M
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Performance Metrics */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card data-testid="card-metric-daysonsell">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Days on Market</CardTitle>
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">18 days</div>
                <p className="text-xs text-muted-foreground">3 days faster than market average</p>
              </CardContent>
            </Card>

            <Card data-testid="card-metric-conversion">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Target className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">18%</div>
                <p className="text-xs text-muted-foreground">Industry avg: 12%</p>
              </CardContent>
            </Card>

            <Card data-testid="card-metric-repeat">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Repeat Buyers</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">34%</div>
                <p className="text-xs text-muted-foreground">Of your closed deals</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
