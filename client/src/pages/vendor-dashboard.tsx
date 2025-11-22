import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Store, Package, DollarSign, BarChart3, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { SEO } from '@/components/SEO';

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Speed Queen Front-Load Washer',
      price: 3499,
      stock: 12,
      sales: 24,
      revenue: 83976,
      featured: true,
    },
    {
      id: 2,
      name: 'Huebsch Dryer (75lb)',
      price: 2299,
      stock: 8,
      sales: 15,
      revenue: 34485,
      featured: false,
    },
  ]);

  const metrics = {
    totalSales: 39,
    totalRevenue: 118461,
    avgOrderValue: 3037,
    conversion: 12.4,
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(p => p.filter(prod => prod.id !== id));
  };

  return (
    <>
      <SEO
        title="Vendor Dashboard | Manage Store & Inventory | WashBizHub"
        description="Complete vendor management dashboard with product listing, inventory tracking, and sales analytics."
        canonicalUrl="/vendor-dashboard"
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 text-white py-12 border-b border-purple-700">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Store className="w-8 h-8" />
                  <h1 className="text-4xl font-bold">Vendor Dashboard</h1>
                </div>
                <p className="text-purple-300">Manage inventory, track sales, and grow your business</p>
              </div>
              <Button size="lg" variant="secondary" data-testid="button-new-product">
                <Plus className="w-5 h-5 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.totalSales}</div>
                <p className="text-xs text-muted-foreground">+12% this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${(metrics.totalRevenue / 1000).toFixed(1)}K</div>
                <p className="text-xs text-muted-foreground">+18% this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${metrics.avgOrderValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+3% vs last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.conversion}%</div>
                <p className="text-xs text-muted-foreground">Industry avg: 8.2%</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
              <TabsTrigger value="orders">Recent Orders (12)</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-4 mt-6">
              <div className="space-y-3">
                {products.map(product => (
                  <Card key={product.id} className="hover-elevate" data-testid={`card-product-${product.id}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{product.name}</h4>
                            {product.featured && (
                              <Badge className="bg-amber-500/20 text-amber-600">Featured</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">${product.price.toLocaleString()}</p>
                        </div>
                        <div className="text-right space-y-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">In Stock</p>
                            <p className="font-bold">{product.stock} units</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Sales</p>
                            <p className="font-bold">{product.sales} sold</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Revenue</p>
                            <p className="font-bold">${product.revenue.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" variant="outline" data-testid={`button-edit-${product.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteProduct(product.id)}
                            data-testid={`button-delete-${product.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="orders" className="space-y-4 mt-6">
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Recent orders will appear here as you make sales.
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Trend (30 days)</CardTitle>
                </CardHeader>
                <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
                  Chart rendering here - revenue growth visualization
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
