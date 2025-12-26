import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Store, Package, CheckCircle, Ban } from "lucide-react";
import { Star } from "@/lib/icon-registry";

export default function AdminMarketplace() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: stores = [] } = useQuery<any[]>({
    queryKey: ['/api/vendor-stores'],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: products = [] } = useQuery<any[]>({
    queryKey: ['/api/vendor-products'],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const verifyStoreMutation = useMutation({
    mutationFn: async ({ id, verified }: { id: string; verified: boolean }) => {
      const response = await apiRequest("PATCH", `/api/vendor-stores/${id}`, { verified });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendor-stores'] });
      toast({ title: "Store verification updated" });
    },
  });

  const toggleFeaturedProduct = useMutation({
    mutationFn: async ({ productId, featured }: { productId: string; featured: boolean }) => {
      const response = await apiRequest("PATCH", `/api/vendor-products/${productId}`, { featured });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendor-products'] });
      toast({ title: "Product featured status updated" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async ({ productId }: { productId: string }) => {
      await apiRequest("DELETE", `/api/vendor-products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendor-products'] });
      toast({ title: "Product removed" });
    },
  });

  if (authLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated || !user?.isAdmin) {
    setLocation('/');
    return null;
  }

  const verifiedStores = stores.filter((s: any) => s.verified).length;
  const pendingStores = stores.filter((s: any) => !s.verified).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Marketplace Management</h1>
        <p className="text-muted-foreground">Manage vendor stores and products</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stores.length}</div>
            <p className="text-xs text-muted-foreground">{verifiedStores} verified, {pendingStores} pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Listed for sale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter((p: any) => p.featured).length}</div>
            <p className="text-xs text-muted-foreground">Featured products</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendor Stores</CardTitle>
            <CardDescription>Approve or reject vendor storefronts</CardDescription>
          </CardHeader>
          <CardContent>
            {stores.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Store className="w-16 h-16 mx-auto mb-4" />
                No vendor stores yet
              </div>
            ) : (
              <div className="space-y-3">
                {stores.map((store: any) => (
                  <div key={store.id} className="flex items-center justify-between p-3 rounded-md border" data-testid={`store-${store.id}`}>
                    <div className="flex-1">
                      <div className="font-medium">{store.storeName}</div>
                      <div className="text-sm text-muted-foreground">
                        {store.description?.substring(0, 80)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {store.verified ? (
                        <Badge variant="default" className="bg-green-600">Verified</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => verifyStoreMutation.mutate({ id: store.id, verified: !store.verified })}
                        data-testid={`button-verify-${store.id}`}
                      >
                        {store.verified ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Management</CardTitle>
            <CardDescription>Feature or remove products</CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-16 h-16 mx-auto mb-4" />
                No products yet
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between p-3 rounded-md border" data-testid={`product-${product.id}`}>
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ${product.price} · {product.category}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {product.featured && <Badge variant="default" className="bg-amber-600">Featured</Badge>}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFeaturedProduct.mutate({ 
                          productId: product.id, 
                          featured: !product.featured 
                        })}
                        data-testid={`button-feature-${product.id}`}
                      >
                        <Star className={`w-4 h-4 ${product.featured ? 'fill-current' : ''}`} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Remove this product?')) {
                            deleteProductMutation.mutate({ productId: product.id });
                          }
                        }}
                        data-testid={`button-delete-${product.id}`}
                      >
                        <Ban className="w-4 h-4" />
                      </Button>
                    </div>
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
