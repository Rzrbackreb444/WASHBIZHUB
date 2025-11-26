import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calculator, 
  LayoutDashboard, 
  FileText, 
  ClipboardList, 
  ShoppingCart,
  Star,
  Users,
  TrendingUp,
  Sparkles,
  DollarSign,
  BarChart3,
  Building2,
  Zap,
  Bot,
  Globe,
  CreditCard,
  Truck,
  Wrench,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Plus,
  Settings,
  Bell,
  Calendar,
  MapPin,
  Clock,
  Activity,
  Target,
  PieChart,
  LineChart,
  Wallet,
  Receipt,
  Package,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  MoreHorizontal
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Quick action cards for the dashboard
const QUICK_ACTIONS = [
  {
    id: 'wdf-calc',
    title: 'WDF Calculator',
    description: 'Calculate wash-dry-fold pricing',
    icon: Sparkles,
    color: '#00A699',
    href: '/calculators/wdf',
  },
  {
    id: 'pud-calc',
    title: 'PUD Calculator',
    description: 'Pickup & delivery routing',
    icon: Truck,
    color: '#F59E0B',
    href: '/calculators/pud',
  },
  {
    id: 'valuation',
    title: 'Valuation Tool',
    description: 'Value your business',
    icon: Building2,
    color: '#8B5CF6',
    href: '/calculators/valuation',
  },
  {
    id: 'cleanbi',
    title: 'CLEANBI™ Score',
    description: 'Score any location',
    icon: Zap,
    color: '#3B82F6',
    href: '/cleanbi',
  },
  {
    id: 'service-ai',
    title: 'Service Guy AI',
    description: 'Equipment diagnostics',
    icon: Wrench,
    color: '#EF4444',
    href: '/service-guy-ai',
  },
  {
    id: 'competition',
    title: 'Competition Intel',
    description: 'Analyze competitors',
    icon: Target,
    color: '#EC4899',
    href: '/competition-intelligence',
  },
];

// Dashboard modules
const DASHBOARD_MODULES = [
  {
    id: 'calculators',
    title: 'Calculators',
    description: 'Business calculators & financial tools',
    icon: Calculator,
    color: '#00A699',
    href: '/calculator-marketplace',
    count: 8,
  },
  {
    id: 'dashboards',
    title: 'Dashboards',
    description: 'Analytics & reporting',
    icon: LayoutDashboard,
    color: '#F59E0B',
    href: '/calculator-marketplace?category=dashboards',
    count: 4,
  },
  {
    id: 'templates',
    title: 'Templates',
    description: 'Business document templates',
    icon: FileText,
    color: '#8B5CF6',
    href: '/templates',
    count: 12,
  },
  {
    id: 'forms',
    title: 'Forms',
    description: 'Customer & operations forms',
    icon: ClipboardList,
    color: '#EC4899',
    href: '/calculator-marketplace?category=forms',
    count: 6,
  },
  {
    id: 'pos',
    title: 'POS System',
    description: 'Point-of-sale & payments',
    icon: CreditCard,
    color: '#10B981',
    href: '/pos',
    count: 1,
  },
  {
    id: 'website',
    title: 'Website',
    description: 'Build & manage your site',
    icon: Globe,
    color: '#EF4444',
    href: '/website-builder',
    count: 3,
  },
  {
    id: 'ai-agents',
    title: 'AI Agents',
    description: 'Intelligent assistants',
    icon: Bot,
    color: '#3B82F6',
    href: '/calculator-marketplace?category=agents',
    count: 2,
  },
  {
    id: 'learning',
    title: 'Learning',
    description: 'Courses & education',
    icon: BookOpen,
    color: '#6366F1',
    href: '/courses',
    count: 15,
  },
];

function QuickStatCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color,
  suffix 
}: { 
  title: string; 
  value: string | number; 
  change?: string; 
  icon: any; 
  color: string;
  suffix?: string;
}) {
  const isPositive = change?.startsWith('+');
  
  return (
    <Card className="relative overflow-hidden">
      <div 
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"
        style={{ backgroundColor: color }}
      />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">
              {value}{suffix}
            </p>
            {change && (
              <p className={`text-sm mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {change} from last month
              </p>
            )}
          </div>
          <div 
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="h-6 w-6" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ModuleCard({ module }: { module: typeof DASHBOARD_MODULES[0] }) {
  const [, setLocation] = useLocation();
  const Icon = module.icon;
  
  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 border-l-4"
      style={{ borderLeftColor: module.color }}
      onClick={() => setLocation(module.href)}
      data-testid={`card-module-${module.id}`}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <div 
          className="p-3 rounded-xl transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${module.color}15` }}
        >
          <Icon className="h-5 w-5" style={{ color: module.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold">{module.title}</h3>
          <p className="text-sm text-muted-foreground truncate">{module.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{module.count} tools</Badge>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionButton({ action }: { action: typeof QUICK_ACTIONS[0] }) {
  const [, setLocation] = useLocation();
  const Icon = action.icon;
  
  return (
    <Button
      variant="outline"
      className="h-auto p-4 flex flex-col items-center gap-2 min-w-[120px] hover:border-primary/50 transition-all group"
      onClick={() => setLocation(action.href)}
      data-testid={`button-quick-${action.id}`}
    >
      <div 
        className="p-2 rounded-lg transition-transform group-hover:scale-110"
        style={{ backgroundColor: `${action.color}15` }}
      >
        <Icon className="h-5 w-5" style={{ color: action.color }} />
      </div>
      <span className="font-medium text-sm">{action.title}</span>
    </Button>
  );
}

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Mock data for demo - in production these would come from API
  const businessStats = {
    monthlyRevenue: 45280,
    revenueChange: '+12.5%',
    activeCustomers: 1247,
    customerChange: '+8.3%',
    wdfOrders: 342,
    orderChange: '+15.2%',
    cleanbiScore: 87,
  };

  const recentActivity = [
    { id: 1, type: 'order', message: 'New WDF order from John D.', time: '5 min ago', icon: ShoppingCart },
    { id: 2, type: 'alert', message: 'Washer #3 needs maintenance check', time: '1 hour ago', icon: AlertCircle },
    { id: 3, type: 'customer', message: 'New customer signup: Sarah M.', time: '2 hours ago', icon: Users },
    { id: 4, type: 'payment', message: 'Payment received: $127.50', time: '3 hours ago', icon: DollarSign },
  ];

  return (
    <>
      <Helmet>
        <title>Owner Dashboard | WashBizHub</title>
        <meta name="description" content="Your complete business command center. Manage calculators, dashboards, POS, website, AI agents, and more from one place." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Here's what's happening with your business today.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" data-testid="button-notifications">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" data-testid="button-settings">
                <Settings className="h-5 w-5" />
              </Button>
              <Button className="gap-2" onClick={() => setLocation('/calculator-builder')}>
                <Plus className="h-4 w-4" />
                Create Tool
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickStatCard 
              title="Monthly Revenue"
              value={`$${businessStats.monthlyRevenue.toLocaleString()}`}
              change={businessStats.revenueChange}
              icon={DollarSign}
              color="#10B981"
            />
            <QuickStatCard 
              title="Active Customers"
              value={businessStats.activeCustomers.toLocaleString()}
              change={businessStats.customerChange}
              icon={Users}
              color="#3B82F6"
            />
            <QuickStatCard 
              title="WDF Orders (Month)"
              value={businessStats.wdfOrders}
              change={businessStats.orderChange}
              icon={Package}
              color="#F59E0B"
            />
            <QuickStatCard 
              title="CLEANBI™ Score"
              value={businessStats.cleanbiScore}
              suffix="/100"
              icon={Zap}
              color="#8B5CF6"
            />
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {QUICK_ACTIONS.map((action) => (
                  <QuickActionButton key={action.id} action={action} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Business Modules - 2 columns */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                  Your Business Tools
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1"
                  onClick={() => setLocation('/calculator-marketplace')}
                >
                  Browse All <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid gap-3">
                {DASHBOARD_MODULES.map((module) => (
                  <ModuleCard key={module.id} module={module} />
                ))}
              </div>
            </div>

            {/* Activity Feed - 1 column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Recent Activity
                </h2>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {recentActivity.map((activity) => {
                      const Icon = activity.icon;
                      return (
                        <div 
                          key={activity.id} 
                          className="p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <div className={`p-2 rounded-lg ${
                            activity.type === 'alert' ? 'bg-amber-500/10' :
                            activity.type === 'order' ? 'bg-green-500/10' :
                            activity.type === 'customer' ? 'bg-blue-500/10' :
                            'bg-purple-500/10'
                          }`}>
                            <Icon className={`h-4 w-4 ${
                              activity.type === 'alert' ? 'text-amber-500' :
                              activity.type === 'order' ? 'text-green-500' :
                              activity.type === 'customer' ? 'text-blue-500' :
                              'text-purple-500'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">{activity.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Business Health Score */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Business Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="relative inline-flex items-center justify-center">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="12"
                          className="text-muted"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="12"
                          strokeDasharray={`${(87 / 100) * 352} 352`}
                          strokeLinecap="round"
                          className="text-primary"
                        />
                      </svg>
                      <span className="absolute text-3xl font-bold">87</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Excellent Health Score</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Revenue Growth</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Customer Retention</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Equipment Status</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom CTA */}
          <Card className="bg-gradient-to-r from-primary/5 via-transparent to-primary/5 border-primary/20">
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">Build Your Custom Tools</h3>
                  <p className="text-sm text-muted-foreground">
                    Create calculators, dashboards, and more with our no-code builder
                  </p>
                </div>
              </div>
              <Button className="gap-2" onClick={() => setLocation('/calculator-builder')}>
                Open Builder <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
