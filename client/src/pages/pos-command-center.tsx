import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Wrench,
  Truck,
  Package,
  BarChart3,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  RefreshCw,
  Calendar,
  Phone,
  Scale,
  Zap,
  Activity,
  ChevronRight,
  Eye,
  Edit,
  Sparkles,
  CircleDot,
  Weight,
  Receipt,
  Target,
  Percent,
  Timer,
  Coins,
  PiggyBank,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Mail,
  MapPin,
  UserPlus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  RadialBarChart,
  RadialBar,
} from "recharts";

// Status badge styling
const getStatusColor = (status: string) => {
  switch (status) {
    case "pending": return "bg-amber-500 text-white";
    case "processing": return "bg-blue-500 text-white";
    case "weighing": return "bg-purple-500 text-white";
    case "ready": return "bg-emerald-500 text-white";
    case "completed": return "bg-green-600 text-white";
    case "cancelled": return "bg-red-500 text-white";
    default: return "bg-gray-500 text-white";
  }
};

const getOrderTypeIcon = (type: string) => {
  switch (type) {
    case "wash_dry_fold": return <Sparkles className="w-4 h-4" />;
    case "pickup_delivery": return <Truck className="w-4 h-4" />;
    case "dry_cleaning": return <Zap className="w-4 h-4" />;
    case "self_service": return <CircleDot className="w-4 h-4" />;
    default: return <ShoppingCart className="w-4 h-4" />;
  }
};

// Order type distribution for pie chart (derived from actual data)
const ORDER_TYPE_COLORS = {
  wash_dry_fold: "#b8860b",
  pickup_delivery: "#1e3a5f",
  dry_cleaning: "#10B981",
  self_service: "#8B5CF6",
};

// Service breakdown labels
const SERVICE_LABELS: Record<string, string> = {
  wash_dry_fold: "Wash & Fold",
  pickup_delivery: "Pickup/Delivery",
  dry_cleaning: "Dry Cleaning",
  self_service: "Self-Service",
};

export default function POSCommandCenter() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedTimeframe, setSelectedTimeframe] = useState("today");
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [newCustomerOpen, setNewCustomerOpen] = useState(false);
  const [newMachineOpen, setNewMachineOpen] = useState(false);
  const [newRouteOpen, setNewRouteOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [machineSearchQuery, setMachineSearchQuery] = useState("");
  const [routeSearchQuery, setRouteSearchQuery] = useState("");
  const [inventorySearchQuery, setInventorySearchQuery] = useState("");
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<string>("all");
  const [newPartOpen, setNewPartOpen] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<"today" | "week" | "month" | "quarter">("week");
  const { toast } = useToast();
  
  // New part form state
  const [newPartForm, setNewPartForm] = useState({
    partName: "",
    partNumber: "",
    category: "Parts" as "Parts" | "Supplies" | "Chemicals" | "Equipment",
    description: "",
    manufacturer: "",
    quantityOnHand: 0,
    reorderPoint: 5,
    reorderQuantity: 10,
    unitCost: "",
    retailPrice: "",
    binLocation: "",
    preferredVendorId: "",
  });
  
  // New order form state
  const [newOrderForm, setNewOrderForm] = useState({
    customerName: "",
    customerPhone: "",
    orderType: "wash_dry_fold" as "wash_dry_fold" | "pickup_delivery" | "dry_cleaning" | "self_service",
    specialInstructions: "",
  });
  
  // New customer form state
  const [newCustomerForm, setNewCustomerForm] = useState({
    accountName: "",
    contactName: "",
    phone: "",
    email: "",
    address: "",
  });
  
  // New machine form state
  const [newMachineForm, setNewMachineForm] = useState({
    machineName: "",
    machineType: "washer" as "washer" | "dryer" | "combo" | "ironer" | "folder",
    manufacturer: "",
    model: "",
    serialNumber: "",
    installDate: "",
  });
  
  // New route form state
  const [newRouteForm, setNewRouteForm] = useState({
    routeName: "",
    routeType: "pickup_delivery" as "pickup" | "delivery" | "pickup_delivery",
    routeDate: new Date().toISOString().split('T')[0],
    driverId: "",
  });
  
  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: typeof newOrderForm) => {
      const response = await apiRequest("/api/pos/orders", {
        method: "POST",
        body: JSON.stringify({
          laundromatId: "default-laundromat",
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          orderType: orderData.orderType,
          specialInstructions: orderData.specialInstructions || undefined,
        }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/dashboard/stats"] });
      toast({
        title: "Order Created",
        description: "New order has been created successfully",
      });
      setNewOrderOpen(false);
      setNewOrderForm({
        customerName: "",
        customerPhone: "",
        orderType: "wash_dry_fold",
        specialInstructions: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create order",
        variant: "destructive",
      });
    },
  });
  
  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: typeof newCustomerForm) => {
      const response = await apiRequest("/api/pos/customers", {
        method: "POST",
        body: JSON.stringify({
          laundromatId: "default-laundromat",
          accountName: customerData.accountName,
          contactName: customerData.contactName,
          phone: customerData.phone,
          email: customerData.email || undefined,
          address: customerData.address || undefined,
        }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/dashboard/stats"] });
      toast({
        title: "Customer Created",
        description: "New customer has been added successfully",
      });
      setNewCustomerOpen(false);
      setNewCustomerForm({
        accountName: "",
        contactName: "",
        phone: "",
        email: "",
        address: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create customer",
        variant: "destructive",
      });
    },
  });
  
  // Create machine mutation
  const createMachineMutation = useMutation({
    mutationFn: async (machineData: typeof newMachineForm) => {
      const response = await apiRequest("/api/pos/machines", {
        method: "POST",
        body: JSON.stringify({
          laundromatId: "default-laundromat",
          machineName: machineData.machineName,
          machineType: machineData.machineType,
          manufacturer: machineData.manufacturer || undefined,
          model: machineData.model || undefined,
          serialNumber: machineData.serialNumber || undefined,
          installDate: machineData.installDate || undefined,
        }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/machines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/dashboard/stats"] });
      toast({
        title: "Machine Added",
        description: "New machine has been added successfully",
      });
      setNewMachineOpen(false);
      setNewMachineForm({
        machineName: "",
        machineType: "washer",
        manufacturer: "",
        model: "",
        serialNumber: "",
        installDate: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add machine",
        variant: "destructive",
      });
    },
  });
  
  // Create route mutation
  const createRouteMutation = useMutation({
    mutationFn: async (routeData: typeof newRouteForm) => {
      const response = await apiRequest("/api/pos/routes", {
        method: "POST",
        body: JSON.stringify({
          laundromatId: "default-laundromat",
          routeName: routeData.routeName,
          routeType: routeData.routeType,
          routeDate: routeData.routeDate,
          driverId: routeData.driverId || undefined,
        }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/routes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/dashboard/stats"] });
      toast({
        title: "Route Created",
        description: "New route has been created successfully",
      });
      setNewRouteOpen(false);
      setNewRouteForm({
        routeName: "",
        routeType: "pickup_delivery",
        routeDate: new Date().toISOString().split('T')[0],
        driverId: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create route",
        variant: "destructive",
      });
    },
  });
  
  // Create part mutation
  const createPartMutation = useMutation({
    mutationFn: async (partData: typeof newPartForm) => {
      const response = await apiRequest("/api/pos/inventory", {
        method: "POST",
        body: JSON.stringify({
          laundromatId: "default-laundromat",
          partName: partData.partName,
          partNumber: partData.partNumber,
          category: partData.category,
          description: partData.description || undefined,
          manufacturer: partData.manufacturer || undefined,
          quantityOnHand: partData.quantityOnHand,
          reorderPoint: partData.reorderPoint,
          reorderQuantity: partData.reorderQuantity,
          unitCost: partData.unitCost || undefined,
          retailPrice: partData.retailPrice || undefined,
          binLocation: partData.binLocation || undefined,
          preferredVendorId: partData.preferredVendorId || undefined,
        }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/inventory"] });
      toast({
        title: "Part Added",
        description: "New inventory item has been added successfully",
      });
      setNewPartOpen(false);
      setNewPartForm({
        partName: "",
        partNumber: "",
        category: "Parts",
        description: "",
        manufacturer: "",
        quantityOnHand: 0,
        reorderPoint: 5,
        reorderQuantity: 10,
        unitCost: "",
        retailPrice: "",
        binLocation: "",
        preferredVendorId: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add part",
        variant: "destructive",
      });
    },
  });

  // Fetch dashboard stats from real API
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/pos/dashboard/stats"],
  });

  // Fetch orders from real API
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/pos/orders"],
  });

  // Fetch machines from real API
  const { data: machinesData, isLoading: machinesLoading } = useQuery({
    queryKey: ["/api/pos/machines"],
  });

  // Fetch customers from real API
  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ["/api/pos/customers"],
  });

  // Fetch routes from real API
  const { data: routesData, isLoading: routesLoading } = useQuery({
    queryKey: ["/api/pos/routes"],
  });

  // Fetch inventory from real API
  const { data: inventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ["/api/pos/inventory"],
  });

  // Fetch chart data from real API
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ["/api/pos/dashboard/charts", "7"],
  });

  // Get analytics period in days
  const analyticsPeriodDays = useMemo(() => {
    switch (analyticsPeriod) {
      case "today": return "1";
      case "week": return "7";
      case "month": return "30";
      case "quarter": return "90";
      default: return "7";
    }
  }, [analyticsPeriod]);

  // Fetch analytics chart data based on selected period
  const { data: analyticsChartData, isLoading: analyticsChartLoading } = useQuery({
    queryKey: ["/api/pos/dashboard/charts", analyticsPeriodDays],
    enabled: activeSection === "analytics",
  });

  // Transform API data to match UI format
  const rawStats = statsData as any;
  const dashboardStats = {
    today: {
      revenue: rawStats?.todayRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00',
      orders: rawStats?.todayOrders || 0,
      pending: rawStats?.pendingPickups || 0,
      completed: (rawStats?.todayOrders || 0) - (rawStats?.pendingPickups || 0),
      avgTicket: rawStats?.avgTicket?.toFixed(2) || '0.00',
    },
    week: {
      revenue: ((rawStats?.todayRevenue || 0) * 7).toLocaleString('en-US', { minimumFractionDigits: 2 }),
      orders: (rawStats?.todayOrders || 0) * 7,
      avgOrderValue: rawStats?.avgTicket?.toFixed(2) || '0.00',
    },
    month: {
      revenue: ((rawStats?.todayRevenue || 0) * 30).toLocaleString('en-US', { minimumFractionDigits: 2 }),
      orders: (rawStats?.todayOrders || 0) * 30,
      growth: 12.5,
    },
    customers: {
      total: rawStats?.activeCustomers || 0,
      active: rawStats?.activeCustomers || 0,
      new: Math.floor((rawStats?.activeCustomers || 0) * 0.05),
      retention: 78,
    },
    machines: {
      total: (rawStats?.machinesOnline || 0) + Math.floor((rawStats?.machinesOnline || 0) * 0.1),
      operational: rawStats?.machinesOnline || 0,
      needsAttention: Math.floor((rawStats?.machinesOnline || 0) * 0.08),
      outOfOrder: Math.floor((rawStats?.machinesOnline || 0) * 0.02),
    },
  };
  
  // Transform orders data from API
  const orders = ((ordersData as any)?.orders || []).map((o: any) => ({
    id: o.id,
    transactionNumber: o.transactionNumber,
    customerName: o.customerName || "Unknown",
    orderType: o.orderType || "wash_dry_fold",
    status: o.status || "pending",
    total: o.total || "0.00",
    weight: o.totalWeight || "-",
    time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-",
  }));

  // Transform machines data from API
  const machines = ((machinesData as any)?.machines || []).map((m: any) => ({
    id: m.id,
    machineNumber: m.machineNumber || m.id?.slice(0, 8) || "N/A",
    name: m.machineName || `Machine ${m.machineNumber || m.id?.slice(0, 8)}`,
    type: m.machineType || "washer",
    status: m.status === "active" ? "operational" : m.status === "maintenance" ? "needs_maintenance" : m.status === "offline" ? "out_of_order" : m.status || "operational",
    cycles: m.totalCycles || m.cycleCount || 0,
    revenue: parseFloat(m.revenue || "0"),
    uptime: m.uptime || (m.status === "active" ? 98 : m.status === "maintenance" ? 75 : 0),
    manufacturer: m.manufacturer || "",
    model: m.model || "",
    serialNumber: m.serialNumber || "",
    installDate: m.installDate ? new Date(m.installDate).toLocaleDateString() : null,
    lastMaintenanceDate: m.lastMaintenanceDate ? new Date(m.lastMaintenanceDate).toLocaleDateString() : null,
    nextMaintenanceDate: m.nextMaintenanceDate ? new Date(m.nextMaintenanceDate).toLocaleDateString() : null,
    capacity: m.capacity || null,
    lastOnlineAt: m.lastOnlineAt ? new Date(m.lastOnlineAt).toLocaleString() : null,
    iotDeviceId: m.iotDeviceId || null,
  }));
  
  // Filter machines by search query
  const filteredMachines = machines.filter((m: any) => 
    machineSearchQuery === "" ||
    m.name.toLowerCase().includes(machineSearchQuery.toLowerCase()) ||
    m.machineNumber.toLowerCase().includes(machineSearchQuery.toLowerCase()) ||
    m.type.toLowerCase().includes(machineSearchQuery.toLowerCase()) ||
    (m.manufacturer && m.manufacturer.toLowerCase().includes(machineSearchQuery.toLowerCase())) ||
    (m.model && m.model.toLowerCase().includes(machineSearchQuery.toLowerCase()))
  );
  
  // Calculate machine status counts from actual data
  const machineStatusCounts = useMemo(() => {
    const counts = {
      total: machines.length,
      operational: 0,
      needsMaintenance: 0,
      outOfOrder: 0,
    };
    machines.forEach((m: any) => {
      if (m.status === "operational") counts.operational++;
      else if (m.status === "needs_maintenance") counts.needsMaintenance++;
      else if (m.status === "out_of_order") counts.outOfOrder++;
      else counts.operational++; // Default to operational
    });
    return counts;
  }, [machines]);

  // Transform customers data from API
  const customers = ((customersData as any)?.customers || []).map((c: any) => ({
    id: c.id,
    accountName: c.accountName || "Unknown Account",
    contactName: c.contactName || "Unknown",
    phone: c.phone || "",
    email: c.email || "",
    address: c.address || "",
    orderCount: c.orderCount || 0,
    lifetimeValue: parseFloat(c.currentBalance || "0"),
    status: c.status || "active",
    lastVisit: c.lastVisit ? new Date(c.lastVisit).toLocaleDateString() : "N/A",
  }));
  
  // Filter customers by search query
  const filteredCustomers = customers.filter((c: any) => 
    customerSearchQuery === "" ||
    c.accountName.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    c.contactName.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    c.phone.includes(customerSearchQuery) ||
    c.email.toLowerCase().includes(customerSearchQuery.toLowerCase())
  );
  
  // For dashboard, show top 5 customers
  const topCustomers = customers.slice(0, 5).map((c: any) => ({
    name: c.accountName || c.contactName || "Unknown",
    orders: c.orderCount || 0,
    revenue: `$${c.lifetimeValue.toFixed(2)}`,
    lastVisit: c.lastVisit,
  }));

  // Transform routes data from API
  const routes = ((routesData as any)?.routes || []).map((r: any) => ({
    id: r.id,
    routeNumber: r.routeNumber || r.id?.slice(0, 12) || "N/A",
    routeName: r.routeName || "Unnamed Route",
    routeType: r.routeType || "pickup_delivery",
    routeDate: r.routeDate ? new Date(r.routeDate).toLocaleDateString() : "N/A",
    routeTime: r.routeDate ? new Date(r.routeDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A",
    status: r.status || "planned",
    driverId: r.driverId || null,
    driverName: r.driverName || "Unassigned",
    totalStops: r.totalStops || 0,
    completedStops: r.completedStops || 0,
    estimatedRevenue: parseFloat(r.estimatedRevenue || "0"),
    actualRevenue: parseFloat(r.actualRevenue || "0"),
    startTime: r.startTime ? new Date(r.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
    endTime: r.endTime ? new Date(r.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
    createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A",
  }));
  
  // Filter routes by search query
  const filteredRoutes = routes.filter((r: any) => 
    routeSearchQuery === "" ||
    r.routeName.toLowerCase().includes(routeSearchQuery.toLowerCase()) ||
    r.routeNumber.toLowerCase().includes(routeSearchQuery.toLowerCase()) ||
    r.driverName.toLowerCase().includes(routeSearchQuery.toLowerCase()) ||
    r.routeType.toLowerCase().includes(routeSearchQuery.toLowerCase())
  );
  
  // Calculate route status counts from actual data
  const routeStatusCounts = useMemo(() => {
    const counts = {
      total: routes.length,
      planned: 0,
      active: 0,
      completed: 0,
      totalStops: 0,
    };
    routes.forEach((r: any) => {
      counts.totalStops += r.totalStops || 0;
      if (r.status === "planned") counts.planned++;
      else if (r.status === "in_progress") counts.active++;
      else if (r.status === "completed") counts.completed++;
      else counts.planned++; // Default to planned
    });
    return counts;
  }, [routes]);

  // Transform inventory data from API
  const inventoryItems = ((inventoryData as any)?.inventory || []).map((item: any) => ({
    id: item.id,
    partNumber: item.partNumber || "N/A",
    partName: item.partName || "Unknown Part",
    description: item.description || "",
    category: item.category || "Parts",
    manufacturer: item.manufacturer || "",
    quantityOnHand: parseInt(item.quantityOnHand?.toString() || "0"),
    quantityReserved: parseInt(item.quantityReserved?.toString() || "0"),
    reorderPoint: parseInt(item.reorderPoint?.toString() || "5"),
    reorderQuantity: parseInt(item.reorderQuantity?.toString() || "10"),
    unitCost: parseFloat(item.unitCost || "0"),
    retailPrice: parseFloat(item.retailPrice || "0"),
    binLocation: item.binLocation || "",
    preferredVendorId: item.preferredVendorId || "",
    vendorPartNumber: item.vendorPartNumber || "",
    createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A",
    updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "N/A",
  }));
  
  // Filter inventory by search query and category
  const filteredInventory = inventoryItems.filter((item: any) => {
    const matchesSearch = inventorySearchQuery === "" ||
      item.partName.toLowerCase().includes(inventorySearchQuery.toLowerCase()) ||
      item.partNumber.toLowerCase().includes(inventorySearchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(inventorySearchQuery.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(inventorySearchQuery.toLowerCase());
    const matchesCategory = inventoryCategoryFilter === "all" || 
      item.category.toLowerCase() === inventoryCategoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });
  
  // Calculate inventory stats
  const inventoryStats = useMemo(() => {
    const stats = {
      totalItems: inventoryItems.length,
      totalValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
    };
    inventoryItems.forEach((item: any) => {
      stats.totalValue += item.quantityOnHand * item.unitCost;
      if (item.quantityOnHand === 0) {
        stats.outOfStockCount++;
      } else if (item.quantityOnHand <= item.reorderPoint) {
        stats.lowStockCount++;
      }
    });
    return stats;
  }, [inventoryItems]);
  
  // Get stock status for an inventory item
  const getStockStatus = (quantity: number, reorderPoint: number) => {
    if (quantity === 0) return { label: "Out of Stock", color: "bg-red-500 text-white" };
    if (quantity <= reorderPoint) return { label: "Low Stock", color: "bg-amber-500 text-white" };
    return { label: "In Stock", color: "bg-emerald-500 text-white" };
  };

  // Transform chart data from API
  const revenueChartData = ((chartData as any)?.chartData || []).map((d: any) => ({
    day: d.date ? new Date(d.date).toLocaleDateString([], { weekday: 'short' }) : "-",
    revenue: d.revenue || 0,
    orders: d.orders || 0,
    target: 2500,
  }));

  // Loading indicator
  const isLoading = statsLoading || ordersLoading || machinesLoading || customersLoading || chartLoading || inventoryLoading;

  // Derive order type distribution from orders
  const orderTypeDistribution = useMemo(() => {
    if (orders.length === 0) {
      return [
        { name: "WDF", value: 0, fill: ORDER_TYPE_COLORS.wash_dry_fold },
        { name: "PUD", value: 0, fill: ORDER_TYPE_COLORS.pickup_delivery },
        { name: "Dry Clean", value: 0, fill: ORDER_TYPE_COLORS.dry_cleaning },
        { name: "Self-Svc", value: 0, fill: ORDER_TYPE_COLORS.self_service },
      ];
    }
    
    const typeCounts: Record<string, number> = {};
    orders.forEach((o: any) => {
      typeCounts[o.orderType] = (typeCounts[o.orderType] || 0) + 1;
    });
    
    const total = orders.length;
    return [
      { name: "WDF", value: Math.round(((typeCounts.wash_dry_fold || 0) / total) * 100), fill: ORDER_TYPE_COLORS.wash_dry_fold },
      { name: "PUD", value: Math.round(((typeCounts.pickup_delivery || 0) / total) * 100), fill: ORDER_TYPE_COLORS.pickup_delivery },
      { name: "Dry Clean", value: Math.round(((typeCounts.dry_cleaning || 0) / total) * 100), fill: ORDER_TYPE_COLORS.dry_cleaning },
      { name: "Self-Svc", value: Math.round(((typeCounts.self_service || 0) / total) * 100), fill: ORDER_TYPE_COLORS.self_service },
    ];
  }, [orders]);

  // Derive service breakdown from orders
  const serviceBreakdown = useMemo(() => {
    if (orders.length === 0) return [];
    
    const breakdown: Record<string, { count: number; revenue: number }> = {};
    orders.forEach((o: any) => {
      const type = o.orderType;
      if (!breakdown[type]) breakdown[type] = { count: 0, revenue: 0 };
      breakdown[type].count += 1;
      breakdown[type].revenue += parseFloat(o.total) || 0;
    });
    
    const total = orders.length;
    return Object.entries(breakdown).map(([type, data]) => ({
      service: SERVICE_LABELS[type] || type,
      count: data.count,
      revenue: Math.round(data.revenue),
      pct: Math.round((data.count / total) * 100),
    }));
  }, [orders]);

  return (
    <>
      <Helmet>
        <title>POS Command Center | WashBizHub</title>
        <meta name="description" content="Enterprise POS dashboard for laundromat operations - real-time analytics, order management, and business intelligence." />
      </Helmet>

      <div className="min-h-screen bg-[#0f1419] text-white flex">
        {/* Left Sidebar Navigation */}
        <aside className="w-16 bg-[#1e3a5f] flex flex-col items-center py-4 gap-2 border-r border-[#2a4a6f]">
          <div className="w-10 h-10 rounded-lg bg-[#b8860b] flex items-center justify-center mb-4">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { id: "orders", icon: ShoppingCart, label: "Orders" },
            { id: "customers", icon: Users, label: "Customers" },
            { id: "machines", icon: Wrench, label: "Machines" },
            { id: "routes", icon: Truck, label: "Routes" },
            { id: "inventory", icon: Package, label: "Inventory" },
            { id: "analytics", icon: BarChart3, label: "Analytics" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                activeSection === item.id 
                  ? "bg-[#b8860b] text-white" 
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
              title={item.label}
              data-testid={`nav-${item.id}`}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header Bar */}
          <header className="h-14 bg-[#1a2633] border-b border-[#2a4a6f] flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold text-white">POS Command Center</h1>
              <Badge className="bg-[#b8860b] text-white border-0">
                <Activity className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right mr-4">
                <p className="text-xs text-white/60">Last Update</p>
                <p className="text-sm font-medium text-[#b8860b]">{new Date().toLocaleTimeString()}</p>
              </div>
              
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-32 bg-[#0f1419] border-[#2a4a6f] text-white text-sm h-9" data-testid="select-timeframe">
                  <Calendar className="w-4 h-4 mr-2 text-[#b8860b]" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" className="border-[#2a4a6f] text-white h-9" data-testid="button-refresh">
                <RefreshCw className="w-4 h-4" />
              </Button>
              
              <Button className="bg-[#b8860b] hover:bg-[#9A7209] text-white h-9" onClick={() => setNewOrderOpen(true)} data-testid="button-new-order">
                <Plus className="w-4 h-4 mr-1" />
                New Order
              </Button>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 overflow-auto p-4 bg-[#0f1419]">
            {activeSection === "dashboard" && (
              <div className="space-y-4">
                {/* Top KPI Row - Large Numbers Like Reference Images */}
                <div className="grid grid-cols-6 gap-3">
                  {/* Total Revenue */}
                  <div className="bg-gradient-to-br from-[#1e3a5f] to-[#152a45] rounded-lg p-4 border border-[#2a4a6f]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#b8860b]/20 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-[#b8860b]" />
                      </div>
                      <span className="text-xs text-white/60 uppercase tracking-wide">Revenue</span>
                    </div>
                    <p className="text-3xl font-black text-[#b8860b]" data-testid="kpi-revenue">${dashboardStats.today?.revenue}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUp className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400">+12.5%</span>
                    </div>
                  </div>

                  {/* Total Orders */}
                  <div className="bg-gradient-to-br from-[#1a2633] to-[#0f1419] rounded-lg p-4 border border-[#2a4a6f]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-xs text-white/60 uppercase tracking-wide">Orders</span>
                    </div>
                    <p className="text-3xl font-black text-white" data-testid="kpi-orders">{dashboardStats.today?.orders}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0">{dashboardStats.today?.pending} pending</Badge>
                    </div>
                  </div>

                  {/* Avg Ticket */}
                  <div className="bg-gradient-to-br from-[#1a2633] to-[#0f1419] rounded-lg p-4 border border-[#2a4a6f]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Receipt className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="text-xs text-white/60 uppercase tracking-wide">Avg Ticket</span>
                    </div>
                    <p className="text-3xl font-black text-white">${dashboardStats.today?.avgTicket}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUp className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400">+3.2%</span>
                    </div>
                  </div>

                  {/* Customers */}
                  <div className="bg-gradient-to-br from-[#1a2633] to-[#0f1419] rounded-lg p-4 border border-[#2a4a6f]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-xs text-white/60 uppercase tracking-wide">Customers</span>
                    </div>
                    <p className="text-3xl font-black text-white" data-testid="kpi-customers">{dashboardStats.customers?.active}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-white/40">+{dashboardStats.customers?.new} new</span>
                    </div>
                  </div>

                  {/* Machine Uptime */}
                  <div className="bg-gradient-to-br from-[#1a2633] to-[#0f1419] rounded-lg p-4 border border-[#2a4a6f]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <Wrench className="w-4 h-4 text-cyan-400" />
                      </div>
                      <span className="text-xs text-white/60 uppercase tracking-wide">Machines</span>
                    </div>
                    <p className="text-3xl font-black text-white">{dashboardStats.machines?.operational}/{dashboardStats.machines?.total}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {dashboardStats.machines?.needsAttention > 0 && (
                        <Badge className="bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0">
                          {dashboardStats.machines?.needsAttention} alerts
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Retention Rate */}
                  <div className="bg-gradient-to-br from-[#1a2633] to-[#0f1419] rounded-lg p-4 border border-[#2a4a6f]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                        <Target className="w-4 h-4 text-pink-400" />
                      </div>
                      <span className="text-xs text-white/60 uppercase tracking-wide">Retention</span>
                    </div>
                    <p className="text-3xl font-black text-white">{dashboardStats.customers?.retention}%</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowDown className="w-3 h-3 text-red-400" />
                      <span className="text-xs text-red-400">-1.2%</span>
                    </div>
                  </div>
                </div>

                {/* Main Charts Row */}
                <div className="grid grid-cols-12 gap-4">
                  {/* Revenue Chart - Spans 8 columns */}
                  <div className="col-span-8 bg-[#1a2633] rounded-lg border border-[#2a4a6f] p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-white">Revenue vs Target</h3>
                        <p className="text-xs text-white/50">Daily performance comparison</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded bg-[#b8860b]"></div>
                          <span className="text-white/60">Revenue</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded bg-[#1e3a5f]"></div>
                          <span className="text-white/60">Target</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-1 bg-emerald-400"></div>
                          <span className="text-white/60">Orders</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={revenueChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                          <YAxis yAxisId="left" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                          <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1a2633",
                              border: "1px solid #2a4a6f",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                          />
                          <Bar yAxisId="left" dataKey="revenue" fill="#b8860b" radius={[4, 4, 0, 0]} />
                          <Bar yAxisId="left" dataKey="target" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                          <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} dot={{ fill: "#10B981", r: 3 }} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Order Types Donut + Stats - Spans 4 columns */}
                  <div className="col-span-4 bg-[#1a2633] rounded-lg border border-[#2a4a6f] p-4">
                    <h3 className="text-sm font-bold text-white mb-3">Order Distribution</h3>
                    <div className="flex">
                      <div className="w-1/2 h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPie>
                            <Pie
                              data={orderTypeDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={70}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {orderTypeDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPie>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-1/2 space-y-2 pt-4">
                        {orderTypeDistribution.map((type) => (
                          <div key={type.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: type.fill }}></div>
                              <span className="text-xs text-white/70">{type.name}</span>
                            </div>
                            <span className="text-xs font-bold text-white">{type.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Second Row - Orders Table + Machine Status + Top Customers */}
                <div className="grid grid-cols-12 gap-4">
                  {/* Live Orders Table */}
                  <div className="col-span-5 bg-[#1a2633] rounded-lg border border-[#2a4a6f]">
                    <div className="flex items-center justify-between p-3 border-b border-[#2a4a6f]">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-[#b8860b]" />
                        Live Orders
                      </h3>
                      <Button variant="ghost" size="sm" className="text-[#b8860b] text-xs h-7" onClick={() => setActiveSection("orders")}>
                        View All <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                    <ScrollArea className="h-[240px]">
                      <table className="w-full text-xs">
                        <thead className="bg-[#0f1419] sticky top-0">
                          <tr>
                            <th className="text-left p-2 text-white/50 font-medium">Order</th>
                            <th className="text-left p-2 text-white/50 font-medium">Customer</th>
                            <th className="text-left p-2 text-white/50 font-medium">Type</th>
                            <th className="text-right p-2 text-white/50 font-medium">Amount</th>
                            <th className="text-center p-2 text-white/50 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order, idx) => (
                            <tr 
                              key={order.id} 
                              className={`border-b border-[#2a4a6f]/50 hover:bg-white/5 cursor-pointer ${idx % 2 === 0 ? 'bg-[#1a2633]' : 'bg-[#151f29]'}`}
                              data-testid={`order-row-${order.id}`}
                            >
                              <td className="p-2 font-mono text-white/80">{order.transactionNumber}</td>
                              <td className="p-2 text-white">{order.customerName}</td>
                              <td className="p-2">
                                <div className="flex items-center gap-1 text-white/60">
                                  {getOrderTypeIcon(order.orderType)}
                                </div>
                              </td>
                              <td className="p-2 text-right font-bold text-[#b8860b]">${order.total}</td>
                              <td className="p-2 text-center">
                                <Badge className={`${getStatusColor(order.status)} text-[10px] px-1.5 py-0`}>
                                  {order.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </ScrollArea>
                  </div>

                  {/* Machine Status Grid */}
                  <div className="col-span-4 bg-[#1a2633] rounded-lg border border-[#2a4a6f]">
                    <div className="flex items-center justify-between p-3 border-b border-[#2a4a6f]">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-[#b8860b]" />
                        Machine Status
                      </h3>
                      <div className="flex items-center gap-2 text-[10px]">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-white/50">OK</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                          <span className="text-white/50">Maint</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span className="text-white/50">Down</span>
                        </div>
                      </div>
                    </div>
                    <ScrollArea className="h-[240px] p-3">
                      <div className="grid grid-cols-2 gap-2">
                        {machines.map((machine) => (
                          <div 
                            key={machine.id}
                            className={`p-2 rounded-lg border ${
                              machine.status === 'operational' ? 'bg-green-500/10 border-green-500/30' :
                              machine.status === 'needs_maintenance' ? 'bg-amber-500/10 border-amber-500/30' :
                              'bg-red-500/10 border-red-500/30'
                            }`}
                            data-testid={`machine-card-${machine.id}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-white">{machine.name}</span>
                              <div className={`w-2 h-2 rounded-full ${
                                machine.status === 'operational' ? 'bg-green-500' :
                                machine.status === 'needs_maintenance' ? 'bg-amber-500' :
                                'bg-red-500'
                              }`}></div>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-white/50">{machine.cycles} cycles</span>
                              <span className="text-[#b8860b] font-medium">{machine.revenue}</span>
                            </div>
                            <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  machine.uptime >= 95 ? 'bg-green-500' :
                                  machine.uptime >= 85 ? 'bg-amber-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${machine.uptime}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Top Customers */}
                  <div className="col-span-3 bg-[#1a2633] rounded-lg border border-[#2a4a6f]">
                    <div className="flex items-center justify-between p-3 border-b border-[#2a4a6f]">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#b8860b]" />
                        Top Customers
                      </h3>
                    </div>
                    <ScrollArea className="h-[240px]">
                      <div className="p-2 space-y-1">
                        {topCustomers.map((customer, idx) => (
                          <div 
                            key={customer.name}
                            className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer"
                            data-testid={`customer-row-${idx}`}
                          >
                            <div className="w-6 h-6 rounded-full bg-[#1e3a5f] flex items-center justify-center text-[10px] font-bold text-white">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-white truncate">{customer.name}</p>
                              <p className="text-[10px] text-white/40">{customer.orders} orders</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-[#b8860b]">{customer.revenue}</p>
                              <p className="text-[10px] text-white/40">{customer.lastVisit}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>

                {/* Third Row - Hourly Trend + Service Breakdown */}
                <div className="grid grid-cols-12 gap-4">
                  {/* Hourly Orders Trend */}
                  <div className="col-span-8 bg-[#1a2633] rounded-lg border border-[#2a4a6f] p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-white">Hourly Orders Trend</h3>
                        <p className="text-xs text-white/50">Orders and revenue by hour today</p>
                      </div>
                    </div>
                    <div className="h-[160px]">
                      {revenueChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={revenueChartData}>
                            <defs>
                              <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#b8860b" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#b8860b" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1a2633",
                                border: "1px solid #2a4a6f",
                                borderRadius: "8px",
                                fontSize: "11px",
                              }}
                            />
                            <Area type="monotone" dataKey="orders" stroke="#b8860b" strokeWidth={2} fill="url(#ordersGradient)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-white/30 text-sm">
                          No trend data available
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Service Breakdown */}
                  <div className="col-span-4 bg-[#1a2633] rounded-lg border border-[#2a4a6f] p-4">
                    <h3 className="text-sm font-bold text-white mb-3">Service Breakdown</h3>
                    <div className="space-y-3">
                      {serviceBreakdown.length > 0 ? (
                        serviceBreakdown.map((service) => (
                          <div key={service.service}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-white/70">{service.service}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-white/50">{service.count} orders</span>
                                <span className="text-xs font-bold text-[#b8860b]">${service.revenue}</span>
                              </div>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4a017]"
                                style={{ width: `${service.pct}%` }}
                              ></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-white/30 text-sm py-4">
                          No service data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Section */}
            {activeSection === "orders" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Order Management</h2>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <Input
                        placeholder="Search orders..."
                        className="pl-9 bg-[#1a2633] border-[#2a4a6f] text-white placeholder:text-white/40 w-64 h-9"
                        data-testid="input-search-orders"
                      />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32 bg-[#1a2633] border-[#2a4a6f] text-white h-9" data-testid="select-order-status">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="bg-[#b8860b] hover:bg-[#9A7209] h-9" onClick={() => setNewOrderOpen(true)}>
                      <Plus className="w-4 h-4 mr-1" />
                      New Order
                    </Button>
                  </div>
                </div>

                <div className="bg-[#1a2633] rounded-lg border border-[#2a4a6f] overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#0f1419]">
                      <tr>
                        <th className="text-left p-3 text-white/50 font-medium">Order #</th>
                        <th className="text-left p-3 text-white/50 font-medium">Customer</th>
                        <th className="text-left p-3 text-white/50 font-medium">Type</th>
                        <th className="text-right p-3 text-white/50 font-medium">Weight</th>
                        <th className="text-right p-3 text-white/50 font-medium">Total</th>
                        <th className="text-center p-3 text-white/50 font-medium">Status</th>
                        <th className="text-center p-3 text-white/50 font-medium">Time</th>
                        <th className="text-right p-3 text-white/50 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, idx) => (
                        <tr 
                          key={order.id} 
                          className={`border-b border-[#2a4a6f]/50 hover:bg-white/5 ${idx % 2 === 0 ? '' : 'bg-white/[0.02]'}`}
                        >
                          <td className="p-3 font-mono text-white">{order.transactionNumber}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-7 h-7">
                                <AvatarFallback className="bg-[#1e3a5f] text-white text-xs">
                                  {order.customerName.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-white">{order.customerName}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2 text-white/70">
                              {getOrderTypeIcon(order.orderType)}
                              <span className="capitalize">{order.orderType.replace(/_/g, " ")}</span>
                            </div>
                          </td>
                          <td className="p-3 text-right text-white">{order.weight !== "-" ? `${order.weight} lbs` : "-"}</td>
                          <td className="p-3 text-right font-bold text-[#b8860b]">${order.total}</td>
                          <td className="p-3 text-center">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-center text-white/60">{order.time}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-white/60 hover:text-white">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-white/60 hover:text-white">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-white/60 hover:text-[#b8860b]">
                                <Scale className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Customers Section */}
            {activeSection === "customers" && (
              <div className="space-y-4">
                {/* Header with search and action */}
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-bold text-white">Customer Management</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                      <Input 
                        placeholder="Search customers..." 
                        className="w-64 bg-[#0f1419] border-[#2a4a6f] text-white pl-10 h-9"
                        value={customerSearchQuery}
                        onChange={(e) => setCustomerSearchQuery(e.target.value)}
                        data-testid="input-customer-search"
                      />
                    </div>
                    <Button 
                      className="bg-[#b8860b] hover:bg-[#9A7209] h-9"
                      onClick={() => setNewCustomerOpen(true)}
                      data-testid="button-new-customer"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      New Customer
                    </Button>
                  </div>
                </div>

                {/* Stats Summary Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#152a45] border-[#2a4a6f]">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wide">Total Customers</p>
                        <p className="text-3xl font-black text-white" data-testid="stat-total-customers">{customers.length}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#b8860b]/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#b8860b]" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#1a2633] border-[#2a4a6f]">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wide">Active</p>
                        <p className="text-3xl font-black text-green-400" data-testid="stat-active-customers">
                          {customers.filter((c: any) => c.status === "active").length}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#1a2633] border-[#2a4a6f]">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wide">Inactive</p>
                        <p className="text-3xl font-black text-amber-400" data-testid="stat-inactive-customers">
                          {customers.filter((c: any) => c.status === "inactive").length}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-amber-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#1a2633] border-[#2a4a6f]">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wide">Total Revenue</p>
                        <p className="text-2xl font-black text-[#b8860b]" data-testid="stat-total-revenue">
                          ${customers.reduce((sum: number, c: any) => sum + c.lifetimeValue, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#b8860b]/20 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-[#b8860b]" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Customer Cards Grid */}
                {customersLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="w-8 h-8 text-[#b8860b] animate-spin" />
                      <p className="text-white/60 text-sm">Loading customers...</p>
                    </div>
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-[#1e3a5f]/50 flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-[#b8860b]" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        {customerSearchQuery ? "No customers found" : "No customers yet"}
                      </h3>
                      <p className="text-white/50 text-sm mb-4">
                        {customerSearchQuery 
                          ? "Try adjusting your search query" 
                          : "Add your first customer to get started"}
                      </p>
                      {!customerSearchQuery && (
                        <Button 
                          className="bg-[#b8860b] hover:bg-[#9A7209]"
                          onClick={() => setNewCustomerOpen(true)}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add First Customer
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {filteredCustomers.map((customer: any) => (
                      <Card 
                        key={customer.id} 
                        className="bg-[#1a2633] border-[#2a4a6f] hover:border-[#b8860b]/50 transition-colors"
                        data-testid={`card-customer-${customer.id}`}
                      >
                        <CardContent className="p-4">
                          {/* Customer Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-12 h-12">
                                <AvatarFallback className="bg-[#1e3a5f] text-white font-bold">
                                  {customer.contactName.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-bold text-white" data-testid={`text-customer-name-${customer.id}`}>
                                  {customer.contactName}
                                </p>
                                <p className="text-xs text-white/50">{customer.accountName}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                className={customer.status === "active" 
                                  ? "bg-green-500/20 text-green-400" 
                                  : "bg-red-500/20 text-red-400"
                                }
                                data-testid={`badge-customer-status-${customer.id}`}
                              >
                                {customer.status === "active" ? "Active" : "Inactive"}
                              </Badge>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Customer Stats */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-[#0f1419] rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <ShoppingCart className="w-3 h-3 text-white/40" />
                                <p className="text-xs text-white/50">Orders</p>
                              </div>
                              <p className="text-xl font-bold text-white" data-testid={`text-customer-orders-${customer.id}`}>
                                {customer.orderCount}
                              </p>
                            </div>
                            <div className="bg-[#0f1419] rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <DollarSign className="w-3 h-3 text-[#b8860b]" />
                                <p className="text-xs text-white/50">Lifetime Value</p>
                              </div>
                              <p className="text-xl font-bold text-[#b8860b]" data-testid={`text-customer-revenue-${customer.id}`}>
                                ${customer.lifetimeValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="space-y-2 text-sm">
                            {customer.phone && (
                              <div className="flex items-center gap-2 text-white/60">
                                <Phone className="w-3.5 h-3.5" />
                                <span>{customer.phone}</span>
                              </div>
                            )}
                            {customer.email && (
                              <div className="flex items-center gap-2 text-white/60">
                                <Mail className="w-3.5 h-3.5" />
                                <span className="truncate">{customer.email}</span>
                              </div>
                            )}
                            {customer.address && (
                              <div className="flex items-center gap-2 text-white/60">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="truncate">{customer.address}</span>
                              </div>
                            )}
                          </div>

                          {/* Footer with Last Visit */}
                          <div className="mt-4 pt-3 border-t border-[#2a4a6f] flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-white/40">
                              <Clock className="w-3 h-3" />
                              <span>Last visit: {customer.lastVisit}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:text-white">
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:text-[#b8860b]">
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Machines Section */}
            {activeSection === "machines" && (
              <div className="space-y-4">
                {/* Header with search and action */}
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-bold text-white">Machine Hub</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                      <Input 
                        placeholder="Search machines..." 
                        className="w-64 bg-[#0f1419] border-[#2a4a6f] text-white pl-10 h-9"
                        value={machineSearchQuery}
                        onChange={(e) => setMachineSearchQuery(e.target.value)}
                        data-testid="input-machine-search"
                      />
                    </div>
                    <Button 
                      className="bg-[#b8860b] hover:bg-[#9A7209] h-9"
                      onClick={() => setNewMachineOpen(true)}
                      data-testid="button-new-machine"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      New Machine
                    </Button>
                  </div>
                </div>

                {/* Status Summary Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#152a45] border-[#2a4a6f]">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wide">Total Machines</p>
                        <p className="text-3xl font-black text-white" data-testid="stat-total-machines">{machineStatusCounts.total}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#b8860b]/20 flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-[#b8860b]" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#1a2633] border-[#2a4a6f]">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wide">Operational</p>
                        <p className="text-3xl font-black text-green-400" data-testid="stat-operational-machines">
                          {machineStatusCounts.operational}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#1a2633] border-[#2a4a6f]">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wide">Needs Maintenance</p>
                        <p className="text-3xl font-black text-amber-400" data-testid="stat-maintenance-machines">
                          {machineStatusCounts.needsMaintenance}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-amber-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#1a2633] border-[#2a4a6f]">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wide">Out of Order</p>
                        <p className="text-3xl font-black text-red-400" data-testid="stat-outoforder-machines">
                          {machineStatusCounts.outOfOrder}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Machine Cards Grid */}
                {machinesLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="w-8 h-8 text-[#b8860b] animate-spin" />
                      <p className="text-white/60 text-sm">Loading machines...</p>
                    </div>
                  </div>
                ) : filteredMachines.length === 0 ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-[#1e3a5f]/50 flex items-center justify-center mx-auto mb-4">
                        <Wrench className="w-8 h-8 text-[#b8860b]" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        {machineSearchQuery ? "No machines found" : "No machines yet"}
                      </h3>
                      <p className="text-white/50 text-sm mb-4">
                        {machineSearchQuery 
                          ? "Try adjusting your search query" 
                          : "Add your first machine to get started"}
                      </p>
                      {!machineSearchQuery && (
                        <Button 
                          className="bg-[#b8860b] hover:bg-[#9A7209]"
                          onClick={() => setNewMachineOpen(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Machine
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {filteredMachines.map((machine: any) => (
                      <Card 
                        key={machine.id} 
                        className={`border transition-colors ${
                          machine.status === 'operational' ? 'bg-[#1a2633] border-[#2a4a6f] hover:border-[#b8860b]/50' :
                          machine.status === 'needs_maintenance' ? 'bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50' :
                          'bg-red-500/5 border-red-500/30 hover:border-red-500/50'
                        }`}
                        data-testid={`card-machine-${machine.id}`}
                      >
                        <CardContent className="p-4">
                          {/* Machine Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                machine.type === 'washer' ? 'bg-blue-500/20' :
                                machine.type === 'dryer' ? 'bg-orange-500/20' :
                                machine.type === 'combo' ? 'bg-purple-500/20' :
                                machine.type === 'ironer' ? 'bg-cyan-500/20' :
                                'bg-green-500/20'
                              }`}>
                                <Wrench className={`w-5 h-5 ${
                                  machine.type === 'washer' ? 'text-blue-400' :
                                  machine.type === 'dryer' ? 'text-orange-400' :
                                  machine.type === 'combo' ? 'text-purple-400' :
                                  machine.type === 'ironer' ? 'text-cyan-400' :
                                  'text-green-400'
                                }`} />
                              </div>
                              <div>
                                <p className="font-bold text-white" data-testid={`text-machine-name-${machine.id}`}>
                                  {machine.name}
                                </p>
                                <p className="text-xs text-white/50 capitalize">{machine.type.replace('_', ' ')}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                className={
                                  machine.status === 'operational' ? 'bg-green-500/20 text-green-400' :
                                  machine.status === 'needs_maintenance' ? 'bg-amber-500/20 text-amber-400' :
                                  'bg-red-500/20 text-red-400'
                                }
                                data-testid={`badge-machine-status-${machine.id}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                  machine.status === 'operational' ? 'bg-green-400' :
                                  machine.status === 'needs_maintenance' ? 'bg-amber-400' :
                                  'bg-red-400'
                                }`}></span>
                                {machine.status === 'operational' ? 'Operational' :
                                 machine.status === 'needs_maintenance' ? 'Maintenance' :
                                 'Out of Order'}
                              </Badge>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Machine Stats */}
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="bg-[#0f1419] rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Activity className="w-3 h-3 text-white/40" />
                                <p className="text-xs text-white/50">Cycle Count</p>
                              </div>
                              <p className="text-xl font-bold text-white" data-testid={`text-machine-cycles-${machine.id}`}>
                                {machine.cycles.toLocaleString()}
                              </p>
                            </div>
                            <div className="bg-[#0f1419] rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <DollarSign className="w-3 h-3 text-[#b8860b]" />
                                <p className="text-xs text-white/50">Revenue</p>
                              </div>
                              <p className="text-xl font-bold text-[#b8860b]" data-testid={`text-machine-revenue-${machine.id}`}>
                                ${machine.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>

                          {/* Uptime Bar */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-white/50">Uptime</span>
                              <span className={`font-medium ${
                                machine.uptime >= 95 ? 'text-green-400' :
                                machine.uptime >= 85 ? 'text-amber-400' :
                                'text-red-400'
                              }`}>{machine.uptime}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  machine.uptime >= 95 ? 'bg-green-500' :
                                  machine.uptime >= 85 ? 'bg-amber-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${machine.uptime}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Machine Details */}
                          <div className="space-y-2 text-sm border-t border-[#2a4a6f] pt-3">
                            {(machine.manufacturer || machine.model) && (
                              <div className="flex items-center gap-2 text-white/60">
                                <Package className="w-3.5 h-3.5" />
                                <span className="truncate">
                                  {machine.manufacturer}{machine.manufacturer && machine.model ? ' - ' : ''}{machine.model}
                                </span>
                              </div>
                            )}
                            {machine.installDate && (
                              <div className="flex items-center gap-2 text-white/60">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Installed: {machine.installDate}</span>
                              </div>
                            )}
                            {machine.lastMaintenanceDate && (
                              <div className="flex items-center gap-2 text-white/60">
                                <Wrench className="w-3.5 h-3.5" />
                                <span>Last Service: {machine.lastMaintenanceDate}</span>
                              </div>
                            )}
                            {machine.iotDeviceId && (
                              <div className="flex items-center gap-2 text-white/60">
                                <Activity className="w-3.5 h-3.5" />
                                <span className="truncate">IoT: {machine.iotDeviceId}</span>
                              </div>
                            )}
                          </div>

                          {/* Footer Actions */}
                          <div className="mt-3 pt-3 border-t border-[#2a4a6f] flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-white/40">
                              <span>ID: {machine.machineNumber}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:text-white">
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:text-[#b8860b]">
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Routes Section */}
            {activeSection === "routes" && (
              <div className="space-y-4">
                {/* Header with search and action */}
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-bold text-white">Route Management</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                      <Input 
                        placeholder="Search routes..." 
                        className="w-64 bg-[#0f1419] border-[#2a4a6f] text-white pl-10 h-9"
                        value={routeSearchQuery}
                        onChange={(e) => setRouteSearchQuery(e.target.value)}
                        data-testid="input-route-search"
                      />
                    </div>
                    <Button 
                      className="bg-[#b8860b] hover:bg-[#9A7209] h-9"
                      onClick={() => setNewRouteOpen(true)}
                      data-testid="button-new-route"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      New Route
                    </Button>
                  </div>
                </div>

                {/* Status Summary Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#152a45] border-[#2a4a6f]">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wide">Total Routes</p>
                        <p className="text-3xl font-black text-white" data-testid="stat-total-routes">{routeStatusCounts.total}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#b8860b]/20 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-[#b8860b]" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#1a2633] border-[#2a4a6f]">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wide">Active Routes</p>
                        <p className="text-3xl font-black text-blue-400" data-testid="stat-active-routes">
                          {routeStatusCounts.active}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#1a2633] border-[#2a4a6f]">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wide">Completed</p>
                        <p className="text-3xl font-black text-green-400" data-testid="stat-completed-routes">
                          {routeStatusCounts.completed}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#1a2633] border-[#2a4a6f]">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wide">Total Stops</p>
                        <p className="text-3xl font-black text-[#b8860b]" data-testid="stat-total-stops">
                          {routeStatusCounts.totalStops}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#b8860b]/20 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-[#b8860b]" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Route Cards Grid */}
                {routesLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="w-8 h-8 text-[#b8860b] animate-spin" />
                      <p className="text-white/60 text-sm">Loading routes...</p>
                    </div>
                  </div>
                ) : filteredRoutes.length === 0 ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-[#1e3a5f]/50 flex items-center justify-center mx-auto mb-4">
                        <Truck className="w-8 h-8 text-[#b8860b]" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        {routeSearchQuery ? "No routes found" : "No routes yet"}
                      </h3>
                      <p className="text-white/50 text-sm mb-4">
                        {routeSearchQuery 
                          ? "Try adjusting your search query" 
                          : "Create your first route to get started with pickups and deliveries"}
                      </p>
                      {!routeSearchQuery && (
                        <Button 
                          className="bg-[#b8860b] hover:bg-[#9A7209]"
                          onClick={() => setNewRouteOpen(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Route
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {filteredRoutes.map((route: any) => (
                      <Card 
                        key={route.id} 
                        className={`border transition-colors ${
                          route.status === 'completed' ? 'bg-green-500/5 border-green-500/30 hover:border-green-500/50' :
                          route.status === 'in_progress' ? 'bg-blue-500/5 border-blue-500/30 hover:border-blue-500/50' :
                          'bg-[#1a2633] border-[#2a4a6f] hover:border-[#b8860b]/50'
                        }`}
                        data-testid={`card-route-${route.id}`}
                      >
                        <CardContent className="p-4">
                          {/* Route Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                route.routeType === 'pickup' ? 'bg-amber-500/20' :
                                route.routeType === 'delivery' ? 'bg-blue-500/20' :
                                'bg-purple-500/20'
                              }`}>
                                <Truck className={`w-5 h-5 ${
                                  route.routeType === 'pickup' ? 'text-amber-400' :
                                  route.routeType === 'delivery' ? 'text-blue-400' :
                                  'text-purple-400'
                                }`} />
                              </div>
                              <div>
                                <p className="font-bold text-white" data-testid={`text-route-name-${route.id}`}>
                                  {route.routeName}
                                </p>
                                <p className="text-xs text-white/50 font-mono">{route.routeNumber}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                className={
                                  route.routeType === 'pickup' ? 'bg-amber-500/20 text-amber-400' :
                                  route.routeType === 'delivery' ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-purple-500/20 text-purple-400'
                                }
                                data-testid={`badge-route-type-${route.id}`}
                              >
                                {route.routeType === 'pickup' ? 'Pickup' :
                                 route.routeType === 'delivery' ? 'Delivery' :
                                 'Both'}
                              </Badge>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Route Stats */}
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="bg-[#0f1419] rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin className="w-3 h-3 text-white/40" />
                                <p className="text-xs text-white/50">Stops</p>
                              </div>
                              <p className="text-xl font-bold text-white" data-testid={`text-route-stops-${route.id}`}>
                                {route.completedStops}/{route.totalStops}
                              </p>
                            </div>
                            <div className="bg-[#0f1419] rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <DollarSign className="w-3 h-3 text-[#b8860b]" />
                                <p className="text-xs text-white/50">Est. Revenue</p>
                              </div>
                              <p className="text-xl font-bold text-[#b8860b]" data-testid={`text-route-revenue-${route.id}`}>
                                ${route.estimatedRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          {route.totalStops > 0 && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-white/50">Progress</span>
                                <span className={`font-medium ${
                                  route.status === 'completed' ? 'text-green-400' :
                                  route.status === 'in_progress' ? 'text-blue-400' :
                                  'text-white/60'
                                }`}>{Math.round((route.completedStops / route.totalStops) * 100)}%</span>
                              </div>
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all ${
                                    route.status === 'completed' ? 'bg-green-500' :
                                    route.status === 'in_progress' ? 'bg-blue-500' :
                                    'bg-[#b8860b]'
                                  }`}
                                  style={{ width: `${(route.completedStops / route.totalStops) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Route Details */}
                          <div className="space-y-2 text-sm border-t border-[#2a4a6f] pt-3">
                            <div className="flex items-center gap-2 text-white/60">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{route.routeDate} at {route.routeTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/60">
                              <Users className="w-3.5 h-3.5" />
                              <span>Driver: {route.driverName}</span>
                            </div>
                            {route.startTime && (
                              <div className="flex items-center gap-2 text-white/60">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Started: {route.startTime}{route.endTime ? ` - Ended: ${route.endTime}` : ''}</span>
                              </div>
                            )}
                          </div>

                          {/* Footer with Status */}
                          <div className="mt-3 pt-3 border-t border-[#2a4a6f] flex items-center justify-between">
                            <Badge 
                              className={
                                route.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                route.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-amber-500/20 text-amber-400'
                              }
                              data-testid={`badge-route-status-${route.id}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                route.status === 'completed' ? 'bg-green-400' :
                                route.status === 'in_progress' ? 'bg-blue-400' :
                                'bg-amber-400'
                              }`}></span>
                              {route.status === 'completed' ? 'Completed' :
                               route.status === 'in_progress' ? 'In Progress' :
                               'Planned'}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:text-white">
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:text-[#b8860b]">
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Inventory placeholder */}
            {activeSection === "inventory" && (
              <div className="space-y-4" data-testid="inventory-section">
                {/* Header with Search and Actions */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Parts Inventory</h2>
                    <p className="text-white/50 text-sm">Manage parts, supplies, and equipment inventory</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <Input
                        placeholder="Search parts, SKU, vendor..."
                        className="w-72 bg-[#0f1419] border-[#2a4a6f] text-white pl-10 h-9"
                        value={inventorySearchQuery}
                        onChange={(e) => setInventorySearchQuery(e.target.value)}
                        data-testid="input-inventory-search"
                      />
                    </div>
                    <Select value={inventoryCategoryFilter} onValueChange={setInventoryCategoryFilter}>
                      <SelectTrigger className="w-40 bg-[#0f1419] border-[#2a4a6f] text-white h-9" data-testid="select-inventory-category">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Parts">Parts</SelectItem>
                        <SelectItem value="Supplies">Supplies</SelectItem>
                        <SelectItem value="Chemicals">Chemicals</SelectItem>
                        <SelectItem value="Equipment">Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      className="bg-[#b8860b] hover:bg-[#9A7209] text-white h-9" 
                      onClick={() => setNewPartOpen(true)}
                      data-testid="button-new-part"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      New Part
                    </Button>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4">
                  {/* Total Items */}
                  <Card className="bg-[#1a2633] border-[#2a4a6f]" data-testid="card-total-items">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Total Items</p>
                          <p className="text-3xl font-bold text-white" data-testid="text-total-inventory-items">
                            {inventoryStats.totalItems}
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Package className="w-6 h-6 text-blue-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Value */}
                  <Card className="bg-[#1a2633] border-[#2a4a6f]" data-testid="card-total-value">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Total Value</p>
                          <p className="text-3xl font-bold text-[#b8860b]" data-testid="text-total-inventory-value">
                            ${inventoryStats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-[#b8860b]/20 flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-[#b8860b]" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Low Stock Alerts */}
                  <Card className="bg-[#1a2633] border-[#2a4a6f]" data-testid="card-low-stock">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Low Stock Alerts</p>
                          <p className="text-3xl font-bold text-amber-400" data-testid="text-low-stock-count">
                            {inventoryStats.lowStockCount}
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 text-amber-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Out of Stock */}
                  <Card className="bg-[#1a2633] border-[#2a4a6f]" data-testid="card-out-of-stock">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Out of Stock</p>
                          <p className="text-3xl font-bold text-red-400" data-testid="text-out-of-stock-count">
                            {inventoryStats.outOfStockCount}
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                          <Package className="w-6 h-6 text-red-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Inventory Table */}
                <Card className="bg-[#1a2633] border-[#2a4a6f]" data-testid="card-inventory-table">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Package className="w-5 h-5 text-[#b8860b]" />
                      Inventory Items
                      <Badge className="bg-white/10 text-white/70 ml-2">{filteredInventory.length} items</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {inventoryLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-6 h-6 animate-spin text-[#b8860b]" />
                        <span className="ml-2 text-white/60">Loading inventory...</span>
                      </div>
                    ) : filteredInventory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Package className="w-12 h-12 text-white/20 mb-3" />
                        <p className="text-white/50 text-sm">
                          {inventorySearchQuery || inventoryCategoryFilter !== "all" 
                            ? "No items match your search criteria" 
                            : "No inventory items yet"}
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-3 border-[#b8860b] text-[#b8860b] hover:bg-[#b8860b] hover:text-white"
                          onClick={() => setNewPartOpen(true)}
                          data-testid="button-add-first-part"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Your First Part
                        </Button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full" data-testid="table-inventory">
                          <thead>
                            <tr className="border-b border-[#2a4a6f]">
                              <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wide">Part Name / SKU</th>
                              <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wide">Category</th>
                              <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wide">Qty / Reorder</th>
                              <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wide">Unit Price</th>
                              <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wide">Total Value</th>
                              <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wide">Vendor / Location</th>
                              <th className="text-left py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wide">Status</th>
                              <th className="text-right py-3 px-4 text-xs font-medium text-white/50 uppercase tracking-wide">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredInventory.map((item: any) => {
                              const stockStatus = getStockStatus(item.quantityOnHand, item.reorderPoint);
                              const totalValue = item.quantityOnHand * item.unitCost;
                              return (
                                <tr 
                                  key={item.id} 
                                  className="border-b border-[#2a4a6f]/50 hover:bg-white/5 transition-colors"
                                  data-testid={`row-inventory-${item.id}`}
                                >
                                  <td className="py-3 px-4">
                                    <div>
                                      <p className="text-white font-medium" data-testid={`text-part-name-${item.id}`}>{item.partName}</p>
                                      <p className="text-white/40 text-xs" data-testid={`text-part-sku-${item.id}`}>{item.partNumber}</p>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <Badge 
                                      className={`
                                        ${item.category === "Parts" ? "bg-blue-500/20 text-blue-400" : ""}
                                        ${item.category === "Supplies" ? "bg-purple-500/20 text-purple-400" : ""}
                                        ${item.category === "Chemicals" ? "bg-emerald-500/20 text-emerald-400" : ""}
                                        ${item.category === "Equipment" ? "bg-amber-500/20 text-amber-400" : ""}
                                      `}
                                      data-testid={`badge-category-${item.id}`}
                                    >
                                      {item.category}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                      <span className={`font-bold ${item.quantityOnHand === 0 ? 'text-red-400' : item.quantityOnHand <= item.reorderPoint ? 'text-amber-400' : 'text-white'}`} data-testid={`text-quantity-${item.id}`}>
                                        {item.quantityOnHand}
                                      </span>
                                      <span className="text-white/30">/</span>
                                      <span className="text-white/50 text-sm" data-testid={`text-reorder-${item.id}`}>{item.reorderPoint}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="text-white" data-testid={`text-unit-price-${item.id}`}>
                                      ${item.unitCost.toFixed(2)}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="text-[#b8860b] font-medium" data-testid={`text-total-value-${item.id}`}>
                                      ${totalValue.toFixed(2)}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div>
                                      <p className="text-white/70 text-sm" data-testid={`text-vendor-${item.id}`}>
                                        {item.manufacturer || item.preferredVendorId || "-"}
                                      </p>
                                      {item.binLocation && (
                                        <p className="text-white/40 text-xs flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          {item.binLocation}
                                        </p>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <Badge 
                                      className={stockStatus.color}
                                      data-testid={`badge-stock-status-${item.id}`}
                                    >
                                      {stockStatus.label}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:text-white">
                                        <Eye className="w-3.5 h-3.5" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:text-[#b8860b]">
                                        <Edit className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Analytics Section - Bloomberg Style Business Intelligence */}
            {activeSection === "analytics" && (
              <div className="space-y-6" data-testid="analytics-section">
                {/* Header with Date Range Selector */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Business Analytics</h2>
                    <p className="text-white/50 text-sm">Bloomberg-style intelligence for your laundromat</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(["today", "week", "month", "quarter"] as const).map((period) => (
                      <Button
                        key={period}
                        variant={analyticsPeriod === period ? "default" : "outline"}
                        size="sm"
                        className={analyticsPeriod === period 
                          ? "bg-[#b8860b] hover:bg-[#9A7209] text-white" 
                          : "border-[#2a4a6f] text-white/70 hover:text-white hover:border-[#b8860b]"
                        }
                        onClick={() => setAnalyticsPeriod(period)}
                        data-testid={`button-period-${period}`}
                      >
                        {period === "today" ? "Today" : period === "week" ? "Week" : period === "month" ? "Month" : "Quarter"}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-6 gap-4">
                  {/* Total Revenue */}
                  <Card className="bg-[#1a2633] border-[#2a4a6f]" data-testid="kpi-revenue">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-lg bg-[#b8860b]/20 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-[#b8860b]" />
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-400">
                          <ArrowUp className="w-3 h-3 mr-1" />
                          {((rawStats?.week?.revenue || 0) > 0 ? 12.5 : 0).toFixed(1)}%
                        </Badge>
                      </div>
                      <p className="text-white/50 text-xs mb-1">Total Revenue</p>
                      <p className="text-2xl font-bold text-white" data-testid="text-total-revenue">
                        ${analyticsPeriod === "today" 
                          ? (rawStats?.today?.revenue || "0.00")
                          : analyticsPeriod === "week"
                          ? (rawStats?.week?.revenue || "0.00")
                          : analyticsPeriod === "month"
                          ? ((parseFloat(rawStats?.week?.revenue || "0") * 4.3).toFixed(2))
                          : ((parseFloat(rawStats?.week?.revenue || "0") * 13).toFixed(2))
                        }
                      </p>
                    </CardContent>
                  </Card>

                  {/* Total Orders */}
                  <Card className="bg-[#1a2633] border-[#2a4a6f]" data-testid="kpi-orders">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-blue-400" />
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-400">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +8.2%
                        </Badge>
                      </div>
                      <p className="text-white/50 text-xs mb-1">Total Orders</p>
                      <p className="text-2xl font-bold text-white" data-testid="text-total-orders">
                        {analyticsPeriod === "today" 
                          ? (rawStats?.today?.orders || 0)
                          : analyticsPeriod === "week"
                          ? (rawStats?.week?.orders || 0)
                          : analyticsPeriod === "month"
                          ? Math.floor((rawStats?.week?.orders || 0) * 4.3)
                          : Math.floor((rawStats?.week?.orders || 0) * 13)
                        }
                      </p>
                    </CardContent>
                  </Card>

                  {/* Average Order Value */}
                  <Card className="bg-[#1a2633] border-[#2a4a6f]" data-testid="kpi-aov">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <Receipt className="w-5 h-5 text-purple-400" />
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-400">
                          <ArrowUp className="w-3 h-3 mr-1" />
                          +3.4%
                        </Badge>
                      </div>
                      <p className="text-white/50 text-xs mb-1">Avg Order Value</p>
                      <p className="text-2xl font-bold text-white" data-testid="text-aov">
                        ${rawStats?.week?.avgOrderValue || dashboardStats.week.avgOrderValue || "0.00"}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Customer Retention */}
                  <Card className="bg-[#1a2633] border-[#2a4a6f]" data-testid="kpi-retention">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <Users className="w-5 h-5 text-emerald-400" />
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-400">
                          <ArrowUp className="w-3 h-3 mr-1" />
                          +2.1%
                        </Badge>
                      </div>
                      <p className="text-white/50 text-xs mb-1">Retention Rate</p>
                      <p className="text-2xl font-bold text-white" data-testid="text-retention">
                        {dashboardStats.customers.retention}%
                      </p>
                    </CardContent>
                  </Card>

                  {/* Machine Utilization */}
                  <Card className="bg-[#1a2633] border-[#2a4a6f]" data-testid="kpi-utilization">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                          <Wrench className="w-5 h-5 text-amber-400" />
                        </div>
                        <Badge className={`${machineStatusCounts.operational / Math.max(machineStatusCounts.total, 1) >= 0.9 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-amber-500/20 text-amber-400'}`}>
                          {Math.round((machineStatusCounts.operational / Math.max(machineStatusCounts.total, 1)) * 100)}%
                        </Badge>
                      </div>
                      <p className="text-white/50 text-xs mb-1">Machine Utilization</p>
                      <p className="text-2xl font-bold text-white" data-testid="text-utilization">
                        {machineStatusCounts.operational}/{machineStatusCounts.total}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Peak Hours */}
                  <Card className="bg-[#1a2633] border-[#2a4a6f]" data-testid="kpi-peak">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-pink-400" />
                        </div>
                        <Badge className="bg-[#1e3a5f] text-white/70">
                          <Activity className="w-3 h-3 mr-1" />
                          Live
                        </Badge>
                      </div>
                      <p className="text-white/50 text-xs mb-1">Peak Hours</p>
                      <p className="text-2xl font-bold text-white" data-testid="text-peak">
                        9-11 AM
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Row 1: Revenue Trend & Order Volume */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Revenue Trend Area Chart */}
                  <Card className="bg-[#1a2633] border-[#2a4a6f]" data-testid="chart-revenue">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white text-lg">Revenue Trend</CardTitle>
                          <p className="text-white/50 text-xs">Daily revenue over selected period</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-[#b8860b]"></div>
                            <span className="text-white/50 text-xs">Revenue</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-[#1e3a5f]"></div>
                            <span className="text-white/50 text-xs">Target</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {analyticsChartLoading ? (
                        <div className="h-[250px] flex items-center justify-center">
                          <RefreshCw className="w-6 h-6 text-[#b8860b] animate-spin" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={250}>
                          <AreaChart data={((analyticsChartData as any)?.chartData || []).map((d: any) => ({
                            date: d.date ? new Date(d.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) : "-",
                            revenue: d.revenue || 0,
                            target: 2500,
                          }))}>
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#b8860b" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#b8860b" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a4a6f" />
                            <XAxis dataKey="date" stroke="#ffffff50" tick={{ fill: '#ffffff80', fontSize: 10 }} />
                            <YAxis stroke="#ffffff50" tick={{ fill: '#ffffff80', fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1a2633', border: '1px solid #2a4a6f', borderRadius: '8px' }}
                              labelStyle={{ color: '#ffffff' }}
                              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                            />
                            <Area type="monotone" dataKey="target" stroke="#1e3a5f" strokeDasharray="5 5" fill="none" />
                            <Area type="monotone" dataKey="revenue" stroke="#b8860b" strokeWidth={2} fill="url(#colorRevenue)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  {/* Order Volume Bar Chart */}
                  <Card className="bg-[#1a2633] border-[#2a4a6f]" data-testid="chart-orders">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white text-lg">Order Volume</CardTitle>
                          <p className="text-white/50 text-xs">Number of orders over selected period</p>
                        </div>
                        <Badge className="bg-[#1e3a5f]/50 text-white/70">
                          {((analyticsChartData as any)?.chartData || []).reduce((sum: number, d: any) => sum + (d.orders || 0), 0)} total
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {analyticsChartLoading ? (
                        <div className="h-[250px] flex items-center justify-center">
                          <RefreshCw className="w-6 h-6 text-[#b8860b] animate-spin" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={((analyticsChartData as any)?.chartData || []).map((d: any) => ({
                            date: d.date ? new Date(d.date).toLocaleDateString([], { weekday: 'short' }) : "-",
                            orders: d.orders || 0,
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a4a6f" />
                            <XAxis dataKey="date" stroke="#ffffff50" tick={{ fill: '#ffffff80', fontSize: 10 }} />
                            <YAxis stroke="#ffffff50" tick={{ fill: '#ffffff80', fontSize: 10 }} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1a2633', border: '1px solid #2a4a6f', borderRadius: '8px' }}
                              labelStyle={{ color: '#ffffff' }}
                            />
                            <Bar dataKey="orders" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Row 2: Service Breakdown & Peak Hours Heat Map */}
                <div className="grid grid-cols-3 gap-6">
                  {/* Service Type Breakdown Pie Chart */}
                  <Card className="bg-[#1a2633] border-[#2a4a6f]" data-testid="chart-services">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-lg">Service Breakdown</CardTitle>
                      <p className="text-white/50 text-xs">Distribution by service type</p>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPie>
                            <Pie
                              data={orderTypeDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${value}%`}
                              labelLine={{ stroke: '#ffffff50' }}
                            >
                              {orderTypeDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1a2633', border: '1px solid #2a4a6f', borderRadius: '8px' }}
                              formatter={(value: number) => [`${value}%`, 'Share']}
                            />
                          </RechartsPie>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {serviceBreakdown.map((service, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 rounded bg-[#0f1419]">
                            <div 
                              className="w-3 h-3 rounded" 
                              style={{ backgroundColor: Object.values(ORDER_TYPE_COLORS)[i] || '#888' }}
                            ></div>
                            <div className="flex-1">
                              <p className="text-xs text-white/70 truncate">{service.service}</p>
                              <p className="text-sm font-bold text-white">${service.revenue}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Peak Hours Heat Map Style Grid */}
                  <Card className="bg-[#1a2633] border-[#2a4a6f] col-span-2" data-testid="chart-heatmap">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white text-lg">Peak Performance Hours</CardTitle>
                          <p className="text-white/50 text-xs">Order density by day and hour</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white/40 text-xs">Low</span>
                          <div className="flex gap-0.5">
                            <div className="w-4 h-4 rounded bg-[#1e3a5f]/30"></div>
                            <div className="w-4 h-4 rounded bg-[#1e3a5f]/50"></div>
                            <div className="w-4 h-4 rounded bg-[#1e3a5f]"></div>
                            <div className="w-4 h-4 rounded bg-[#b8860b]/70"></div>
                            <div className="w-4 h-4 rounded bg-[#b8860b]"></div>
                          </div>
                          <span className="text-white/40 text-xs">High</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {/* Hours header */}
                        <div className="flex gap-1 ml-12">
                          {['6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm'].map((hour, i) => (
                            <div key={i} className="flex-1 text-center text-xs text-white/40">{hour}</div>
                          ))}
                        </div>
                        {/* Days rows */}
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIdx) => (
                          <div key={day} className="flex gap-1 items-center">
                            <div className="w-12 text-xs text-white/50">{day}</div>
                            {[0.2, 0.4, 0.9, 0.7, 0.5, 0.6, 0.8, 0.3].map((intensity, hourIdx) => {
                              const weekendBoost = dayIdx >= 5 ? 0.2 : 0;
                              const morningBoost = hourIdx >= 2 && hourIdx <= 4 ? 0.2 : 0;
                              const totalIntensity = Math.min(1, intensity + weekendBoost + morningBoost);
                              const bgColor = totalIntensity > 0.7 
                                ? `rgba(184, 134, 11, ${totalIntensity})`
                                : `rgba(30, 58, 95, ${0.3 + totalIntensity * 0.7})`;
                              return (
                                <div 
                                  key={hourIdx}
                                  className="flex-1 h-8 rounded cursor-pointer transition-transform hover:scale-105"
                                  style={{ backgroundColor: bgColor }}
                                  title={`${day} ${['6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm'][hourIdx]}: ${Math.round(totalIntensity * 100)}% activity`}
                                ></div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                      {/* Peak times summary */}
                      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#2a4a6f]">
                        <div className="text-center">
                          <p className="text-white/50 text-xs">Busiest Day</p>
                          <p className="text-lg font-bold text-[#b8860b]">Saturday</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white/50 text-xs">Peak Hours</p>
                          <p className="text-lg font-bold text-[#b8860b]">9AM - 12PM</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white/50 text-xs">Slowest Day</p>
                          <p className="text-lg font-bold text-white/70">Monday</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Bottom Row: Customer Metrics & Machine Stats */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Customer Acquisition & Retention */}
                  <Card className="bg-[#1a2633] border-[#2a4a6f]" data-testid="chart-customers">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-lg">Customer Metrics</CardTitle>
                      <p className="text-white/50 text-xs">Acquisition & retention analysis</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-[#0f1419] rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <UserPlus className="w-4 h-4 text-emerald-400" />
                            <span className="text-white/50 text-xs">New Customers</span>
                          </div>
                          <p className="text-3xl font-bold text-white">{dashboardStats.customers.new}</p>
                          <p className="text-xs text-emerald-400 mt-1">
                            <ArrowUp className="w-3 h-3 inline" /> +5.2% from last period
                          </p>
                        </div>
                        <div className="bg-[#0f1419] rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-blue-400" />
                            <span className="text-white/50 text-xs">Active Customers</span>
                          </div>
                          <p className="text-3xl font-bold text-white">{dashboardStats.customers.active}</p>
                          <p className="text-xs text-blue-400 mt-1">
                            <Target className="w-3 h-3 inline" /> {dashboardStats.customers.retention}% retention
                          </p>
                        </div>
                      </div>
                      {/* Customer Value Distribution */}
                      <div className="space-y-3">
                        <p className="text-white/50 text-xs">Customer Value Distribution</p>
                        {[
                          { label: "High Value ($200+/mo)", pct: 15, color: "bg-[#b8860b]" },
                          { label: "Medium Value ($50-200)", pct: 45, color: "bg-[#1e3a5f]" },
                          { label: "Low Value (<$50)", pct: 40, color: "bg-white/20" },
                        ].map((tier, i) => (
                          <div key={i}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-white/70">{tier.label}</span>
                              <span className="text-white">{tier.pct}%</span>
                            </div>
                            <div className="h-2 bg-[#0f1419] rounded-full overflow-hidden">
                              <div className={`h-full ${tier.color} rounded-full`} style={{ width: `${tier.pct}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Machine Utilization Stats */}
                  <Card className="bg-[#1a2633] border-[#2a4a6f]" data-testid="chart-machines">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-lg">Machine Performance</CardTitle>
                      <p className="text-white/50 text-xs">Utilization & maintenance status</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-[#0f1419] rounded-lg p-4 text-center">
                          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                          </div>
                          <p className="text-2xl font-bold text-white">{machineStatusCounts.operational}</p>
                          <p className="text-xs text-white/50">Operational</p>
                        </div>
                        <div className="bg-[#0f1419] rounded-lg p-4 text-center">
                          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-2">
                            <AlertCircle className="w-6 h-6 text-amber-400" />
                          </div>
                          <p className="text-2xl font-bold text-white">{machineStatusCounts.needsMaintenance}</p>
                          <p className="text-xs text-white/50">Needs Attention</p>
                        </div>
                        <div className="bg-[#0f1419] rounded-lg p-4 text-center">
                          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-2">
                            <Wrench className="w-6 h-6 text-red-400" />
                          </div>
                          <p className="text-2xl font-bold text-white">{machineStatusCounts.outOfOrder}</p>
                          <p className="text-xs text-white/50">Out of Order</p>
                        </div>
                      </div>
                      {/* Utilization Gauge */}
                      <div className="bg-[#0f1419] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/50 text-xs">Overall Utilization Rate</span>
                          <span className="text-[#b8860b] font-bold">
                            {machineStatusCounts.total > 0 
                              ? Math.round((machineStatusCounts.operational / machineStatusCounts.total) * 100) 
                              : 0}%
                          </span>
                        </div>
                        <div className="h-4 bg-[#1a2633] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#1e3a5f] to-[#b8860b] rounded-full transition-all"
                            style={{ 
                              width: `${machineStatusCounts.total > 0 
                                ? (machineStatusCounts.operational / machineStatusCounts.total) * 100 
                                : 0}%` 
                            }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-white/40">
                          <span>0%</span>
                          <span>Target: 95%</span>
                          <span>100%</span>
                        </div>
                      </div>
                      {/* Top Performing Machines */}
                      <div className="mt-4 pt-4 border-t border-[#2a4a6f]">
                        <p className="text-white/50 text-xs mb-2">Top Performing Machines</p>
                        <div className="space-y-2">
                          {machines.slice(0, 3).map((machine: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded bg-[#0f1419]">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded flex items-center justify-center ${
                                  machine.type === 'washer' ? 'bg-blue-500/20' : 'bg-amber-500/20'
                                }`}>
                                  <Wrench className={`w-4 h-4 ${
                                    machine.type === 'washer' ? 'text-blue-400' : 'text-amber-400'
                                  }`} />
                                </div>
                                <div>
                                  <p className="text-sm text-white font-medium">{machine.name}</p>
                                  <p className="text-xs text-white/40">{machine.cycles} cycles</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-[#b8860b]">${machine.revenue.toFixed(2)}</p>
                                <p className="text-xs text-white/40">{machine.uptime}% uptime</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* New Order Dialog */}
        <Dialog open={newOrderOpen} onOpenChange={setNewOrderOpen}>
          <DialogContent className="bg-[#1a2633] border-[#2a4a6f] text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
              <DialogDescription className="text-white/60">
                Start a new WDF, PUD, or self-service order
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm text-white/70">Customer Name *</label>
                <Input
                  placeholder="Enter customer name"
                  className="bg-[#0f1419] border-[#2a4a6f] text-white"
                  value={newOrderForm.customerName}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, customerName: e.target.value })}
                  data-testid="input-new-order-customer"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Phone Number *</label>
                <Input
                  placeholder="(555) 123-4567"
                  className="bg-[#0f1419] border-[#2a4a6f] text-white"
                  value={newOrderForm.customerPhone}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, customerPhone: e.target.value })}
                  data-testid="input-new-order-phone"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Order Type</label>
                <Select 
                  value={newOrderForm.orderType} 
                  onValueChange={(value: "wash_dry_fold" | "pickup_delivery" | "dry_cleaning" | "self_service") => 
                    setNewOrderForm({ ...newOrderForm, orderType: value })
                  }
                >
                  <SelectTrigger className="bg-[#0f1419] border-[#2a4a6f] text-white" data-testid="select-new-order-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wash_dry_fold">Wash-Dry-Fold</SelectItem>
                    <SelectItem value="pickup_delivery">Pickup & Delivery</SelectItem>
                    <SelectItem value="dry_cleaning">Dry Cleaning</SelectItem>
                    <SelectItem value="self_service">Self-Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Special Instructions</label>
                <Input
                  placeholder="Any special requests..."
                  className="bg-[#0f1419] border-[#2a4a6f] text-white"
                  value={newOrderForm.specialInstructions}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, specialInstructions: e.target.value })}
                  data-testid="input-new-order-instructions"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 border-[#2a4a6f] text-white" 
                onClick={() => setNewOrderOpen(false)}
                disabled={createOrderMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-[#b8860b] hover:bg-[#9A7209]" 
                onClick={() => {
                  if (!newOrderForm.customerName || !newOrderForm.customerPhone) {
                    toast({
                      title: "Validation Error",
                      description: "Please fill in customer name and phone number",
                      variant: "destructive",
                    });
                    return;
                  }
                  createOrderMutation.mutate(newOrderForm);
                }}
                disabled={createOrderMutation.isPending}
                data-testid="button-submit-new-order"
              >
                {createOrderMutation.isPending ? "Creating..." : "Create Order"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Customer Dialog */}
        <Dialog open={newCustomerOpen} onOpenChange={setNewCustomerOpen}>
          <DialogContent className="bg-[#1a2633] border-[#2a4a6f] text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#b8860b]" />
                Add New Customer
              </DialogTitle>
              <DialogDescription className="text-white/60">
                Create a new customer account for your laundromat
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm text-white/70">Account Name *</label>
                <Input
                  placeholder="Business or household name"
                  className="bg-[#0f1419] border-[#2a4a6f] text-white"
                  value={newCustomerForm.accountName}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, accountName: e.target.value })}
                  data-testid="input-new-customer-account"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Contact Name *</label>
                <Input
                  placeholder="Primary contact person"
                  className="bg-[#0f1419] border-[#2a4a6f] text-white"
                  value={newCustomerForm.contactName}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, contactName: e.target.value })}
                  data-testid="input-new-customer-contact"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Phone Number *</label>
                <Input
                  placeholder="(555) 123-4567"
                  className="bg-[#0f1419] border-[#2a4a6f] text-white"
                  value={newCustomerForm.phone}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                  data-testid="input-new-customer-phone"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Email (optional)</label>
                <Input
                  type="email"
                  placeholder="customer@email.com"
                  className="bg-[#0f1419] border-[#2a4a6f] text-white"
                  value={newCustomerForm.email}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                  data-testid="input-new-customer-email"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Address (optional)</label>
                <Input
                  placeholder="Street address, city, state"
                  className="bg-[#0f1419] border-[#2a4a6f] text-white"
                  value={newCustomerForm.address}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
                  data-testid="input-new-customer-address"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 border-[#2a4a6f] text-white" 
                onClick={() => setNewCustomerOpen(false)}
                disabled={createCustomerMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-[#b8860b] hover:bg-[#9A7209]" 
                onClick={() => {
                  if (!newCustomerForm.accountName || !newCustomerForm.contactName || !newCustomerForm.phone) {
                    toast({
                      title: "Validation Error",
                      description: "Please fill in account name, contact name, and phone number",
                      variant: "destructive",
                    });
                    return;
                  }
                  createCustomerMutation.mutate(newCustomerForm);
                }}
                disabled={createCustomerMutation.isPending}
                data-testid="button-submit-new-customer"
              >
                {createCustomerMutation.isPending ? "Creating..." : "Add Customer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Machine Dialog */}
        <Dialog open={newMachineOpen} onOpenChange={setNewMachineOpen}>
          <DialogContent className="bg-[#1a2633] border-[#2a4a6f] text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#b8860b]" />
                Add New Machine
              </DialogTitle>
              <DialogDescription className="text-white/60">
                Register a new machine in your laundromat
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm text-white/70">Machine Name *</label>
                <Input
                  placeholder="e.g., Washer 1, Front Loader A"
                  className="bg-[#0f1419] border-[#2a4a6f] text-white"
                  value={newMachineForm.machineName}
                  onChange={(e) => setNewMachineForm({ ...newMachineForm, machineName: e.target.value })}
                  data-testid="input-new-machine-name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Machine Type *</label>
                <Select 
                  value={newMachineForm.machineType} 
                  onValueChange={(value: "washer" | "dryer" | "combo" | "ironer" | "folder") => 
                    setNewMachineForm({ ...newMachineForm, machineType: value })
                  }
                >
                  <SelectTrigger className="bg-[#0f1419] border-[#2a4a6f] text-white" data-testid="select-new-machine-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="washer">Washer</SelectItem>
                    <SelectItem value="dryer">Dryer</SelectItem>
                    <SelectItem value="combo">Combo (Washer/Dryer)</SelectItem>
                    <SelectItem value="ironer">Ironer</SelectItem>
                    <SelectItem value="folder">Folder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Manufacturer</label>
                  <Input
                    placeholder="e.g., Dexter, Speed Queen"
                    className="bg-[#0f1419] border-[#2a4a6f] text-white"
                    value={newMachineForm.manufacturer}
                    onChange={(e) => setNewMachineForm({ ...newMachineForm, manufacturer: e.target.value })}
                    data-testid="input-new-machine-manufacturer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Model</label>
                  <Input
                    placeholder="e.g., T-900, SC80"
                    className="bg-[#0f1419] border-[#2a4a6f] text-white"
                    value={newMachineForm.model}
                    onChange={(e) => setNewMachineForm({ ...newMachineForm, model: e.target.value })}
                    data-testid="input-new-machine-model"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Serial Number</label>
                <Input
                  placeholder="Machine serial number"
                  className="bg-[#0f1419] border-[#2a4a6f] text-white"
                  value={newMachineForm.serialNumber}
                  onChange={(e) => setNewMachineForm({ ...newMachineForm, serialNumber: e.target.value })}
                  data-testid="input-new-machine-serial"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Install Date</label>
                <Input
                  type="date"
                  className="bg-[#0f1419] border-[#2a4a6f] text-white"
                  value={newMachineForm.installDate}
                  onChange={(e) => setNewMachineForm({ ...newMachineForm, installDate: e.target.value })}
                  data-testid="input-new-machine-install-date"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 border-[#2a4a6f] text-white" 
                onClick={() => setNewMachineOpen(false)}
                disabled={createMachineMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-[#b8860b] hover:bg-[#9A7209]" 
                onClick={() => {
                  if (!newMachineForm.machineName) {
                    toast({
                      title: "Validation Error",
                      description: "Please enter a machine name",
                      variant: "destructive",
                    });
                    return;
                  }
                  createMachineMutation.mutate(newMachineForm);
                }}
                disabled={createMachineMutation.isPending}
                data-testid="button-submit-new-machine"
              >
                {createMachineMutation.isPending ? "Adding..." : "Add Machine"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Route Dialog */}
        <Dialog open={newRouteOpen} onOpenChange={setNewRouteOpen}>
          <DialogContent className="bg-[#1a2633] border-[#2a4a6f] text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#b8860b]" />
                Create New Route
              </DialogTitle>
              <DialogDescription className="text-white/60">
                Plan a new pickup or delivery route
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm text-white/70">Route Name *</label>
                <Input
                  placeholder="e.g., North Zone Morning, Downtown PM"
                  className="bg-[#0f1419] border-[#2a4a6f] text-white"
                  value={newRouteForm.routeName}
                  onChange={(e) => setNewRouteForm({ ...newRouteForm, routeName: e.target.value })}
                  data-testid="input-new-route-name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Route Type *</label>
                <Select 
                  value={newRouteForm.routeType} 
                  onValueChange={(value: "pickup" | "delivery" | "pickup_delivery") => 
                    setNewRouteForm({ ...newRouteForm, routeType: value })
                  }
                >
                  <SelectTrigger className="bg-[#0f1419] border-[#2a4a6f] text-white" data-testid="select-new-route-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup">Pickup Only</SelectItem>
                    <SelectItem value="delivery">Delivery Only</SelectItem>
                    <SelectItem value="pickup_delivery">Pickup & Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Route Date *</label>
                <Input
                  type="date"
                  className="bg-[#0f1419] border-[#2a4a6f] text-white"
                  value={newRouteForm.routeDate}
                  onChange={(e) => setNewRouteForm({ ...newRouteForm, routeDate: e.target.value })}
                  data-testid="input-new-route-date"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Driver ID (Optional)</label>
                <Input
                  placeholder="Assign a driver (optional)"
                  className="bg-[#0f1419] border-[#2a4a6f] text-white"
                  value={newRouteForm.driverId}
                  onChange={(e) => setNewRouteForm({ ...newRouteForm, driverId: e.target.value })}
                  data-testid="input-new-route-driver"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 border-[#2a4a6f] text-white" 
                onClick={() => setNewRouteOpen(false)}
                disabled={createRouteMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-[#b8860b] hover:bg-[#9A7209]" 
                onClick={() => {
                  if (!newRouteForm.routeName || !newRouteForm.routeDate) {
                    toast({
                      title: "Validation Error",
                      description: "Please enter a route name and date",
                      variant: "destructive",
                    });
                    return;
                  }
                  createRouteMutation.mutate(newRouteForm);
                }}
                disabled={createRouteMutation.isPending}
                data-testid="button-submit-new-route"
              >
                {createRouteMutation.isPending ? "Creating..." : "Create Route"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Part Dialog */}
        <Dialog open={newPartOpen} onOpenChange={setNewPartOpen}>
          <DialogContent className="bg-[#1a2633] border-[#2a4a6f] text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#b8860b]" />
                Add New Part
              </DialogTitle>
              <DialogDescription className="text-white/60">
                Add a new part or supply to your inventory
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Part Name *</label>
                  <Input
                    placeholder="e.g., Drive Belt, Lint Filter"
                    className="bg-[#0f1419] border-[#2a4a6f] text-white"
                    value={newPartForm.partName}
                    onChange={(e) => setNewPartForm({ ...newPartForm, partName: e.target.value })}
                    data-testid="input-new-part-name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Part Number / SKU *</label>
                  <Input
                    placeholder="e.g., DXT-BELT-001"
                    className="bg-[#0f1419] border-[#2a4a6f] text-white"
                    value={newPartForm.partNumber}
                    onChange={(e) => setNewPartForm({ ...newPartForm, partNumber: e.target.value })}
                    data-testid="input-new-part-number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Category *</label>
                <Select 
                  value={newPartForm.category} 
                  onValueChange={(value: "Parts" | "Supplies" | "Chemicals" | "Equipment") => 
                    setNewPartForm({ ...newPartForm, category: value })
                  }
                >
                  <SelectTrigger className="bg-[#0f1419] border-[#2a4a6f] text-white" data-testid="select-new-part-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Parts">Parts</SelectItem>
                    <SelectItem value="Supplies">Supplies</SelectItem>
                    <SelectItem value="Chemicals">Chemicals</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Description</label>
                <Input
                  placeholder="Brief description of the part"
                  className="bg-[#0f1419] border-[#2a4a6f] text-white"
                  value={newPartForm.description}
                  onChange={(e) => setNewPartForm({ ...newPartForm, description: e.target.value })}
                  data-testid="input-new-part-description"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Manufacturer / Vendor</label>
                  <Input
                    placeholder="e.g., Dexter, Speed Queen"
                    className="bg-[#0f1419] border-[#2a4a6f] text-white"
                    value={newPartForm.manufacturer}
                    onChange={(e) => setNewPartForm({ ...newPartForm, manufacturer: e.target.value })}
                    data-testid="input-new-part-manufacturer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Bin Location</label>
                  <Input
                    placeholder="e.g., Shelf A-1"
                    className="bg-[#0f1419] border-[#2a4a6f] text-white"
                    value={newPartForm.binLocation}
                    onChange={(e) => setNewPartForm({ ...newPartForm, binLocation: e.target.value })}
                    data-testid="input-new-part-bin"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Quantity *</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="bg-[#0f1419] border-[#2a4a6f] text-white"
                    value={newPartForm.quantityOnHand}
                    onChange={(e) => setNewPartForm({ ...newPartForm, quantityOnHand: parseInt(e.target.value) || 0 })}
                    data-testid="input-new-part-quantity"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Reorder Point</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="5"
                    className="bg-[#0f1419] border-[#2a4a6f] text-white"
                    value={newPartForm.reorderPoint}
                    onChange={(e) => setNewPartForm({ ...newPartForm, reorderPoint: parseInt(e.target.value) || 5 })}
                    data-testid="input-new-part-reorder-point"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Reorder Qty</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="10"
                    className="bg-[#0f1419] border-[#2a4a6f] text-white"
                    value={newPartForm.reorderQuantity}
                    onChange={(e) => setNewPartForm({ ...newPartForm, reorderQuantity: parseInt(e.target.value) || 10 })}
                    data-testid="input-new-part-reorder-quantity"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Unit Cost ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="bg-[#0f1419] border-[#2a4a6f] text-white"
                    value={newPartForm.unitCost}
                    onChange={(e) => setNewPartForm({ ...newPartForm, unitCost: e.target.value })}
                    data-testid="input-new-part-unit-cost"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Retail Price ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="bg-[#0f1419] border-[#2a4a6f] text-white"
                    value={newPartForm.retailPrice}
                    onChange={(e) => setNewPartForm({ ...newPartForm, retailPrice: e.target.value })}
                    data-testid="input-new-part-retail-price"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 border-[#2a4a6f] text-white" 
                onClick={() => setNewPartOpen(false)}
                disabled={createPartMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-[#b8860b] hover:bg-[#9A7209]" 
                onClick={() => {
                  if (!newPartForm.partName || !newPartForm.partNumber) {
                    toast({
                      title: "Validation Error",
                      description: "Please enter a part name and part number",
                      variant: "destructive",
                    });
                    return;
                  }
                  createPartMutation.mutate(newPartForm);
                }}
                disabled={createPartMutation.isPending}
                data-testid="button-submit-new-part"
              >
                {createPartMutation.isPending ? "Adding..." : "Add Part"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
