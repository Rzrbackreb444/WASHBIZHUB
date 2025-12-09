import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/AuthGuard";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DashboardShell,
  DashboardSection,
  KPICard,
  KPIGroup,
  ChartCard,
  DashboardNav,
} from "@/components/dashboard";
import {
  Package,
  Eye,
  ShoppingCart,
  DollarSign,
  Plus,
  Clock,
  Box,
  Settings,
  Sparkles,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  PackageSearch,
  Edit,
  Trash2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const dashboardNavItems = [
  { id: "buyer", label: "Buyer Dashboard", href: "/buyer-dashboard" },
  { id: "seller", label: "Seller Dashboard", href: "/seller-dashboard" },
  { id: "vendor", label: "Vendor Dashboard", href: "/vendor-dashboard" },
  { id: "affiliate", label: "Affiliate Dashboard", href: "/affiliate-dashboard" },
  { id: "owner", label: "Owner Dashboard", href: "/owner-dashboard" },
];

const mockSalesData = [
  { month: "Jan", sales: 1200, orders: 15 },
  { month: "Feb", sales: 1850, orders: 22 },
  { month: "Mar", sales: 2400, orders: 28 },
  { month: "Apr", sales: 1900, orders: 24 },
  { month: "May", sales: 2800, orders: 35 },
  { month: "Jun", sales: 3200, orders: 42 },
];

const mockProducts = [
  { id: 1, name: "Speed Queen Front-Load Washer", price: 3499, stock: 12, orders: 24, status: "active", revenue: 83976 },
  { id: 2, name: "Huebsch Dryer (75lb)", price: 2299, stock: 5, orders: 15, status: "low_stock", revenue: 34485 },
  { id: 3, name: "POS System Bundle", price: 1200, stock: 8, orders: 42, status: "active", revenue: 50400 },
  { id: 4, name: "Coin Mechanism Set", price: 125, stock: 0, orders: 35, status: "out_of_stock", revenue: 4375 },
];

const recentActivity = [
  { id: 1, type: "order", message: "New order #1234 for Industrial Washer Parts", time: "15 min ago", icon: ShoppingCart },
  { id: 2, type: "view", message: "Product 'POS System Bundle' viewed 24 times today", time: "2 hours ago", icon: Eye },
  { id: 3, type: "stock", message: "Low stock alert: Commercial Dryer Motor", time: "5 hours ago", icon: AlertCircle },
  { id: 4, type: "payout", message: "Payout of $2,450 processed successfully", time: "1 day ago", icon: CheckCircle },
];

function formatCurrency(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount.toLocaleString()}`;
}

export default function VendorDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState(mockProducts);

  const mockStats = {
    productsListed: 24,
    totalViews: 1845,
    totalOrders: 156,
    revenue: 118461,
    pendingOrders: 8,
    lowStock: 3,
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(p => p.filter(prod => prod.id !== id));
  };

  return (
    <AuthGuard
      title="Sign In to Access Vendor Hub"
      description="Sign in to manage your products and track sales on WashBizHub Marketplace."
    >
      <SEO
        title="Vendor Hub | Product Management | WashBizHub"
        description="Manage your products, track orders, and grow your business on WashBizHub Marketplace."
        canonicalUrl="/vendor-dashboard"
      />

      <DashboardShell
        title="Vendor Dashboard"
        subtitle="Manage products, track orders, and grow your business"
        showDatePicker={false}
        showExportButtons={false}
        headerActions={
          <div className="flex items-center gap-2">
            <DashboardNav 
              items={dashboardNavItems} 
              variant="dropdown" 
              className="hidden md:flex"
            />
            <Badge className="bg-green-500/10 text-green-600 border-0 gap-1" data-testid="badge-status">
              <CheckCircle className="w-3.5 h-3.5" />
              Active Seller
            </Badge>
            <Link href="/vendor-products/new">
              <Button className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" data-testid="button-add-product">
                <Plus className="w-4 h-4 mr-1.5" />
                Add Product
              </Button>
            </Link>
          </div>
        }
      >
        <DashboardSection className="mb-8">
          <KPIGroup>
            <KPICard
              value={mockStats.productsListed}
              label="Products Listed"
              icon={Package}
              variant="gold"
              subtitle={`${mockStats.lowStock} low stock`}
            />
            <KPICard
              value={mockStats.totalViews}
              label="Total Views"
              icon={Eye}
              variant="default"
              trend={{ value: 18.3, direction: "up", label: "vs last month" }}
            />
            <KPICard
              value={mockStats.totalOrders}
              label="Orders"
              icon={ShoppingCart}
              variant="default"
              subtitle={`${mockStats.pendingOrders} pending`}
            />
            <KPICard
              value={formatCurrency(mockStats.revenue)}
              label="Total Revenue"
              icon={DollarSign}
              variant="success"
              trend={{ value: 24.5, direction: "up", label: "vs last month" }}
            />
          </KPIGroup>
        </DashboardSection>

        <DashboardSection className="mb-8">
          <Card className="bg-card border shadow-sm overflow-hidden">
            <div className="h-1 bg-[#C8A661]" />
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-[#C8A661]" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Quick Actions</h3>
                  <p className="text-sm text-muted-foreground">Manage your vendor operations</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/vendor-products/new">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 border-[#0A1628]/20 hover:border-[#C8A661] hover:bg-[#C8A661]/5" data-testid="button-quick-add-product">
                    <Plus className="h-5 w-5 text-[#0A1628]" />
                    <span className="text-sm font-medium">Add Product</span>
                  </Button>
                </Link>
                <Link href="/vendor-inventory">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 border-[#0A1628]/20 hover:border-[#C8A661] hover:bg-[#C8A661]/5" data-testid="button-quick-inventory">
                    <Box className="h-5 w-5 text-[#0A1628]" />
                    <span className="text-sm font-medium">Manage Inventory</span>
                  </Button>
                </Link>
                <Link href="/vendor-orders">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 border-[#0A1628]/20 hover:border-[#C8A661] hover:bg-[#C8A661]/5" data-testid="button-quick-orders">
                    <ShoppingCart className="h-5 w-5 text-[#0A1628]" />
                    <span className="text-sm font-medium">View Orders</span>
                  </Button>
                </Link>
                <Link href="/vendor-settings">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 border-[#0A1628]/20 hover:border-[#C8A661] hover:bg-[#C8A661]/5" data-testid="button-quick-settings">
                    <Settings className="h-5 w-5 text-[#0A1628]" />
                    <span className="text-sm font-medium">Store Settings</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </DashboardSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <ChartCard
              title="Sales Performance"
              subtitle="Monthly sales and orders overview"
              minHeight="280px"
            >
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={mockSalesData}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C8A661" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C8A661" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `$${value}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: any) => [`$${value.toLocaleString()}`, "Sales"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#C8A661"
                    fill="url(#salesGradient)"
                    strokeWidth={2}
                    name="Sales"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="lg:col-span-1">
            <DashboardSection title="Recent Activity">
              <Card className="bg-card border shadow-sm">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={activity.id} className="flex gap-3" data-testid={`activity-item-${activity.id}`}>
                        <div className="relative">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            activity.type === "order" ? "bg-green-500/10" :
                            activity.type === "stock" ? "bg-yellow-500/10" :
                            activity.type === "payout" ? "bg-blue-500/10" :
                            "bg-purple-500/10"
                          }`}>
                            <activity.icon className={`h-4 w-4 ${
                              activity.type === "order" ? "text-green-600" :
                              activity.type === "stock" ? "text-yellow-600" :
                              activity.type === "payout" ? "text-blue-600" :
                              "text-purple-600"
                            }`} />
                          </div>
                          {index < recentActivity.length - 1 && (
                            <div className="absolute top-8 left-4 w-px h-full bg-border -translate-x-1/2" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pb-4">
                          <p className="text-sm text-foreground line-clamp-2">{activity.message}</p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </DashboardSection>
          </div>
        </div>

        <DashboardSection
          title="Your Products"
          description="Manage and track your product listings"
          action={
            <Link href="/vendor-products">
              <Button size="sm" variant="outline" className="border-[#0A1628]/20" data-testid="button-view-all-products">
                View All Products
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="bg-card border shadow-sm overflow-hidden hover:shadow-md transition-shadow" data-testid={`card-product-${product.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center">
                      <PackageSearch className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Badge className={`border-0 ${
                      product.status === "active" ? "bg-green-500/10 text-green-600" :
                      product.status === "low_stock" ? "bg-yellow-500/10 text-yellow-600" :
                      "bg-red-500/10 text-red-600"
                    }`}>
                      {product.status === "active" ? "Active" :
                       product.status === "low_stock" ? "Low Stock" : "Out of Stock"}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-foreground mb-1 line-clamp-1">{product.name}</h4>
                  <p className="text-lg font-bold text-[#C8A661] mb-3">${product.price.toLocaleString()}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Box className="h-3.5 w-3.5" />
                      {product.stock} in stock
                    </span>
                    <span className="flex items-center gap-1">
                      <ShoppingCart className="h-3.5 w-3.5" />
                      {product.orders} orders
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" data-testid={`button-edit-${product.id}`}>
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteProduct(product.id)}
                      data-testid={`button-delete-${product.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DashboardSection>
      </DashboardShell>
    </AuthGuard>
  );
}
