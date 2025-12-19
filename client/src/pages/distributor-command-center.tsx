import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Building2, 
  Cpu, 
  Package, 
  Wrench, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Phone,
  Users,
  MapPin,
  BarChart3,
  Zap,
  Activity,
  DollarSign,
  Truck,
  Settings,
  RefreshCw,
  ChevronRight,
  Filter,
  Search,
  Bell,
  Headphones
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockFleetData = {
  totalMachines: 847,
  online: 812,
  offline: 18,
  maintenance: 17,
  brands: [
    { name: "Dexter", count: 423, online: 415 },
    { name: "Speed Queen", count: 198, online: 189 },
    { name: "Continental", count: 156, online: 148 },
    { name: "Huebsch", count: 70, online: 60 }
  ],
  customers: 142,
  serviceTickets: 23,
  partsOrders: 8
};

const mockAlerts = [
  { id: 1, type: "critical", machine: "DX-4500-W42", customer: "Clean City Laundry", message: "Motor overheating - immediate attention required", time: "2 min ago" },
  { id: 2, type: "warning", machine: "SQ-3200-D18", customer: "Fresh Wash Express", message: "Belt tension below threshold", time: "15 min ago" },
  { id: 3, type: "info", machine: "CN-2800-W22", customer: "Downtown Suds", message: "Scheduled maintenance due in 3 days", time: "1 hr ago" },
  { id: 4, type: "warning", machine: "HB-1800-D05", customer: "Quick Clean Center", message: "Water inlet valve showing degradation", time: "2 hrs ago" }
];

const mockRecentCalls = [
  { id: 1, caller: "Mike's Laundromat", issue: "Washer not draining", status: "scheduled", tech: "John D.", time: "10:30 AM" },
  { id: 2, caller: "Campus Wash Co", issue: "Card reader error", status: "dispatched", tech: "Sarah M.", time: "9:45 AM" },
  { id: 3, caller: "Green Clean LLC", issue: "Dryer overheating", status: "completed", tech: "Tom B.", time: "Yesterday" }
];

const mockPartsRecommendations = [
  { part: "Drive Belt #DB-450", machine: "DX-4500 Series", reason: "Predictive: 847 cycles remaining", urgency: "medium", customers: 12 },
  { part: "Water Valve Assembly", machine: "SQ-3200 Series", reason: "Failure pattern detected", urgency: "high", customers: 3 },
  { part: "Control Board Module", machine: "CN-2800 Series", reason: "End of life cycle", urgency: "low", customers: 8 }
];

export default function DistributorCommandCenter() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <Helmet>
        <title>Distributor Command Center | Fleet AI | WashBizHub</title>
        <meta 
          name="description" 
          content="AI-powered fleet management for equipment distributors. Real-time monitoring, predictive maintenance, parts intelligence, and AI receptionist." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="max-w-[1600px] mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#C8A661]" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Distributor Command Center</h1>
                  <p className="text-sm text-muted-foreground">Fleet AI Operations Hub</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search machines, customers..." 
                    className="pl-9 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-fleet-search"
                  />
                </div>
                <Button variant="outline" size="icon" data-testid="button-notifications">
                  <Bell className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" data-testid="button-refresh">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 py-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <Card className="bg-card border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Cpu className="w-5 h-5 text-[#C8A661]" />
                  <Badge variant="secondary" className="text-xs">Live</Badge>
                </div>
                <div className="text-2xl font-bold text-foreground">{mockFleetData.totalMachines}</div>
                <div className="text-xs text-muted-foreground">Total Machines</div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  <span className="text-xs text-green-500 font-medium">
                    {Math.round((mockFleetData.online / mockFleetData.totalMachines) * 100)}%
                  </span>
                </div>
                <div className="text-2xl font-bold text-foreground">{mockFleetData.online}</div>
                <div className="text-xs text-muted-foreground">Online</div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-foreground">{mockFleetData.maintenance}</div>
                <div className="text-xs text-muted-foreground">Need Service</div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-foreground">{mockFleetData.customers}</div>
                <div className="text-xs text-muted-foreground">Customers</div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Wrench className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-foreground">{mockFleetData.serviceTickets}</div>
                <div className="text-xs text-muted-foreground">Open Tickets</div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Package className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-foreground">{mockFleetData.partsOrders}</div>
                <div className="text-xs text-muted-foreground">Parts Orders</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-background" data-testid="tab-overview">
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="fleet" className="data-[state=active]:bg-background" data-testid="tab-fleet">
                <Cpu className="w-4 h-4 mr-2" />
                Fleet Health
              </TabsTrigger>
              <TabsTrigger value="parts" className="data-[state=active]:bg-background" data-testid="tab-parts">
                <Package className="w-4 h-4 mr-2" />
                Parts Intelligence
              </TabsTrigger>
              <TabsTrigger value="receptionist" className="data-[state=active]:bg-background" data-testid="tab-receptionist">
                <Headphones className="w-4 h-4 mr-2" />
                AI Receptionist
              </TabsTrigger>
              <TabsTrigger value="dispatch" className="data-[state=active]:bg-background" data-testid="tab-dispatch">
                <Truck className="w-4 h-4 mr-2" />
                Dispatch
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Alerts */}
                <Card className="lg:col-span-2 bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-red-500" />
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Active Alerts
                      </CardTitle>
                      <Badge variant="destructive">{mockAlerts.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockAlerts.map((alert) => (
                      <div 
                        key={alert.id} 
                        className={`flex items-start gap-3 p-3 rounded-lg border ${
                          alert.type === 'critical' ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900' :
                          alert.type === 'warning' ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900' :
                          'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          alert.type === 'critical' ? 'bg-red-500' :
                          alert.type === 'warning' ? 'bg-amber-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-foreground">{alert.machine}</span>
                            <span className="text-xs text-muted-foreground">@ {alert.customer}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                          <span className="text-xs text-muted-foreground">{alert.time}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Brand Distribution */}
                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Fleet by Brand</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockFleetData.brands.map((brand) => (
                      <div key={brand.name} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">{brand.name}</span>
                          <span className="text-muted-foreground">{brand.count} machines</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(brand.online / brand.count) * 100} 
                            className="flex-1 h-2"
                          />
                          <span className="text-xs text-green-500 font-medium w-10 text-right">
                            {Math.round((brand.online / brand.count) * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Calls & Parts */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Calls */}
                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-blue-500" />
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Phone className="w-5 h-5 text-blue-500" />
                        Recent Service Calls
                      </CardTitle>
                      <Link href="#" onClick={() => setActiveTab("receptionist")}>
                        <Button variant="ghost" size="sm">
                          View All
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockRecentCalls.map((call) => (
                      <div key={call.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-foreground">{call.caller}</div>
                          <div className="text-xs text-muted-foreground">{call.issue}</div>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            call.status === 'completed' ? 'default' :
                            call.status === 'dispatched' ? 'secondary' : 'outline'
                          }>
                            {call.status}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">{call.tech}</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Parts Recommendations */}
                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-purple-500" />
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="w-5 h-5 text-purple-500" />
                        Parts Intelligence
                      </CardTitle>
                      <Link href="#" onClick={() => setActiveTab("parts")}>
                        <Button variant="ghost" size="sm">
                          View All
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockPartsRecommendations.map((part, i) => (
                      <div key={i} className="flex items-start justify-between p-3 rounded-lg border bg-muted/30">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-foreground">{part.part}</div>
                          <div className="text-xs text-muted-foreground">{part.machine}</div>
                          <div className="text-xs text-muted-foreground mt-1">{part.reason}</div>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            part.urgency === 'high' ? 'destructive' :
                            part.urgency === 'medium' ? 'default' : 'secondary'
                          }>
                            {part.urgency}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">{part.customers} customers</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Fleet Health Tab */}
            <TabsContent value="fleet" className="space-y-6">
              <Card className="bg-card border shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Fleet Health Dashboard</CardTitle>
                      <CardDescription>Real-time equipment monitoring across all brands</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter brand" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Brands</SelectItem>
                          <SelectItem value="dexter">Dexter</SelectItem>
                          <SelectItem value="speedqueen">Speed Queen</SelectItem>
                          <SelectItem value="continental">Continental</SelectItem>
                          <SelectItem value="huebsch">Huebsch</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {Array.from({ length: 24 }).map((_, i) => {
                      const status = i < 20 ? 'online' : i < 22 ? 'warning' : 'offline';
                      return (
                        <div 
                          key={i}
                          className={`p-3 rounded-lg border text-center cursor-pointer hover-elevate ${
                            status === 'online' ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' :
                            status === 'warning' ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900' :
                            'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                          }`}
                        >
                          <Cpu className={`w-6 h-6 mx-auto mb-1 ${
                            status === 'online' ? 'text-green-500' :
                            status === 'warning' ? 'text-amber-500' :
                            'text-red-500'
                          }`} />
                          <div className="text-xs font-medium text-foreground">M-{1001 + i}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {status === 'online' ? 'Running' : status === 'warning' ? 'Attention' : 'Offline'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 text-center">
                    <Button variant="outline">
                      Load More Machines
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Parts Intelligence Tab */}
            <TabsContent value="parts" className="space-y-6">
              <Card className="bg-card border shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Parts Intelligence</CardTitle>
                      <CardDescription>Predictive parts recommendations and ordering</CardDescription>
                    </div>
                    <Button className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]">
                      <Package className="w-4 h-4 mr-2" />
                      Create Bulk Order
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockPartsRecommendations.concat(mockPartsRecommendations).map((part, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{part.part}</div>
                            <div className="text-sm text-muted-foreground">{part.machine}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              <Zap className="w-3 h-3 inline mr-1" />
                              {part.reason}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <Badge variant={
                              part.urgency === 'high' ? 'destructive' :
                              part.urgency === 'medium' ? 'default' : 'secondary'
                            }>
                              {part.urgency} priority
                            </Badge>
                            <div className="text-sm text-muted-foreground mt-1">
                              {part.customers} customers affected
                            </div>
                          </div>
                          <Button size="sm">Order Now</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Receptionist Tab */}
            <TabsContent value="receptionist" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-card border shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Headphones className="w-5 h-5 text-blue-500" />
                          AI Receptionist Console
                        </CardTitle>
                        <CardDescription>24/7 AI-powered call handling and scheduling</CardDescription>
                      </div>
                      <Badge className="bg-green-500">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockRecentCalls.concat(mockRecentCalls).map((call, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              call.status === 'completed' ? 'bg-green-100 dark:bg-green-900' :
                              call.status === 'dispatched' ? 'bg-blue-100 dark:bg-blue-900' :
                              'bg-amber-100 dark:bg-amber-900'
                            }`}>
                              <Phone className={`w-4 h-4 ${
                                call.status === 'completed' ? 'text-green-600' :
                                call.status === 'dispatched' ? 'text-blue-600' :
                                'text-amber-600'
                              }`} />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{call.caller}</div>
                              <div className="text-sm text-muted-foreground">{call.issue}</div>
                              <div className="text-xs text-muted-foreground">{call.time}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <Badge variant={
                                call.status === 'completed' ? 'default' :
                                call.status === 'dispatched' ? 'secondary' : 'outline'
                              }>
                                {call.status}
                              </Badge>
                              <div className="text-xs text-muted-foreground mt-1">
                                Tech: {call.tech}
                              </div>
                            </div>
                            <Button size="sm" variant="outline">Details</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Today's Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Calls Handled</span>
                      </div>
                      <span className="font-bold text-foreground">47</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Avg Handle Time</span>
                      </div>
                      <span className="font-bold text-foreground">2:34</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">Resolution Rate</span>
                      </div>
                      <span className="font-bold text-green-500">94%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Appointments Set</span>
                      </div>
                      <span className="font-bold text-foreground">18</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Dispatch Tab */}
            <TabsContent value="dispatch" className="space-y-6">
              <Card className="bg-card border shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-orange-500" />
                        Technician Dispatch
                      </CardTitle>
                      <CardDescription>AI-optimized routing and scheduling</CardDescription>
                    </div>
                    <Button className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]">
                      <MapPin className="w-4 h-4 mr-2" />
                      Optimize Routes
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center border">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Route optimization map</p>
                      <p className="text-sm text-muted-foreground">Google Maps integration coming soon</p>
                    </div>
                  </div>
                  <div className="mt-6 grid md:grid-cols-3 gap-4">
                    {[
                      { tech: "John D.", jobs: 5, status: "on_route", location: "Downtown" },
                      { tech: "Sarah M.", jobs: 4, status: "at_job", location: "Campus Wash" },
                      { tech: "Tom B.", jobs: 6, status: "available", location: "HQ" }
                    ].map((tech, i) => (
                      <div key={i} className="p-4 rounded-lg border bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground">{tech.tech}</span>
                          <Badge variant={
                            tech.status === 'available' ? 'default' :
                            tech.status === 'at_job' ? 'secondary' : 'outline'
                          }>
                            {tech.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div>{tech.jobs} jobs today</div>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {tech.location}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
