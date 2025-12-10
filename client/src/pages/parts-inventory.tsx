import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  ShoppingCart,
  Truck,
  CheckCircle,
  ExternalLink,
  Filter,
  BarChart3,
  DollarSign,
  TrendingUp,
  Warehouse,
  ClipboardList,
  PackageCheck,
  Settings,
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  ArrowUpDown,
  Box,
  XCircle,
} from "lucide-react";

import type { PartsCatalog, InventoryItem, PurchaseOrder } from "@shared/schema";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  ordered: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  partial: "bg-yellow-100 text-yellow-800",
  received: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const MACHINE_TYPES = ["washer", "dryer", "payment", "other"];
const CATEGORIES = ["Motors", "Belts", "Bearings", "Controls", "Seals", "Pumps", "Valves", "Heating", "Electrical", "Other"];

const inventoryFormSchema = z.object({
  partNumber: z.string().min(1, "Part number required"),
  name: z.string().min(1, "Name required"),
  description: z.string().optional(),
  quantity: z.coerce.number().min(0),
  reorderPoint: z.coerce.number().min(0),
  unitCost: z.string().min(1),
  supplier: z.string().optional(),
  category: z.string().optional(),
  machineType: z.string().optional(),
  locationName: z.string().optional(),
  binLocation: z.string().optional(),
});

const purchaseOrderSchema = z.object({
  supplierName: z.string().min(1, "Supplier required"),
  supplierContact: z.string().optional(),
  locationName: z.string().optional(),
  shippingAddress: z.string().optional(),
  notes: z.string().optional(),
});

export default function PartsInventory() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [machineTypeFilter, setMachineTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [showCreatePO, setShowCreatePO] = useState(false);
  const [selectedPOItems, setSelectedPOItems] = useState<Array<{ catalogId?: string; partNumber: string; name: string; quantity: number; unitPrice: number }>>([]);
  const [viewingOrder, setViewingOrder] = useState<PurchaseOrder | null>(null);

  const catalogQuery = useQuery<PartsCatalog[]>({
    queryKey: ["/api/parts-catalog", { search: searchQuery, supplier: supplierFilter !== "all" ? supplierFilter : undefined, machineType: machineTypeFilter !== "all" ? machineTypeFilter : undefined, category: categoryFilter !== "all" ? categoryFilter : undefined }],
    enabled: activeTab === "catalog",
  });

  const inventoryQuery = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
    enabled: !!user && activeTab === "inventory",
  });

  const alertsQuery = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory/alerts"],
    enabled: !!user,
  });

  const ordersQuery = useQuery<PurchaseOrder[]>({
    queryKey: ["/api/purchase-orders"],
    enabled: !!user && activeTab === "orders",
  });

  const suppliersQuery = useQuery<string[]>({
    queryKey: ["/api/inventory/suppliers"],
  });

  const spendReportQuery = useQuery<{ totalSpend: number; bySupplier: Record<string, number>; orderCount: number }>({
    queryKey: ["/api/inventory/reports/spend"],
    enabled: !!user && activeTab === "reports",
  });

  const mostUsedQuery = useQuery<Array<{ itemId: string; totalUsed: number; usageCount: number; item?: InventoryItem }>>({
    queryKey: ["/api/inventory/reports/most-used"],
    enabled: !!user && activeTab === "reports",
  });

  const valuationQuery = useQuery<{ totalValue: number; byLocation: Record<string, number>; byCategory: Record<string, number>; itemCount: number }>({
    queryKey: ["/api/inventory/reports/valuation"],
    enabled: !!user && activeTab === "reports",
  });

  const inventoryForm = useForm({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      partNumber: "",
      name: "",
      description: "",
      quantity: 0,
      reorderPoint: 2,
      unitCost: "",
      supplier: "",
      category: "",
      machineType: "",
      locationName: "",
      binLocation: "",
    },
  });

  const poForm = useForm({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplierName: "",
      supplierContact: "",
      locationName: "",
      shippingAddress: "",
      notes: "",
    },
  });

  const createInventoryMutation = useMutation({
    mutationFn: (data: z.infer<typeof inventoryFormSchema>) =>
      apiRequest("/api/inventory", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/alerts"] });
      setShowAddInventory(false);
      inventoryForm.reset();
      toast({ title: "Inventory item added" });
    },
    onError: () => toast({ title: "Failed to add item", variant: "destructive" }),
  });

  const deleteInventoryMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/inventory/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/alerts"] });
      toast({ title: "Item deleted" });
    },
  });

  const createPOMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/purchase-orders", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
      setShowCreatePO(false);
      setSelectedPOItems([]);
      poForm.reset();
      toast({ title: "Purchase order created" });
    },
    onError: () => toast({ title: "Failed to create order", variant: "destructive" }),
  });

  const updatePOStatusMutation = useMutation({
    mutationFn: ({ id, status, orderDate }: { id: string; status: string; orderDate?: Date }) =>
      apiRequest(`/api/purchase-orders/${id}`, { method: "PATCH", body: JSON.stringify({ status, orderDate }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
      toast({ title: "Order updated" });
    },
  });

  const receivePOMutation = useMutation({
    mutationFn: ({ id, items }: { id: string; items: Array<{ partNumber: string; quantity: number }> }) =>
      apiRequest(`/api/purchase-orders/${id}/receive`, { method: "POST", body: JSON.stringify({ items, updateInventory: true }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/alerts"] });
      setViewingOrder(null);
      toast({ title: "Items received and inventory updated" });
    },
  });

  const addToCart = (part: PartsCatalog) => {
    const existing = selectedPOItems.find((i) => i.partNumber === part.partNumber);
    if (existing) {
      setSelectedPOItems(selectedPOItems.map((i) => (i.partNumber === part.partNumber ? { ...i, quantity: i.quantity + 1 } : i)));
    } else {
      setSelectedPOItems([...selectedPOItems, { catalogId: part.id, partNumber: part.partNumber, name: part.name, quantity: 1, unitPrice: parseFloat(part.price || "0") }]);
    }
    toast({ title: `Added ${part.name} to order` });
  };

  const removeFromCart = (partNumber: string) => {
    setSelectedPOItems(selectedPOItems.filter((i) => i.partNumber !== partNumber));
  };

  const handleCreatePO = (data: z.infer<typeof purchaseOrderSchema>) => {
    if (selectedPOItems.length === 0) {
      toast({ title: "Add items to order first", variant: "destructive" });
      return;
    }
    const subtotal = selectedPOItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    createPOMutation.mutate({
      ...data,
      items: selectedPOItems,
      subtotal: subtotal.toString(),
      totalCost: subtotal.toString(),
      status: "draft",
    });
  };

  const handleSubmitOrder = (order: PurchaseOrder) => {
    updatePOStatusMutation.mutate({ id: order.id, status: "ordered", orderDate: new Date() });
  };

  const handleReceiveAll = (order: PurchaseOrder) => {
    const items = (order.items as any[]).map((i) => ({ partNumber: i.partNumber, quantity: i.quantity - (i.receivedQty || 0) }));
    receivePOMutation.mutate({ id: order.id, items });
  };

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Skeleton className="h-12 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const lowStockCount = alertsQuery.data?.length || 0;

  return (
    <>
      <Helmet>
        <title>Parts & Inventory | WashBizHub</title>
        <meta name="description" content="Manage parts inventory, purchase orders, and supplier catalog for your laundromat operations." />
      </Helmet>

      <div className="min-h-screen bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">Parts & Inventory</h1>
              <p className="text-muted-foreground mt-1">Manage parts ordering and inventory tracking</p>
            </div>
            <div className="flex items-center gap-3">
              {lowStockCount > 0 && (
                <Badge variant="destructive" className="gap-1" data-testid="badge-low-stock-alert">
                  <AlertTriangle className="h-3 w-3" />
                  {lowStockCount} Low Stock
                </Badge>
              )}
              {selectedPOItems.length > 0 && (
                <Button onClick={() => setShowCreatePO(true)} className="gap-2 bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" data-testid="button-create-order">
                  <ShoppingCart className="h-4 w-4" />
                  Cart ({selectedPOItems.length})
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card border shadow-sm" data-testid="card-stat-catalog">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                    <Package className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#C8A661]">{catalogQuery.data?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Catalog Parts</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border shadow-sm" data-testid="card-stat-inventory">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                    <Warehouse className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#C8A661]">{inventoryQuery.data?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Inventory Items</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border shadow-sm" data-testid="card-stat-orders">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                    <ClipboardList className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#C8A661]">{ordersQuery.data?.filter((o) => o.status !== "received" && o.status !== "cancelled").length || 0}</div>
                    <div className="text-xs text-muted-foreground">Open Orders</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border shadow-sm" data-testid="card-stat-valuation">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#C8A661]">${(valuationQuery.data?.totalValue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    <div className="text-xs text-muted-foreground">Inventory Value</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6" data-testid="tabs-navigation">
              <TabsTrigger value="catalog" className="gap-2" data-testid="tab-catalog">
                <Package className="h-4 w-4" />
                Supplier Catalog
              </TabsTrigger>
              <TabsTrigger value="inventory" className="gap-2" data-testid="tab-inventory">
                <Warehouse className="h-4 w-4" />
                My Inventory
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2" data-testid="tab-orders">
                <ClipboardList className="h-4 w-4" />
                Purchase Orders
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-2" data-testid="tab-reports">
                <BarChart3 className="h-4 w-4" />
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="catalog">
              <Card className="bg-card border shadow-sm">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#C8A661]" />
                    Parts Catalog
                  </CardTitle>
                  <CardDescription>Browse parts from Amazon, AAdvantage Laundry, and other suppliers</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex-1 min-w-[200px]">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search parts..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                          data-testid="input-search-catalog"
                        />
                      </div>
                    </div>
                    <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                      <SelectTrigger className="w-[180px]" data-testid="select-supplier-filter">
                        <SelectValue placeholder="Supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Suppliers</SelectItem>
                        {suppliersQuery.data?.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={machineTypeFilter} onValueChange={setMachineTypeFilter}>
                      <SelectTrigger className="w-[180px]" data-testid="select-machine-filter">
                        <SelectValue placeholder="Machine Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {MACHINE_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-[180px]" data-testid="select-category-filter">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {catalogQuery.isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24" />
                      ))}
                    </div>
                  ) : catalogQuery.data?.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No parts found. Try adjusting your filters.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {catalogQuery.data?.map((part) => (
                        <Card key={part.id} className="hover-elevate" data-testid={`card-catalog-part-${part.id}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="h-12 w-12 rounded-lg bg-muted/50 flex items-center justify-center">
                                  <Box className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold truncate" data-testid={`text-part-name-${part.id}`}>{part.name}</h3>
                                    {!part.inStock && <Badge variant="secondary">Out of Stock</Badge>}
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>#{part.partNumber}</span>
                                    {part.manufacturer && <span>{part.manufacturer}</span>}
                                    <Badge variant="outline">{part.supplier}</Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-xl font-bold text-[#C8A661]" data-testid={`text-part-price-${part.id}`}>${parseFloat(part.price || "0").toFixed(2)}</div>
                                  {part.leadTimeDays && <div className="text-xs text-muted-foreground">{part.leadTimeDays} day lead time</div>}
                                </div>
                                <div className="flex items-center gap-2">
                                  {part.affiliateUrl && (
                                    <Button variant="outline" size="icon" asChild data-testid={`button-affiliate-${part.id}`}>
                                      <a href={part.affiliateUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4" />
                                      </a>
                                    </Button>
                                  )}
                                  <Button size="sm" onClick={() => addToCart(part)} disabled={!part.inStock} data-testid={`button-add-to-cart-${part.id}`}>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory">
              <Card className="bg-card border shadow-sm">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Warehouse className="h-5 w-5 text-[#C8A661]" />
                        Inventory Items
                      </CardTitle>
                      <CardDescription>Track stock levels, costs, and usage</CardDescription>
                    </div>
                    <Button onClick={() => setShowAddInventory(true)} className="gap-2" data-testid="button-add-inventory">
                      <Plus className="h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {!user ? (
                    <div className="text-center py-12">
                      <Warehouse className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground mb-4">Sign in to manage your inventory</p>
                      <Button onClick={() => setLocation("/login")} data-testid="button-signin-inventory">Sign In</Button>
                    </div>
                  ) : inventoryQuery.isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20" />
                      ))}
                    </div>
                  ) : inventoryQuery.data?.length === 0 ? (
                    <div className="text-center py-12">
                      <Warehouse className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground mb-4">No inventory items yet</p>
                      <Button onClick={() => setShowAddInventory(true)} data-testid="button-add-first-item">Add Your First Item</Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {inventoryQuery.data?.map((item) => (
                        <Card key={item.id} className={`hover-elevate ${item.quantity <= item.reorderPoint ? "border-red-200" : ""}`} data-testid={`card-inventory-item-${item.id}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4 flex-1">
                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${item.quantity <= item.reorderPoint ? "bg-red-100" : "bg-muted/50"}`}>
                                  {item.quantity <= item.reorderPoint ? (
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                  ) : (
                                    <Box className="h-5 w-5 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold" data-testid={`text-inventory-name-${item.id}`}>{item.name}</div>
                                  <div className="text-sm text-muted-foreground flex items-center gap-3">
                                    <span>#{item.partNumber}</span>
                                    {item.locationName && <span>{item.locationName}</span>}
                                    {item.binLocation && <span className="font-mono text-xs">Bin: {item.binLocation}</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-center">
                                  <div className={`text-xl font-bold ${item.quantity <= item.reorderPoint ? "text-red-600" : "text-foreground"}`} data-testid={`text-inventory-qty-${item.id}`}>{item.quantity}</div>
                                  <div className="text-xs text-muted-foreground">In Stock</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm font-medium">{item.reorderPoint}</div>
                                  <div className="text-xs text-muted-foreground">Reorder At</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium text-[#C8A661]" data-testid={`text-inventory-cost-${item.id}`}>${parseFloat(item.unitCost || "0").toFixed(2)}</div>
                                  <div className="text-xs text-muted-foreground">Unit Cost</div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => deleteInventoryMutation.mutate(item.id)} data-testid={`button-delete-inventory-${item.id}`}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card className="bg-card border shadow-sm">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-[#C8A661]" />
                        Purchase Orders
                      </CardTitle>
                      <CardDescription>Manage orders from draft to delivery</CardDescription>
                    </div>
                    <Button onClick={() => setShowCreatePO(true)} className="gap-2" disabled={selectedPOItems.length === 0} data-testid="button-new-order">
                      <Plus className="h-4 w-4" />
                      New Order
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {!user ? (
                    <div className="text-center py-12">
                      <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground mb-4">Sign in to manage purchase orders</p>
                      <Button onClick={() => setLocation("/login")} data-testid="button-signin-orders">Sign In</Button>
                    </div>
                  ) : ordersQuery.isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24" />
                      ))}
                    </div>
                  ) : ordersQuery.data?.length === 0 ? (
                    <div className="text-center py-12">
                      <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground mb-4">No purchase orders yet</p>
                      <p className="text-sm text-muted-foreground">Add parts from the catalog to create an order</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ordersQuery.data?.map((order) => (
                        <Card key={order.id} className="hover-elevate" data-testid={`card-order-${order.id}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                                  {order.status === "received" ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  ) : order.status === "shipped" ? (
                                    <Truck className="h-5 w-5 text-[#C8A661]" />
                                  ) : order.status === "cancelled" ? (
                                    <XCircle className="h-5 w-5 text-red-500" />
                                  ) : (
                                    <ClipboardList className="h-5 w-5 text-[#C8A661]" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold font-mono" data-testid={`text-order-number-${order.id}`}>{order.poNumber}</span>
                                    <Badge className={STATUS_COLORS[order.status]}>{order.status}</Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground flex items-center gap-3">
                                    <span>{order.supplierName}</span>
                                    <span>{(order.items as any[]).length} items</span>
                                    {order.orderDate && <span>Ordered {format(new Date(order.orderDate), "MMM d, yyyy")}</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-xl font-bold text-[#C8A661]" data-testid={`text-order-total-${order.id}`}>${parseFloat(order.totalCost || "0").toFixed(2)}</div>
                                  <div className="text-xs text-muted-foreground">Total</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm" onClick={() => setViewingOrder(order)} data-testid={`button-view-order-${order.id}`}>
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                  {order.status === "draft" && (
                                    <Button size="sm" onClick={() => handleSubmitOrder(order)} data-testid={`button-submit-order-${order.id}`}>
                                      <Truck className="h-4 w-4 mr-1" />
                                      Submit
                                    </Button>
                                  )}
                                  {(order.status === "ordered" || order.status === "shipped" || order.status === "partial") && (
                                    <Button size="sm" onClick={() => handleReceiveAll(order)} className="bg-green-600 hover:bg-green-700" data-testid={`button-receive-order-${order.id}`}>
                                      <PackageCheck className="h-4 w-4 mr-1" />
                                      Receive
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-card border shadow-sm" data-testid="card-report-spend">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-[#C8A661]" />
                      Parts Spend
                    </CardTitle>
                    <CardDescription>Total spending on received orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {spendReportQuery.isLoading ? (
                      <Skeleton className="h-32" />
                    ) : (
                      <div>
                        <div className="text-4xl font-bold text-[#C8A661] mb-4" data-testid="text-total-spend">
                          ${(spendReportQuery.data?.totalSpend || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm text-muted-foreground mb-4">{spendReportQuery.data?.orderCount || 0} orders received</div>
                        <div className="space-y-2">
                          {Object.entries(spendReportQuery.data?.bySupplier || {}).map(([supplier, amount]) => (
                            <div key={supplier} className="flex justify-between text-sm">
                              <span>{supplier}</span>
                              <span className="font-medium">${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-card border shadow-sm" data-testid="card-report-valuation">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Warehouse className="h-5 w-5 text-[#C8A661]" />
                      Inventory Valuation
                    </CardTitle>
                    <CardDescription>Current inventory value by location</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {valuationQuery.isLoading ? (
                      <Skeleton className="h-32" />
                    ) : (
                      <div>
                        <div className="text-4xl font-bold text-[#C8A661] mb-4" data-testid="text-total-valuation">
                          ${(valuationQuery.data?.totalValue || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm text-muted-foreground mb-4">{valuationQuery.data?.itemCount || 0} items in stock</div>
                        <div className="space-y-2">
                          {Object.entries(valuationQuery.data?.byLocation || {}).map(([location, value]) => (
                            <div key={location} className="flex justify-between text-sm">
                              <span>{location}</span>
                              <span className="font-medium">${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-card border shadow-sm md:col-span-2" data-testid="card-report-most-used">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-[#C8A661]" />
                      Most Used Parts
                    </CardTitle>
                    <CardDescription>Parts with highest usage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {mostUsedQuery.isLoading ? (
                      <Skeleton className="h-32" />
                    ) : mostUsedQuery.data?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No usage data yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {mostUsedQuery.data?.slice(0, 10).map((usage, idx) => (
                          <div key={usage.itemId} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg" data-testid={`row-most-used-${idx}`}>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded bg-[#0A1628] flex items-center justify-center text-[#C8A661] font-bold text-sm">
                                {idx + 1}
                              </div>
                              <div>
                                <div className="font-medium">{usage.item?.name || "Unknown"}</div>
                                <div className="text-xs text-muted-foreground">#{usage.item?.partNumber}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-[#C8A661]">{usage.totalUsed} used</div>
                              <div className="text-xs text-muted-foreground">{usage.usageCount} times</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={showAddInventory} onOpenChange={setShowAddInventory}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
          </DialogHeader>
          <Form {...inventoryForm}>
            <form onSubmit={inventoryForm.handleSubmit((data) => createInventoryMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={inventoryForm.control}
                  name="partNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Part Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ABC123" data-testid="input-part-number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={inventoryForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Part name" data-testid="input-part-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={inventoryForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} data-testid="input-quantity" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={inventoryForm.control}
                  name="reorderPoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reorder Point</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} data-testid="input-reorder-point" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={inventoryForm.control}
                  name="unitCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Cost</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="0.00" data-testid="input-unit-cost" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={inventoryForm.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Supplier name" data-testid="input-supplier" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={inventoryForm.control}
                  name="locationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Main Warehouse" data-testid="input-location" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddInventory(false)}>Cancel</Button>
                <Button type="submit" disabled={createInventoryMutation.isPending} data-testid="button-save-inventory">
                  {createInventoryMutation.isPending ? "Saving..." : "Save Item"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreatePO} onOpenChange={setShowCreatePO}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[300px] mb-4">
            <div className="space-y-2">
              {selectedPOItems.map((item) => (
                <div key={item.partNumber} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg" data-testid={`po-item-${item.partNumber}`}>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">#{item.partNumber}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const qty = parseInt(e.target.value) || 1;
                          setSelectedPOItems(selectedPOItems.map((i) => (i.partNumber === item.partNumber ? { ...i, quantity: qty } : i)));
                        }}
                        className="w-16 text-center"
                        min={1}
                        data-testid={`input-po-qty-${item.partNumber}`}
                      />
                    </div>
                    <div className="text-right min-w-[80px]">
                      <div className="font-medium">${(item.quantity * item.unitPrice).toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">${item.unitPrice.toFixed(2)} ea</div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.partNumber)} data-testid={`button-remove-po-item-${item.partNumber}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="border-t pt-4 mb-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-[#C8A661]" data-testid="text-po-total">
                ${selectedPOItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0).toFixed(2)}
              </span>
            </div>
          </div>
          <Form {...poForm}>
            <form onSubmit={poForm.handleSubmit(handleCreatePO)} className="space-y-4">
              <FormField
                control={poForm.control}
                name="supplierName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Amazon / AAdvantage Laundry" data-testid="input-po-supplier" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={poForm.control}
                name="shippingAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shipping Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Delivery address" rows={2} data-testid="input-po-address" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={poForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Order notes..." rows={2} data-testid="input-po-notes" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCreatePO(false)}>Cancel</Button>
                <Button type="submit" disabled={createPOMutation.isPending || selectedPOItems.length === 0} data-testid="button-create-po">
                  {createPOMutation.isPending ? "Creating..." : "Create Order"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingOrder} onOpenChange={() => setViewingOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order {viewingOrder?.poNumber}</DialogTitle>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={STATUS_COLORS[viewingOrder.status]}>{viewingOrder.status}</Badge>
                <span className="text-2xl font-bold text-[#C8A661]">${parseFloat(viewingOrder.totalCost || "0").toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Supplier</div>
                  <div className="font-medium">{viewingOrder.supplierName}</div>
                </div>
                {viewingOrder.orderDate && (
                  <div>
                    <div className="text-muted-foreground">Order Date</div>
                    <div className="font-medium">{format(new Date(viewingOrder.orderDate), "MMM d, yyyy")}</div>
                  </div>
                )}
              </div>
              <div className="border-t pt-4">
                <div className="text-sm font-medium mb-2">Items</div>
                <div className="space-y-2">
                  {(viewingOrder.items as any[]).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm p-2 bg-muted/30 rounded">
                      <div>
                        <div>{item.name}</div>
                        <div className="text-xs text-muted-foreground">#{item.partNumber}</div>
                      </div>
                      <div className="text-right">
                        <div>{item.receivedQty || 0} / {item.quantity} received</div>
                        <div className="text-xs text-muted-foreground">${item.unitPrice?.toFixed(2)} ea</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {viewingOrder.notes && (
                <div className="border-t pt-4">
                  <div className="text-sm text-muted-foreground">Notes</div>
                  <div className="text-sm">{viewingOrder.notes}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
