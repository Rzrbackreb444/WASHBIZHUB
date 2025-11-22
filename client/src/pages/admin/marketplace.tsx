import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, Package, ShoppingCart, TrendingUp } from "lucide-react";

export default function AdminMarketplace() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stores = [] } = useQuery({
    queryKey: ['/api/vendor-stores'],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/vendor-products'],
    enabled: isAuthenticated && user?.isAdmin,
  });

  if (authLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated || !user?.isAdmin) {
    setLocation('/');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Marketplace Management</h1>
        <p className="text-muted-foreground">Manage vendor stores, products, and orders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stores.length}</div>
            <p className="text-xs text-muted-foreground">Active vendor storefronts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Listed products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-xs text-muted-foreground">Total marketplace revenue</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendor Stores</CardTitle>
            <CardDescription>Manage vendor storefronts and approval status</CardDescription>
          </CardHeader>
          <CardContent>
            {stores.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No vendor stores yet
              </div>
            ) : (
              <div className="space-y-4">
                {stores.slice(0, 5).map((store: any) => (
                  <div key={store.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{store.storeName}</div>
                      <div className="text-sm text-muted-foreground">{store.productCount || 0} products</div>
                    </div>
                    <Badge variant={store.verified ? "default" : "secondary"}>
                      {store.verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
            <CardDescription>Latest product listings awaiting review</CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No products yet
              </div>
            ) : (
              <div className="space-y-4">
                {products.slice(0, 5).map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">${product.price}</div>
                    </div>
                    <Badge variant={product.featured ? "default" : "outline"}>
                      {product.featured ? 'Featured' : 'Standard'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
