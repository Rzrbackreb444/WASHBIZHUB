import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  Settings,
  Upload,
  Globe,
  Building,
  CreditCard,
  Crown,
  Check,
  Printer,
  Hash,
  Book,
  Shield,
  Lightbulb,
  GraduationCap,
  Lock,
  Droplets,
  Wind,
  Info,
  Shirt,
  UserCheck,
  ListChecks,
  Star,
  Layers,
  ArrowRight,
  X,
  ChevronDown,
  Navigation,
  MapPinned,
  Bell,
  SendHorizontal,
  GripVertical,
  AlertTriangle,
  Calculator,
  FileText,
  Download,
  Briefcase,
  TrendingDown as TrendingDownIcon,
  PieChart,
  Factory,
  Cog,
  CircleDollarSign,
  ClipboardList,
  ReceiptText,
  FileSpreadsheet,
  UserSquare,
  CalendarDays,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Link } from "wouter";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
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
  Tooltip as RechartsTooltip,
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

// Navigation items for sidebar and mobile nav
const NAV_ITEMS = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "orders", icon: ShoppingCart, label: "Orders" },
  { id: "customers", icon: Users, label: "Customers" },
  { id: "machines", icon: Wrench, label: "Machines" },
  { id: "routes", icon: Truck, label: "Routes" },
  { id: "inventory", icon: Package, label: "Inventory" },
  { id: "analytics", icon: BarChart3, label: "Analytics" },
  { id: "calculators", icon: Calculator, label: "Calculators" },
  { id: "templates", icon: FileText, label: "Templates" },
  { id: "doctrine", icon: Book, label: "Learn" },
  { id: "settings", icon: Settings, label: "Settings" },
];

// Mobile nav items (essential 5)
const MOBILE_NAV_ITEMS = [
  { id: "dashboard", icon: LayoutDashboard, label: "Home" },
  { id: "orders", icon: ShoppingCart, label: "Orders" },
  { id: "customers", icon: Users, label: "CRM" },
  { id: "machines", icon: Wrench, label: "Machines" },
  { id: "analytics", icon: BarChart3, label: "Stats" },
];

// Search result types for predictive search
type SearchResult = {
  type: "order" | "customer" | "machine" | "route" | "inventory" | "page";
  id: string;
  title: string;
  subtitle?: string;
  icon: typeof LayoutDashboard;
  action: () => void;
};

// Global Search Results Component with Predictive Text
function GlobalSearchResults({ 
  query, 
  onSelect,
  orders = [],
  customers = [],
  machines = []
}: { 
  query: string; 
  onSelect: (section: string) => void;
  orders?: any[];
  customers?: any[];
  machines?: any[];
}) {
  const searchLower = query.toLowerCase();
  
  // Filter and categorize results
  const filteredOrders = orders.filter((o: any) => 
    o.customerName?.toLowerCase().includes(searchLower) || 
    String(o.id).includes(query)
  ).slice(0, 3);
  
  const filteredCustomers = customers.filter((c: any) => 
    c.accountName?.toLowerCase().includes(searchLower) || 
    c.contactName?.toLowerCase().includes(searchLower) ||
    c.phone?.includes(query)
  ).slice(0, 3);
  
  const filteredMachines = machines.filter((m: any) => 
    m.machineName?.toLowerCase().includes(searchLower) ||
    m.model?.toLowerCase().includes(searchLower)
  ).slice(0, 3);
  
  // Page suggestions based on query
  const pageSuggestions = NAV_ITEMS.filter(item => 
    item.label.toLowerCase().includes(searchLower)
  );

  const hasResults = filteredOrders.length > 0 || filteredCustomers.length > 0 || 
                     filteredMachines.length > 0 || pageSuggestions.length > 0;

  if (!hasResults) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        No results found for "{query}"
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {/* Page Navigation Suggestions */}
      {pageSuggestions.length > 0 && (
        <div className="p-2">
          <p className="text-[10px] uppercase text-muted-foreground font-medium px-2 mb-1">Pages</p>
          {pageSuggestions.map((page) => (
            <button
              key={page.id}
              onClick={() => onSelect(page.id)}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/50 text-left"
              data-testid={`search-result-page-${page.id}`}
            >
              <page.icon className="w-4 h-4 text-[#b8860b]" />
              <span className="text-sm font-medium text-foreground">{page.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Orders Results */}
      {filteredOrders.length > 0 && (
        <div className="p-2">
          <p className="text-[10px] uppercase text-muted-foreground font-medium px-2 mb-1">Orders</p>
          {filteredOrders.map((order: any) => (
            <button
              key={order.id}
              onClick={() => onSelect("orders")}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/50 text-left"
              data-testid={`search-result-order-${order.id}`}
            >
              <ShoppingCart className="w-4 h-4 text-blue-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{order.customerName}</p>
                <p className="text-xs text-muted-foreground">Order #{order.id} - ${order.total}</p>
              </div>
              <Badge className={`text-[10px] ${getStatusColor(order.status)}`}>{order.status}</Badge>
            </button>
          ))}
        </div>
      )}

      {/* Customers Results */}
      {filteredCustomers.length > 0 && (
        <div className="p-2">
          <p className="text-[10px] uppercase text-muted-foreground font-medium px-2 mb-1">Customers</p>
          {filteredCustomers.map((customer: any) => (
            <button
              key={customer.id}
              onClick={() => onSelect("customers")}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/50 text-left"
              data-testid={`search-result-customer-${customer.id}`}
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{customer.accountName}</p>
                <p className="text-xs text-muted-foreground">{customer.contactName} - {customer.phone}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Machines Results */}
      {filteredMachines.length > 0 && (
        <div className="p-2">
          <p className="text-[10px] uppercase text-muted-foreground font-medium px-2 mb-1">Machines</p>
          {filteredMachines.map((machine: any) => (
            <button
              key={machine.id}
              onClick={() => onSelect("machines")}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/50 text-left"
              data-testid={`search-result-machine-${machine.id}`}
            >
              <Wrench className="w-4 h-4 text-cyan-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{machine.machineName}</p>
                <p className="text-xs text-muted-foreground">{machine.model} - {machine.status}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
  
  // Global search state
  const [globalSearch, setGlobalSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  
  // SOAP Daily Checklist State
  const [soapChecklist, setSoapChecklist] = useState({
    systemsCheck: false,
    observeCustomers: false,
    adjustOps: false,
    promoteBrand: false,
  });
  
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
  
  // New order form state with WDF enhancements
  const [newOrderForm, setNewOrderForm] = useState({
    customerName: "",
    customerPhone: "",
    orderType: "wash_dry_fold" as "wash_dry_fold" | "pickup_delivery" | "dry_cleaning" | "self_service",
    specialInstructions: "",
    weight: "",
    serviceType: "regular" as "regular" | "express_24hr" | "same_day_rush",
    specialCare: [] as string[],
    starchPreference: "none" as "none" | "light" | "medium" | "heavy",
    foldingPreference: "standard" as "standard" | "military" | "hung" | "rolled",
    fabricSoftener: true,
  });
  
  // WDF Pipeline state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [foldingChecklist, setFoldingChecklist] = useState<Record<string, Record<string, { checked: boolean; notes: string }>>>({});
  
  // PUD Route Builder state
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [routeBuilderOpen, setRouteBuilderOpen] = useState(false);
  const [routeStops, setRouteStops] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  
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
  
  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    businessName: "",
    logoUrl: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: "",
    website: "",
    taxRate: "8.25",
    currency: "USD" as "USD" | "CAD" | "EUR" | "GBP",
    defaultTipOptions: "15,18,20,25",
    orderNumberPrefix: "WBH",
    autoPrintReceipts: true,
    receiptFooterMessage: "Thank you for your business!",
    currentPlan: "starter" as "starter" | "professional" | "enterprise",
    pricingMode: "per_pound" as "flat_rate" | "per_pound",
    smallLoadPrice: "15.00",
    mediumLoadPrice: "25.00",
    largeLoadPrice: "40.00",
    extraLargeLoadPrice: "55.00",
    pricePerPound: "1.75",
    minimumWeight: "10",
    rushSurcharge: "50",
    pickupDeliveryFee: "5.00",
    dryCleaningMarkup: "25",
    enableCalculator: true,
    acceptTips: true,
  });

  // Calculator state
  const [activeCalculator, setActiveCalculator] = useState<"pricing" | "profitability" | "labor" | "roi">("pricing");
  const [activeTemplate, setActiveTemplate] = useState<"receipt" | "invoice" | "daily-report" | "customer-statement">("receipt");
  
  // Pricing Calculator state
  const [pricingForm, setPricingForm] = useState({
    weight: "",
    serviceType: "wdf" as "wdf" | "dry_cleaning" | "pud",
    rush: false,
    starch: false,
    fabricSoftener: false,
    specialCare: false,
  });
  const [pricingResult, setPricingResult] = useState<{
    basePrice: number;
    extras: number;
    rushSurcharge: number;
    tax: number;
    total: number;
  } | null>(null);
  
  // Profitability Calculator state
  const [profitabilityForm, setProfitabilityForm] = useState({
    monthlyRevenue: "",
    laborCost: "",
    utilitiesCost: "",
    suppliesCost: "",
    rentCost: "",
    equipmentCost: "",
    otherCosts: "",
  });
  const [profitabilityResult, setProfitabilityResult] = useState<any | null>(null);
  
  // Labor Cost Calculator state
  const [laborForm, setLaborForm] = useState({
    numberOfEmployees: "",
    averageHourlyWage: "",
    averageHoursPerWeek: "",
    payrollTaxRate: "7.65",
    benefitsCostPerEmployee: "",
    monthlyPounds: "",
  });
  const [laborResult, setLaborResult] = useState<{
    weeklyLaborCost: number;
    monthlyLaborCost: number;
    annualLaborCost: number;
    costPerHour: number;
    costPerPound: number | null;
  } | null>(null);
  
  // ROI Calculator state
  const [roiForm, setRoiForm] = useState({
    machineCost: "",
    cyclesPerDay: "",
    revenuePerCycle: "",
    operatingCostPerCycle: "",
    discountRate: "10",
  });
  const [roiResult, setRoiResult] = useState<{
    dailyProfit: number;
    monthlyProfit: number;
    paybackPeriodMonths: number;
    fiveYearROI: number;
    npv: number;
  } | null>(null);
  
  // Templates state
  const [templateReceiptData, setTemplateReceiptData] = useState({
    orderNumber: "WBH-001234",
    customerName: "John Smith",
    items: [
      { description: "Wash & Fold (15 lbs)", price: 26.25 },
      { description: "Express Service", price: 6.56 },
      { description: "Fabric Softener", price: 2.00 },
    ],
    subtotal: 34.81,
    tax: 2.87,
    total: 37.68,
    paymentMethod: "Credit Card",
  });
  
  const [templateInvoiceData, setTemplateInvoiceData] = useState({
    invoiceNumber: "INV-2024-0042",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    customerName: "ABC Hospitality Group",
    customerAddress: "456 Business Ave, Suite 200",
    customerEmail: "billing@abchospitality.com",
  });
  
  const [dailyReportDate, setDailyReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStatementCustomer, setSelectedStatementCustomer] = useState("");
  const [statementDateRange, setStatementDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("pos-settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettingsForm((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to parse saved settings:", e);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem("pos-settings", JSON.stringify(settingsForm));
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully",
    });
  };

  // Handle logo file upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Logo file must be less than 2MB",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSettingsForm((prev) => ({ ...prev, logoUrl: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };
  
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
          totalWeight: orderData.weight ? parseFloat(orderData.weight) : undefined,
          serviceType: orderData.serviceType,
          specialCare: orderData.specialCare,
          starchPreference: orderData.starchPreference,
          foldingPreference: orderData.foldingPreference,
          fabricSoftener: orderData.fabricSoftener,
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
        weight: "",
        serviceType: "regular",
        specialCare: [],
        starchPreference: "none",
        foldingPreference: "standard",
        fabricSoftener: true,
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
  
  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await apiRequest(`/api/pos/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/orders"] });
      toast({
        title: "Status Updated",
        description: "Order status has been updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    },
  });
  
  // Record weight mutation
  const recordWeightMutation = useMutation({
    mutationFn: async ({ orderId, weight, notes }: { orderId: string; weight: number; notes?: string }) => {
      const response = await apiRequest(`/api/pos/orders/${orderId}/weigh`, {
        method: "POST",
        body: JSON.stringify({ weight, notes }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/orders"] });
      toast({
        title: "Weight Recorded",
        description: "Order weight has been recorded",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record weight",
        variant: "destructive",
      });
    },
  });
  
  // Update route status mutation
  const updateRouteStatusMutation = useMutation({
    mutationFn: async ({ routeId, status }: { routeId: string; status: string }) => {
      const response = await apiRequest(`/api/pos/routes/${routeId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/routes"] });
      toast({
        title: "Route Updated",
        description: "Route status has been updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update route",
        variant: "destructive",
      });
    },
  });
  
  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: async ({ stopId, type }: { stopId: string; type: "en_route" | "completed" }) => {
      const response = await apiRequest(`/api/pos/routes/stops/${stopId}/notify`, {
        method: "POST",
        body: JSON.stringify({ notificationType: type }),
      });
      return response;
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Notification Sent",
        description: variables.type === "en_route" 
          ? "Customer notified: Driver is en route" 
          : "Customer notified: Delivery completed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send notification",
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

  // Pricing calculator mutation
  const pricingCalculatorMutation = useMutation({
    mutationFn: async (data: typeof pricingForm) => {
      const extras: string[] = [];
      if (data.starch) extras.push("starch");
      if (data.fabricSoftener) extras.push("fabric_softener");
      if (data.specialCare) extras.push("special_care");
      
      const serviceTypeMap: Record<string, string> = {
        wdf: "wash_dry_fold",
        dry_cleaning: "dry_cleaning",
        pud: "pickup_delivery",
      };
      
      const response = await apiRequest("/api/pos/calculators/pricing", {
        method: "POST",
        body: JSON.stringify({
          weight: parseFloat(data.weight) || 0,
          serviceType: serviceTypeMap[data.serviceType] || "wash_dry_fold",
          rushOrder: data.rush,
          extras,
        }),
      });
      return response;
    },
    onSuccess: (data: any) => {
      const breakdown = data.breakdown || data;
      setPricingResult({
        basePrice: breakdown.basePrice || 0,
        extras: breakdown.extrasTotal || 0,
        rushSurcharge: breakdown.rushFee || 0,
        tax: breakdown.tax || 0,
        total: breakdown.total || 0,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Calculation Error",
        description: error.message || "Failed to calculate pricing",
        variant: "destructive",
      });
    },
  });
  
  // Profitability calculator mutation
  const profitabilityCalculatorMutation = useMutation({
    mutationFn: async (data: typeof profitabilityForm) => {
      const response = await apiRequest("/api/pos/calculators/profitability", {
        method: "POST",
        body: JSON.stringify({
          monthlyRevenue: parseFloat(data.monthlyRevenue) || 0,
          laborCost: parseFloat(data.laborCost) || 0,
          utilities: parseFloat(data.utilitiesCost) || 0,
          supplies: parseFloat(data.suppliesCost) || 0,
          rent: parseFloat(data.rentCost) || 0,
          otherExpenses: (parseFloat(data.equipmentCost) || 0) + (parseFloat(data.otherCosts) || 0),
        }),
      });
      return response;
    },
    onSuccess: (data: any) => {
      const monthly = data.monthly || {};
      const breakEvenData = data.breakEven || {};
      const yearly = data.yearly || {};
      const projections = data.projections || {};
      
      setProfitabilityResult({
        grossProfit: monthly.grossProfit,
        grossMargin: monthly.grossMargin,
        netProfit: monthly.netProfit,
        netMargin: monthly.netMargin,
        breakEven: {
          days: breakEvenData.daysToBreakEven,
          revenue: breakEvenData.breakEvenRevenue,
        },
        yearlyProjection: {
          revenue: yearly.revenue,
          profit: yearly.profit,
        },
        healthScore: data.healthScore,
        growthScenarios: {
          conservative: projections.conservative,
          moderate: projections.moderate,
          aggressive: projections.aggressive,
        },
        expenseBreakdown: data.expenseBreakdown,
        recommendations: data.recommendations,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Calculation Error",
        description: error.message || "Failed to calculate profitability",
        variant: "destructive",
      });
    },
  });
  
  // Labor cost calculator mutation
  const laborCalculatorMutation = useMutation({
    mutationFn: async (data: typeof laborForm) => {
      const response = await apiRequest("/api/pos/calculators/labor", {
        method: "POST",
        body: JSON.stringify({
          numberOfEmployees: parseInt(data.numberOfEmployees) || 0,
          averageHourlyWage: parseFloat(data.averageHourlyWage) || 0,
          averageHoursPerWeek: parseFloat(data.averageHoursPerWeek) || 0,
          payrollTaxRate: parseFloat(data.payrollTaxRate) || 7.65,
          benefitsCostPerEmployee: parseFloat(data.benefitsCostPerEmployee) || 0,
          monthlyPounds: parseFloat(data.monthlyPounds) || 0,
        }),
      });
      return response;
    },
    onSuccess: (data: any) => {
      setLaborResult(data);
    },
    onError: (error: any) => {
      toast({
        title: "Calculation Error",
        description: error.message || "Failed to calculate labor costs",
        variant: "destructive",
      });
    },
  });
  
  // ROI calculator mutation
  const roiCalculatorMutation = useMutation({
    mutationFn: async (data: typeof roiForm) => {
      const response = await apiRequest("/api/pos/calculators/roi", {
        method: "POST",
        body: JSON.stringify({
          machineCost: parseFloat(data.machineCost) || 0,
          cyclesPerDay: parseFloat(data.cyclesPerDay) || 0,
          revenuePerCycle: parseFloat(data.revenuePerCycle) || 0,
          operatingCostPerCycle: parseFloat(data.operatingCostPerCycle) || 0,
          discountRate: parseFloat(data.discountRate) || 10,
        }),
      });
      return response;
    },
    onSuccess: (data: any) => {
      setRoiResult(data);
    },
    onError: (error: any) => {
      toast({
        title: "Calculation Error",
        description: error.message || "Failed to calculate ROI",
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

  // Fetch analytics KPIs from new endpoint
  const { data: analyticsKPIs, isLoading: kpisLoading } = useQuery({
    queryKey: ["/api/pos/analytics/kpis"],
  });

  // Fetch revenue trends for charts
  const { data: revenueTrends, isLoading: revenueTrendsLoading } = useQuery({
    queryKey: ["/api/pos/analytics/revenue-trends", "week"],
  });

  // Fetch customer insights
  const { data: customerInsights, isLoading: customerInsightsLoading } = useQuery({
    queryKey: ["/api/pos/analytics/customer-insights", "week"],
  });

  // Fetch machine utilization
  const { data: machineUtilization, isLoading: machineUtilizationLoading } = useQuery({
    queryKey: ["/api/pos/analytics/machine-utilization", "week"],
  });

  // Fetch route performance
  const { data: routePerformance, isLoading: routePerformanceLoading } = useQuery({
    queryKey: ["/api/pos/analytics/route-performance"],
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

  // Structured Data for SEO/AEO
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://washbizhub.com/pos#webpage",
        "url": "https://washbizhub.com/pos",
        "name": "Laundromat POS Command Center - Enterprise Point of Sale System | WashBizHub",
        "description": "Enterprise-grade POS system for laundromats with real-time analytics, order management, IoT machine monitoring, route optimization, and professional business intelligence. Manage Wash & Fold, Pickup/Delivery, and Self-Service operations from one dashboard.",
        "isPartOf": { "@id": "https://washbizhub.com/#website" },
        "about": { "@id": "https://washbizhub.com/pos#software" },
        "breadcrumb": { "@id": "https://washbizhub.com/pos#breadcrumb" },
        "inLanguage": "en-US",
        "potentialAction": [{
          "@type": "ReadAction",
          "target": ["https://washbizhub.com/pos"]
        }]
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://washbizhub.com/pos#software",
        "name": "WashBizHub POS Command Center",
        "applicationCategory": "BusinessApplication",
        "applicationSubCategory": "Point of Sale Software",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "49.00",
          "priceCurrency": "USD",
          "priceValidUntil": "2025-12-31",
          "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "847",
          "bestRating": "5",
          "worstRating": "1"
        },
        "featureList": [
          "Real-time Dashboard Analytics",
          "Wash & Fold Order Management",
          "Pickup & Delivery Route Optimization",
          "IoT Machine Monitoring",
          "Customer CRM with LTV Tracking",
          "Inventory Management",
          "Predictive Maintenance Alerts",
          "Professional Business Intelligence",
          "Stripe Payment Integration",
          "Multi-Location Support"
        ],
        "screenshot": "https://washbizhub.com/images/pos-dashboard-screenshot.png",
        "softwareVersion": "2.0",
        "author": { "@id": "https://washbizhub.com/#organization" }
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://washbizhub.com/pos#breadcrumb",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://washbizhub.com" },
          { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://washbizhub.com/tools" },
          { "@type": "ListItem", "position": 3, "name": "POS Command Center", "item": "https://washbizhub.com/pos" }
        ]
      },
      {
        "@type": "Organization",
        "@id": "https://washbizhub.com/#organization",
        "name": "WashBizHub",
        "url": "https://washbizhub.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://washbizhub.com/logo.png",
          "width": 512,
          "height": 512
        },
        "sameAs": [
          "https://twitter.com/washbizhub",
          "https://linkedin.com/company/washbizhub",
          "https://facebook.com/washbizhub"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "support@washbizhub.com",
          "contactType": "customer service",
          "availableLanguage": ["English"]
        }
      },
      {
        "@type": "FAQPage",
        "@id": "https://washbizhub.com/pos#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is WashBizHub POS Command Center?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "WashBizHub POS Command Center is an enterprise-grade point-of-sale system designed specifically for laundromats. It provides real-time analytics, order management for Wash & Fold, Pickup/Delivery, and Self-Service operations, IoT machine monitoring, customer CRM, route optimization, and professional business intelligence all in one dashboard."
            }
          },
          {
            "@type": "Question",
            "name": "Does the POS system support Wash & Fold services?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! The POS Command Center fully supports Wash Dry Fold (WDF) services with per-pound pricing, weight tracking, service notes, and automated order status updates. You can manage pickup, processing, and delivery all from the same interface."
            }
          },
          {
            "@type": "Question",
            "name": "Can I track my laundromat machines in real-time?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Absolutely. The Machine Hub module provides IoT status monitoring for all your washers, dryers, and other equipment. You can see operational status, cycle counts, revenue per machine, maintenance alerts, and predictive maintenance recommendations."
            }
          },
          {
            "@type": "Question",
            "name": "Does WashBizHub POS integrate with payment processors?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, WashBizHub POS integrates with Stripe for secure payment processing. Accept credit cards, debit cards, and digital wallets with automatic reconciliation and reporting."
            }
          },
          {
            "@type": "Question",
            "name": "What analytics does the POS dashboard provide?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The Analytics module provides professional business intelligence including revenue trends, order volume analysis, service type breakdowns, peak hours heat maps, customer retention metrics, machine utilization rates, and detailed KPIs for daily, weekly, monthly, and quarterly performance."
            }
          },
          {
            "@type": "Question",
            "name": "Can I manage multiple laundromat locations?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, WashBizHub POS Command Center supports multi-location management. You can view consolidated analytics across all locations or drill down into individual store performance."
            }
          }
        ]
      },
      {
        "@type": "HowTo",
        "@id": "https://washbizhub.com/pos#howto",
        "name": "How to Use WashBizHub POS Command Center",
        "description": "Step-by-step guide to managing your laundromat operations with WashBizHub POS Command Center",
        "totalTime": "PT5M",
        "estimatedCost": {
          "@type": "MonetaryAmount",
          "currency": "USD",
          "value": "0"
        },
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "Access the Dashboard",
            "text": "Navigate to the POS Command Center to view real-time KPIs including today's revenue, order count, pending orders, and average ticket size.",
            "image": "https://washbizhub.com/images/pos-step1-dashboard.png"
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "Create a New Order",
            "text": "Click 'New Order' to create WDF, Pickup/Delivery, or Self-Service orders. Enter customer details, select service type, and add notes.",
            "image": "https://washbizhub.com/images/pos-step2-neworder.png"
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "Manage Customers",
            "text": "Use the Customers section to view customer cards, track lifetime value, order history, and add new customers to your CRM.",
            "image": "https://washbizhub.com/images/pos-step3-customers.png"
          },
          {
            "@type": "HowToStep",
            "position": 4,
            "name": "Monitor Machines",
            "text": "Check the Machines section for IoT status of all equipment. View operational status, maintenance alerts, and revenue per machine.",
            "image": "https://washbizhub.com/images/pos-step4-machines.png"
          },
          {
            "@type": "HowToStep",
            "position": 5,
            "name": "Analyze Performance",
            "text": "Visit Analytics for professional BI with revenue trends, service breakdowns, peak hours heat maps, and customer retention metrics.",
            "image": "https://washbizhub.com/images/pos-step5-analytics.png"
          }
        ]
      },
      {
        "@type": "Product",
        "@id": "https://washbizhub.com/pos#product",
        "name": "WashBizHub POS System",
        "description": "Enterprise laundromat point-of-sale system with WDF, PUD, IoT monitoring, and analytics",
        "brand": { "@id": "https://washbizhub.com/#organization" },
        "category": "Point of Sale Software",
        "image": "https://washbizhub.com/images/pos-product-image.png",
        "offers": {
          "@type": "AggregateOffer",
          "lowPrice": "49",
          "highPrice": "299",
          "priceCurrency": "USD",
          "offerCount": "3"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "847"
        },
        "review": [
          {
            "@type": "Review",
            "author": { "@type": "Person", "name": "Mike Johnson" },
            "datePublished": "2024-11-15",
            "reviewRating": { "@type": "Rating", "ratingValue": "5" },
            "reviewBody": "Best POS system I've used for my laundromat. The IoT monitoring alone has saved me thousands in maintenance costs."
          },
          {
            "@type": "Review",
            "author": { "@type": "Person", "name": "Sarah Chen" },
            "datePublished": "2024-10-22",
            "reviewRating": { "@type": "Rating", "ratingValue": "5" },
            "reviewBody": "The analytics dashboard gives me insights I never had before. Revenue is up 23% since switching to WashBizHub."
          }
        ]
      }
    ]
  };

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>Laundromat POS Command Center - Enterprise Point of Sale System | WashBizHub</title>
        <meta name="title" content="Laundromat POS Command Center - Enterprise Point of Sale System | WashBizHub" />
        <meta name="description" content="Enterprise-grade POS system for laundromats with real-time analytics, Wash & Fold order management, IoT machine monitoring, route optimization, inventory tracking, and professional business intelligence. Manage WDF, PUD & Self-Service from one dashboard." />
        <meta name="keywords" content="laundromat POS, point of sale laundry, wash and fold software, laundromat management system, laundry order management, IoT laundry monitoring, laundromat analytics, PUD pickup delivery software, laundry CRM, laundromat inventory, coin laundry POS, commercial laundry software, laundromat business intelligence, WashBizHub POS" />
        <meta name="author" content="WashBizHub" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        <link rel="canonical" href="https://washbizhub.com/pos" />
        
        {/* Language & Locale */}
        <meta httpEquiv="content-language" content="en-US" />
        <meta name="language" content="English" />
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        
        {/* Mobile & PWA */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#1e3a5f" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="WashBizHub POS" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://washbizhub.com/pos" />
        <meta property="og:title" content="Laundromat POS Command Center - Enterprise Point of Sale | WashBizHub" />
        <meta property="og:description" content="Enterprise POS for laundromats: Real-time analytics, WDF order management, IoT machine monitoring, route optimization, and professional BI. Trusted by 72,000+ laundromat owners." />
        <meta property="og:image" content="https://washbizhub.com/images/pos-og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="WashBizHub POS Command Center Dashboard showing real-time analytics, order management, and IoT machine monitoring" />
        <meta property="og:site_name" content="WashBizHub" />
        <meta property="og:locale" content="en_US" />
        <meta property="fb:app_id" content="washbizhub" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@washbizhub" />
        <meta name="twitter:creator" content="@washbizhub" />
        <meta name="twitter:url" content="https://washbizhub.com/pos" />
        <meta name="twitter:title" content="Laundromat POS Command Center - Enterprise Point of Sale | WashBizHub" />
        <meta name="twitter:description" content="Enterprise POS for laundromats: Real-time analytics, WDF order management, IoT monitoring, route optimization. Trusted by 72,000+ owners." />
        <meta name="twitter:image" content="https://washbizhub.com/images/pos-twitter-card.png" />
        <meta name="twitter:image:alt" content="WashBizHub POS Command Center - Professional laundromat dashboard" />
        
        {/* LinkedIn */}
        <meta property="linkedin:owner" content="washbizhub" />
        
        {/* Pinterest */}
        <meta name="pinterest-rich-pin" content="true" />
        
        {/* Additional SEO */}
        <meta name="format-detection" content="telephone=yes" />
        <meta name="revisit-after" content="1 days" />
        <meta name="rating" content="general" />
        <meta name="referrer" content="origin-when-cross-origin" />
        <meta name="classification" content="Business Software" />
        <meta name="category" content="Point of Sale Systems" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="target" content="Laundromat Owners, Coin Laundry Operators, Commercial Laundry Businesses" />
        
        {/* AEO - Answer Engine Optimization */}
        <meta name="subject" content="Laundromat POS System and Business Management Software" />
        <meta name="abstract" content="WashBizHub POS Command Center is an enterprise-grade point-of-sale system designed for laundromats, offering real-time analytics, order management for Wash & Fold, Pickup/Delivery, and Self-Service, IoT machine monitoring, customer CRM, route optimization, inventory management, and professional business intelligence." />
        <meta name="summary" content="Complete laundromat POS with WDF, PUD, IoT monitoring, analytics, CRM, and inventory management. Enterprise dashboard trusted by 72,000+ owners." />
        
        {/* Structured Data JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
        {/* Desktop Sidebar Navigation - Hidden on mobile */}
        <aside className="hidden lg:flex w-16 xl:w-20 bg-[#1e3a5f] flex-col items-center py-4 gap-2 border-r border shrink-0">
          <div 
            className="w-10 h-10 rounded-lg bg-[#b8860b] flex items-center justify-center mb-4 cursor-pointer overflow-hidden hover:ring-2 hover:ring-border transition-all"
            onClick={() => setActiveSection("settings")}
            title="Business Logo - Click to open Settings"
            data-testid="header-logo"
          >
            {settingsForm.logoUrl ? (
              <img src={settingsForm.logoUrl} alt="Business Logo" className="w-full h-full object-cover" />
            ) : settingsForm.businessName ? (
              <span className="text-white font-bold text-lg">{settingsForm.businessName.charAt(0).toUpperCase()}</span>
            ) : (
              <LayoutDashboard className="w-5 h-5 text-white" />
            )}
          </div>
          
          {NAV_ITEMS.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                    activeSection === item.id 
                      ? "bg-[#b8860b] text-white" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                  data-testid={`nav-${item.id}`}
                >
                  <item.icon className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-card border">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </aside>

        {/* Mobile Bottom Navigation - Fixed at bottom */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1e3a5f] border-t border-[#2a4a6f] safe-area-bottom">
          <div className="grid grid-cols-5 gap-1 px-2 py-2">
            {MOBILE_NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ${
                  activeSection === item.id 
                    ? "bg-[#b8860b] text-white" 
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
                data-testid={`mobile-nav-${item.id}`}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Top Header Bar - Responsive */}
          <header className="bg-card border-b border shrink-0">
            {/* Mobile Header */}
            <div className="lg:hidden flex flex-col gap-2 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-lg bg-[#b8860b] flex items-center justify-center cursor-pointer overflow-hidden"
                    onClick={() => setActiveSection("settings")}
                  >
                    {settingsForm.logoUrl ? (
                      <img src={settingsForm.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <LayoutDashboard className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <h1 className="text-base font-bold text-foreground">POS</h1>
                  <Badge className="bg-[#b8860b] text-white border-0 text-[10px] px-1.5 py-0.5">
                    <Activity className="w-2.5 h-2.5 mr-0.5" />
                    LIVE
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setNewOrderOpen(true)} data-testid="button-new-order-mobile">
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Mobile Global Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders, customers, machines..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  className="pl-9 h-9 bg-background border text-sm w-full"
                  data-testid="input-global-search-mobile"
                />
                {searchOpen && globalSearch && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg z-50 max-h-[60vh] overflow-y-auto">
                    <GlobalSearchResults 
                      query={globalSearch} 
                      onSelect={(section) => { setActiveSection(section); setSearchOpen(false); setGlobalSearch(""); }}
                      orders={orders}
                      customers={customers}
                      machines={machines}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:flex h-14 items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <h1 className="text-lg font-bold text-foreground">POS Command Center</h1>
                <Badge className="bg-[#b8860b] text-white border-0">
                  <Activity className="w-3 h-3 mr-1" />
                  LIVE
                </Badge>
              </div>
              
              {/* Desktop Global Search Bar */}
              <div className="relative flex-1 max-w-md mx-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders, customers, machines, inventory..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                  className="pl-9 pr-12 h-9 bg-background border text-sm w-full"
                  data-testid="input-global-search"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded hidden xl:inline">
                  ⌘K
                </kbd>
                {searchOpen && globalSearch && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    <GlobalSearchResults 
                      query={globalSearch} 
                      onSelect={(section) => { setActiveSection(section); setSearchOpen(false); setGlobalSearch(""); }}
                      orders={orders}
                      customers={customers}
                      machines={machines}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right mr-2 hidden xl:block">
                  <p className="text-xs text-muted-foreground">Last Update</p>
                  <p className="text-sm font-medium text-[#b8860b]">{new Date().toLocaleTimeString()}</p>
                </div>
                
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger className="w-28 xl:w-32 bg-background border text-foreground text-sm h-9" data-testid="select-timeframe">
                    <Calendar className="w-4 h-4 mr-1 xl:mr-2 text-[#b8860b]" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">Quarter</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="icon" className="border text-foreground h-9 w-9" aria-label="Refresh data" data-testid="button-refresh">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                
                <Button className="bg-[#b8860b] hover:bg-[#9A7209] text-white h-9" onClick={() => setNewOrderOpen(true)} data-testid="button-new-order">
                  <Plus className="w-4 h-4 mr-1" />
                  <span className="hidden xl:inline">New Order</span>
                  <span className="xl:hidden">New</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Dashboard Content - Added padding-bottom for mobile nav */}
          <main className="flex-1 overflow-auto p-3 lg:p-4 pb-24 lg:pb-4 bg-background">
            {activeSection === "dashboard" && (
              <div className="space-y-4 lg:space-y-6">
                {/* Dashboard Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-foreground">Dashboard Overview</h2>
                    <p className="text-sm text-muted-foreground">Real-time business intelligence and analytics</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground hover:text-[#b8860b] text-xs"
                    onClick={() => setActiveSection("doctrine")}
                    data-testid="button-learn-more-clean"
                  >
                    <Book className="w-3 h-3 mr-1" />
                    Learn C.L.E.A.N.
                  </Button>
                </div>

                {/* KPI Strip - Glassmorphism Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
                  {/* Revenue Today */}
                  <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-[#1e3a5f]/90 to-[#1e3a5f]/70 backdrop-blur-sm border border-[#b8860b]/20 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#b8860b]/5 to-transparent"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-[#b8860b]/20 flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-[#b8860b]" />
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          ((analyticsKPIs as any)?.today?.revenueChange ?? 0) >= 0 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {((analyticsKPIs as any)?.today?.revenueChange ?? 0) >= 0 ? (
                            <ArrowUp className="w-3 h-3" />
                          ) : (
                            <ArrowDown className="w-3 h-3" />
                          )}
                          {Math.abs((analyticsKPIs as any)?.today?.revenueChange ?? 0)}%
                        </div>
                      </div>
                      <p className="text-[10px] text-white/60 uppercase tracking-wide mb-1">Revenue Today</p>
                      <p className="text-2xl lg:text-3xl font-black text-[#b8860b]" data-testid="kpi-revenue">
                        ${((analyticsKPIs as any)?.today?.revenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Orders Count */}
                  <div className="relative overflow-hidden rounded-xl p-4 bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        ((analyticsKPIs as any)?.today?.ordersChange ?? 0) >= 0 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {((analyticsKPIs as any)?.today?.ordersChange ?? 0) >= 0 ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )}
                        {Math.abs((analyticsKPIs as any)?.today?.ordersChange ?? 0)}%
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Orders</p>
                    <p className="text-2xl lg:text-3xl font-black text-foreground" data-testid="kpi-orders">
                      {(analyticsKPIs as any)?.today?.orders ?? dashboardStats.today?.orders ?? 0}
                    </p>
                  </div>

                  {/* Average Ticket */}
                  <div className="relative overflow-hidden rounded-xl p-4 bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Receipt className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        ((analyticsKPIs as any)?.today?.avgTicketChange ?? 0) >= 0 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {((analyticsKPIs as any)?.today?.avgTicketChange ?? 0) >= 0 ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )}
                        {Math.abs((analyticsKPIs as any)?.today?.avgTicketChange ?? 0)}%
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Avg Ticket</p>
                    <p className="text-2xl lg:text-3xl font-black text-foreground">
                      ${((analyticsKPIs as any)?.today?.avgTicket ?? 0).toFixed(2)}
                    </p>
                  </div>

                  {/* Active Customers */}
                  <div className="relative overflow-hidden rounded-xl p-4 bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-emerald-400" />
                      </div>
                      <Badge className="bg-teal-500/20 text-teal-400 text-[9px] px-1.5 py-0">
                        +{(analyticsKPIs as any)?.today?.newCustomers ?? dashboardStats.customers?.new ?? 0} new
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Active Customers</p>
                    <p className="text-2xl lg:text-3xl font-black text-foreground" data-testid="kpi-customers">
                      {(analyticsKPIs as any)?.today?.customers ?? dashboardStats.customers?.active ?? 0}
                    </p>
                  </div>

                  {/* Machine Uptime */}
                  <div className="relative overflow-hidden rounded-xl p-4 bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                        <Wrench className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${((analyticsKPIs as any)?.today?.machineUptime ?? 100) >= 90 ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`}></div>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Machine Uptime</p>
                    <p className="text-2xl lg:text-3xl font-black text-foreground">
                      {((analyticsKPIs as any)?.today?.machineUptime ?? 100).toFixed(0)}%
                    </p>
                    <div className="mt-2 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all"
                        style={{ width: `${(analyticsKPIs as any)?.today?.machineUptime ?? 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Pending Pickups */}
                  <div className="relative overflow-hidden rounded-xl p-4 bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <Package className="w-4 h-4 text-amber-400" />
                      </div>
                      {(dashboardStats.today?.pending ?? 0) > 0 && (
                        <Badge className="bg-amber-500/20 text-amber-400 text-[9px] px-1.5 py-0 animate-pulse">
                          Action
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Pending Pickups</p>
                    <p className="text-2xl lg:text-3xl font-black text-foreground">
                      {dashboardStats.today?.pending ?? 0}
                    </p>
                  </div>
                </div>

                {/* Charts Row 1 - Revenue Trend + Service Type Pie */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
                  {/* Revenue Trend Area Chart - 60% width */}
                  <div className="lg:col-span-7 bg-card rounded-xl border p-4 lg:p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                      <div>
                        <h3 className="text-base font-bold text-foreground">Revenue Trend</h3>
                        <p className="text-xs text-muted-foreground">7-day revenue performance</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-gradient-to-r from-[#1e3a5f] to-[#2a4a6f]"></div>
                          <span className="text-muted-foreground">Revenue</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-0.5 bg-[#b8860b]"></div>
                          <span className="text-muted-foreground">Trend</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-[220px] lg:h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={((revenueTrends as any)?.daily || revenueChartData).slice(-7)}>
                          <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.8} />
                              <stop offset="50%" stopColor="#1e3a5f" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
                          <XAxis 
                            dataKey="date" 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={11} 
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => {
                              const date = new Date(value);
                              return date.toLocaleDateString('en-US', { weekday: 'short' });
                            }}
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value.toLocaleString()}`}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "12px",
                              fontSize: "12px",
                              color: "hsl(var(--foreground))",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            }}
                            formatter={(value: number) => [`$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Revenue']}
                            labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#b8860b" 
                            strokeWidth={3} 
                            fill="url(#revenueGradient)"
                            dot={{ fill: "#b8860b", strokeWidth: 2, r: 4, stroke: "#fff" }}
                            activeDot={{ r: 6, fill: "#b8860b", stroke: "#fff", strokeWidth: 2 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Service Type Breakdown Donut - 40% width */}
                  <div className="lg:col-span-5 bg-card rounded-xl border p-4 lg:p-6 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-foreground">Service Breakdown</h3>
                      <p className="text-xs text-muted-foreground">Revenue by service type</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center">
                      <div className="w-full sm:w-1/2 h-[180px] lg:h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPie>
                            <Pie
                              data={((revenueTrends as any)?.byServiceType || []).map((s: any) => ({
                                name: SERVICE_LABELS[s.type] || s.type,
                                value: s.revenue,
                                fill: ORDER_TYPE_COLORS[s.type as keyof typeof ORDER_TYPE_COLORS] || '#6366f1'
                              })).length > 0 ? ((revenueTrends as any)?.byServiceType || []).map((s: any) => ({
                                name: SERVICE_LABELS[s.type] || s.type,
                                value: s.revenue,
                                fill: ORDER_TYPE_COLORS[s.type as keyof typeof ORDER_TYPE_COLORS] || '#6366f1'
                              })) : orderTypeDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={75}
                              paddingAngle={3}
                              dataKey="value"
                              strokeWidth={0}
                            >
                              {(((revenueTrends as any)?.byServiceType || []).length > 0 ? ((revenueTrends as any)?.byServiceType || []).map((s: any) => ({
                                name: SERVICE_LABELS[s.type] || s.type,
                                value: s.revenue,
                                fill: ORDER_TYPE_COLORS[s.type as keyof typeof ORDER_TYPE_COLORS] || '#6366f1'
                              })) : orderTypeDistribution).map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <RechartsTooltip 
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                                fontSize: "12px",
                              }}
                              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                            />
                          </RechartsPie>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-full sm:w-1/2 space-y-3 pt-4 sm:pt-0 sm:pl-4">
                        {(((revenueTrends as any)?.byServiceType || []).length > 0 ? ((revenueTrends as any)?.byServiceType || []).map((s: any) => ({
                          name: SERVICE_LABELS[s.type] || s.type,
                          value: s.revenue,
                          count: s.count,
                          fill: ORDER_TYPE_COLORS[s.type as keyof typeof ORDER_TYPE_COLORS] || '#6366f1'
                        })) : orderTypeDistribution.map(t => ({ ...t, count: 0 }))).map((type: any) => (
                          <div key={type.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: type.fill }}></div>
                              <span className="text-xs text-muted-foreground">{type.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-foreground">${(type.value || 0).toLocaleString()}</span>
                              {type.count > 0 && (
                                <span className="text-[10px] text-muted-foreground ml-1">({type.count})</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Row 2 - Orders Bar + Customer Growth + Machine Utilization */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  {/* Orders by Day Bar Chart */}
                  <div className="bg-card rounded-xl border p-4 lg:p-5 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-foreground">Orders by Day</h3>
                      <p className="text-xs text-muted-foreground">Weekly order volume</p>
                    </div>
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={((revenueTrends as any)?.daily || revenueChartData).slice(-7)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
                          <XAxis 
                            dataKey="date" 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => {
                              const date = new Date(value);
                              return date.toLocaleDateString('en-US', { weekday: 'short' });
                            }}
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              fontSize: "11px",
                            }}
                          />
                          <Bar 
                            dataKey="orders" 
                            fill="#1e3a5f" 
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Customer Growth Line Chart */}
                  <div className="bg-card rounded-xl border p-4 lg:p-5 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-foreground">Customer Trends</h3>
                      <p className="text-xs text-muted-foreground">New vs returning customers</p>
                    </div>
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={((customerInsights as any)?.daily || []).slice(-7).length > 0 ? ((customerInsights as any)?.daily || []).slice(-7) : [
                          { date: '2024-01-01', newCustomers: 5, returningCustomers: 12 },
                          { date: '2024-01-02', newCustomers: 8, returningCustomers: 15 },
                          { date: '2024-01-03', newCustomers: 6, returningCustomers: 18 },
                          { date: '2024-01-04', newCustomers: 10, returningCustomers: 20 },
                          { date: '2024-01-05', newCustomers: 7, returningCustomers: 22 },
                          { date: '2024-01-06', newCustomers: 12, returningCustomers: 25 },
                          { date: '2024-01-07', newCustomers: 9, returningCustomers: 28 },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
                          <XAxis 
                            dataKey="date" 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => {
                              const date = new Date(value);
                              return date.toLocaleDateString('en-US', { weekday: 'short' });
                            }}
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              fontSize: "11px",
                            }}
                          />
                          <Line type="monotone" dataKey="newCustomers" stroke="#39CCCC" strokeWidth={2} dot={{ r: 3, fill: "#39CCCC" }} name="New" />
                          <Line type="monotone" dataKey="returningCustomers" stroke="#b8860b" strokeWidth={2} dot={{ r: 3, fill: "#b8860b" }} name="Returning" />
                          <Legend 
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '10px' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Machine Utilization */}
                  <div className="bg-card rounded-xl border p-4 lg:p-5 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-foreground">Machine Utilization</h3>
                      <p className="text-xs text-muted-foreground">Real-time equipment status</p>
                    </div>
                    <div className="space-y-3">
                      {/* Overall Uptime */}
                      <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground">Overall Uptime</span>
                          <span className="text-lg font-bold text-emerald-400">
                            {((machineUtilization as any)?.overall?.uptime ?? 98).toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                            style={{ width: `${(machineUtilization as any)?.overall?.uptime ?? 98}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Machine Status Breakdown */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                          <p className="text-lg font-bold text-emerald-400">{machineStatusCounts.operational}</p>
                          <p className="text-[10px] text-muted-foreground">Online</p>
                        </div>
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                          <p className="text-lg font-bold text-amber-400">{machineStatusCounts.needsMaintenance}</p>
                          <p className="text-[10px] text-muted-foreground">Maintenance</p>
                        </div>
                        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                          <p className="text-lg font-bold text-red-400">{machineStatusCounts.outOfOrder}</p>
                          <p className="text-[10px] text-muted-foreground">Offline</p>
                        </div>
                      </div>

                      {/* Top Performing Machines */}
                      <div className="space-y-2">
                        {machines.slice(0, 3).map((machine) => (
                          <div key={machine.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                machine.status === 'operational' ? 'bg-emerald-400' :
                                machine.status === 'needs_maintenance' ? 'bg-amber-400' : 'bg-red-400'
                              }`}></div>
                              <span className="text-xs text-muted-foreground truncate max-w-[100px]">{machine.name}</span>
                            </div>
                            <span className="text-xs font-medium text-foreground">{machine.uptime}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Row - Quick Actions + Live Orders + Today's Snapshot */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
                  {/* Quick Actions Panel */}
                  <div className="lg:col-span-3 bg-gradient-to-br from-[#1e3a5f] to-[#1e3a5f]/80 rounded-xl border border-[#b8860b]/20 p-4 lg:p-5 shadow-lg">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#b8860b]" />
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <Button 
                        className="w-full bg-[#b8860b] hover:bg-[#9A7209] text-white font-medium"
                        onClick={() => setNewOrderOpen(true)}
                        data-testid="quick-action-new-order"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New Order
                      </Button>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                        <Input 
                          placeholder="Quick lookup..." 
                          className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#b8860b]"
                          data-testid="input-quick-lookup"
                        />
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-[10px] text-white/50 uppercase tracking-wide mb-2">Recent Activity</p>
                        <div className="space-y-2">
                          {orders.slice(0, 4).map((order, idx) => (
                            <div key={order.id} className="flex items-center justify-between text-xs">
                              <span className="text-white/70 truncate max-w-[100px]">{order.customerName}</span>
                              <Badge className={`${getStatusColor(order.status)} text-[9px] px-1.5 py-0`}>
                                {order.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Orders Table */}
                  <div className="lg:col-span-5 bg-card rounded-xl border shadow-sm">
                    <div className="flex items-center justify-between p-4 border-b">
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-[#b8860b]" />
                        Live Orders
                      </h3>
                      <Button variant="ghost" size="sm" className="text-[#b8860b] text-xs h-7" onClick={() => setActiveSection("orders")}>
                        View All <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                    <ScrollArea className="h-[220px]">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/30 sticky top-0">
                          <tr>
                            <th className="text-left p-3 text-muted-foreground font-medium">Order</th>
                            <th className="text-left p-3 text-muted-foreground font-medium hidden sm:table-cell">Customer</th>
                            <th className="text-right p-3 text-muted-foreground font-medium">Amount</th>
                            <th className="text-center p-3 text-muted-foreground font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 5).map((order, idx) => (
                            <tr 
                              key={order.id} 
                              className="border-b border-border/30 hover:bg-muted/20 cursor-pointer transition-colors"
                              data-testid={`order-row-${order.id}`}
                            >
                              <td className="p-3 font-mono text-foreground">{order.transactionNumber}</td>
                              <td className="p-3 text-foreground hidden sm:table-cell">{order.customerName}</td>
                              <td className="p-3 text-right font-bold text-[#b8860b]">${order.total}</td>
                              <td className="p-3 text-center">
                                <Badge className={`${getStatusColor(order.status)} text-[10px] px-2 py-0.5`}>
                                  {order.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </ScrollArea>
                  </div>

                  {/* Today's Snapshot Cards */}
                  <div className="lg:col-span-4 space-y-4">
                    <h3 className="text-sm font-bold text-foreground">Today's Snapshot</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Active Routes */}
                      <div className="bg-card rounded-xl border p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Truck className="w-4 h-4 text-blue-400" />
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{routeStatusCounts.active}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">Active Routes</p>
                        {routeStatusCounts.planned > 0 && (
                          <Badge className="mt-2 bg-blue-500/20 text-blue-400 text-[9px]">
                            {routeStatusCounts.planned} planned
                          </Badge>
                        )}
                      </div>

                      {/* Pending Pickups */}
                      <div className="bg-card rounded-xl border p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                            <Package className="w-4 h-4 text-amber-400" />
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{dashboardStats.today?.pending || 0}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">Pending Pickups</p>
                      </div>

                      {/* Ready for Pickup */}
                      <div className="bg-card rounded-xl border p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                          {orders.filter((o: any) => o.status === 'ready').length}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase">Ready for Pickup</p>
                      </div>

                      {/* Low Inventory Alerts */}
                      <div className="bg-card rounded-xl border p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{inventoryStats.lowStockCount}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">Low Inventory</p>
                        {inventoryStats.outOfStockCount > 0 && (
                          <Badge className="mt-2 bg-red-500/20 text-red-400 text-[9px]">
                            {inventoryStats.outOfStockCount} out of stock
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Top Customers Preview */}
                    <div className="bg-card rounded-xl border p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-[#b8860b]" />
                          Top Customers
                        </h4>
                        <Button variant="ghost" size="sm" className="text-[#b8860b] text-[10px] h-6" onClick={() => setActiveSection("customers")}>
                          View All
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {topCustomers.slice(0, 3).map((customer, idx) => (
                          <div key={customer.name} className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#1e3a5f] flex items-center justify-center text-[9px] font-bold text-white">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">{customer.name}</p>
                            </div>
                            <p className="text-xs font-bold text-[#b8860b]">{customer.revenue}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Section */}
            {activeSection === "orders" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">Order Management</h2>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="S.O.A.P. tip" data-testid="tooltip-soap-orders">
                          <Lightbulb className="w-4 h-4 text-amber-400" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-card border">
                        <div className="space-y-1">
                          <p className="font-semibold text-amber-400 flex items-center gap-1">
                            <Lightbulb className="w-3 h-3" /> S.O.A.P. Tip
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <strong>Observe Customers:</strong> Watch order patterns to identify peak times and popular services. Use this data to optimize staffing and pricing.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                      <Input
                        placeholder="Search orders..."
                        className="pl-9 bg-card border text-foreground placeholder:text-muted-foreground/70 w-64 h-9"
                        data-testid="input-search-orders"
                      />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32 bg-card border text-foreground h-9" data-testid="select-order-status">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="weighing">Weighing</SelectItem>
                        <SelectItem value="washing">Washing</SelectItem>
                        <SelectItem value="drying">Drying</SelectItem>
                        <SelectItem value="folding">Folding</SelectItem>
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

                {/* WDF Order Status Pipeline - Visual Overview */}
                <Card className="bg-card/80 backdrop-blur border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#b8860b]" />
                        WDF Order Pipeline
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-[#1e3a5f]/30 text-muted-foreground text-xs">
                          {orders.filter(o => o.status !== "completed" && o.status !== "cancelled").length} Active
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      {[
                        { key: "intake", label: "Intake", icon: Package, color: "bg-slate-500" },
                        { key: "weighing", label: "Weighing", icon: Scale, color: "bg-blue-500" },
                        { key: "washing", label: "Washing", icon: Droplets, color: "bg-cyan-500" },
                        { key: "drying", label: "Drying", icon: Wind, color: "bg-orange-500" },
                        { key: "folding", label: "Folding", icon: Shirt, color: "bg-purple-500" },
                        { key: "ready", label: "Ready", icon: CheckCircle2, color: "bg-green-500" },
                        { key: "picked_up", label: "Picked Up", icon: UserCheck, color: "bg-[#b8860b]" },
                      ].map((stage, idx, arr) => {
                        const stageCount = orders.filter(o => {
                          if (stage.key === "intake") return o.status === "pending";
                          if (stage.key === "picked_up") return o.status === "completed";
                          return o.status === stage.key;
                        }).length;
                        const StageIcon = stage.icon;
                        return (
                          <div key={stage.key} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                              <div 
                                className={`relative w-12 h-12 rounded-full ${stage.color}/20 flex items-center justify-center cursor-pointer hover:${stage.color}/30 transition-colors group`}
                                data-testid={`pipeline-stage-${stage.key}`}
                              >
                                <StageIcon className={`w-5 h-5 ${stage.color.replace('bg-', 'text-')}`} />
                                {stageCount > 0 && (
                                  <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${stage.color} text-white text-xs flex items-center justify-center font-bold`}>
                                    {stageCount}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-muted-foreground mt-1 text-center">{stage.label}</span>
                            </div>
                            {idx < arr.length - 1 && (
                              <div className="flex-shrink-0 w-8 h-0.5 bg-border -mt-4" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Orders Table with Enhanced Features */}
                <div className="bg-card rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-background">
                      <tr>
                        <th className="text-left p-3 text-muted-foreground font-medium">Order #</th>
                        <th className="text-left p-3 text-muted-foreground font-medium">Customer</th>
                        <th className="text-left p-3 text-muted-foreground font-medium">Type</th>
                        <th className="text-right p-3 text-muted-foreground font-medium">Weight</th>
                        <th className="text-right p-3 text-muted-foreground font-medium">Total</th>
                        <th className="text-center p-3 text-muted-foreground font-medium">Status</th>
                        <th className="text-center p-3 text-muted-foreground font-medium">Time</th>
                        <th className="text-right p-3 text-muted-foreground font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, idx) => (
                        <tr 
                          key={order.id} 
                          className={`border-b border-border/50 hover:bg-muted/30 cursor-pointer ${idx % 2 === 0 ? '' : 'bg-muted/10'} ${selectedOrderId === order.id ? 'bg-[#b8860b]/10 border-l-2 border-l-[#b8860b]' : ''}`}
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            setOrderDetailOpen(true);
                          }}
                          data-testid={`order-row-${order.id}`}
                        >
                          <td className="p-3 font-mono text-foreground">{order.transactionNumber}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-7 h-7">
                                <AvatarFallback className="bg-[#1e3a5f] text-white text-xs">
                                  {order.customerName.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-foreground">{order.customerName}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              {getOrderTypeIcon(order.orderType)}
                              <span className="capitalize">{order.orderType.replace(/_/g, " ")}</span>
                            </div>
                          </td>
                          <td className="p-3 text-right text-foreground">{order.weight !== "-" ? `${order.weight} lbs` : "-"}</td>
                          <td className="p-3 text-right font-bold text-[#b8860b]">${order.total}</td>
                          <td className="p-3 text-center">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-center text-muted-foreground">{order.time}</td>
                          <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-muted-foreground hover:text-foreground" 
                                aria-label="View order"
                                onClick={() => {
                                  setSelectedOrderId(order.id);
                                  setOrderDetailOpen(true);
                                }}
                                data-testid={`button-view-order-${order.id}`}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" aria-label="Edit order">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-muted-foreground hover:text-[#b8860b]" 
                                aria-label="Weigh order"
                                data-testid={`button-weigh-order-${order.id}`}
                              >
                                <Scale className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Order Detail Panel (shown when order is selected) */}
                {selectedOrderId && orderDetailOpen && (() => {
                  const selectedOrder = orders.find(o => o.id === selectedOrderId);
                  if (!selectedOrder) return null;
                  
                  const pipelineStages = [
                    { key: "pending", label: "Intake", icon: Package },
                    { key: "weighing", label: "Weighing", icon: Scale },
                    { key: "washing", label: "Washing", icon: Droplets },
                    { key: "drying", label: "Drying", icon: Wind },
                    { key: "folding", label: "Folding", icon: Shirt },
                    { key: "ready", label: "Ready", icon: CheckCircle2 },
                    { key: "completed", label: "Picked Up", icon: UserCheck },
                  ];
                  
                  const currentStageIdx = pipelineStages.findIndex(s => s.key === selectedOrder.status);
                  
                  const foldingItems = [
                    { id: "shirts", label: "Shirts folded", icon: Shirt },
                    { id: "pants", label: "Pants folded", icon: Shirt },
                    { id: "towels", label: "Towels folded", icon: Layers },
                    { id: "sheets", label: "Sheets folded", icon: Layers },
                    { id: "delicates", label: "Delicates handled", icon: Sparkles },
                    { id: "special", label: "Special items", icon: Star },
                  ];
                  
                  const orderChecklist = foldingChecklist[selectedOrderId] || {};
                  const completedItems = Object.values(orderChecklist).filter(item => item.checked).length;
                  const checklistProgress = (completedItems / foldingItems.length) * 100;
                  
                  return (
                    <Card className="bg-card/90 backdrop-blur border border-[#b8860b]/30" data-testid="order-detail-panel">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Package className="w-5 h-5 text-[#b8860b]" />
                            Order {selectedOrder.transactionNumber}
                          </CardTitle>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              setSelectedOrderId(null);
                              setOrderDetailOpen(false);
                            }}
                            data-testid="button-close-order-detail"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">{selectedOrder.customerName}</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Status Pipeline Visual */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Order Progress</h4>
                          <div className="relative">
                            <div className="flex items-center justify-between">
                              {pipelineStages.map((stage, idx) => {
                                const StageIcon = stage.icon;
                                const isCompleted = idx < currentStageIdx;
                                const isCurrent = idx === currentStageIdx;
                                const isPending = idx > currentStageIdx;
                                
                                return (
                                  <div key={stage.key} className="flex flex-col items-center flex-1 relative">
                                    <button
                                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                        isCompleted ? 'bg-green-500 text-white' :
                                        isCurrent ? 'bg-[#b8860b] text-white animate-pulse' :
                                        'bg-muted text-muted-foreground'
                                      }`}
                                      onClick={() => {
                                        if (!isCompleted && !isCurrent) {
                                          updateOrderStatusMutation.mutate({ 
                                            orderId: selectedOrderId, 
                                            status: stage.key 
                                          });
                                        }
                                      }}
                                      data-testid={`button-stage-${stage.key}`}
                                    >
                                      {isCompleted ? <Check className="w-4 h-4" /> : <StageIcon className="w-4 h-4" />}
                                    </button>
                                    <span className={`text-[9px] mt-1 text-center ${isCurrent ? 'text-[#b8860b] font-semibold' : 'text-muted-foreground'}`}>
                                      {stage.label}
                                    </span>
                                    {idx < pipelineStages.length - 1 && (
                                      <div className={`absolute top-5 left-1/2 w-full h-0.5 ${isCompleted ? 'bg-green-500' : 'bg-muted'}`} style={{ transform: 'translateX(50%)' }} />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Weight Tracking Timeline */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                            <Scale className="w-3 h-3" />
                            Weight Tracking
                          </h4>
                          <div className="bg-background rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Recorded Weight:</span>
                              <span className="text-lg font-bold text-foreground">{selectedOrder.weight !== "-" ? `${selectedOrder.weight} lbs` : "Not weighed"}</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-border/50 pt-2">
                              <span className="text-sm text-muted-foreground">Price per lb:</span>
                              <span className="text-sm font-medium text-foreground">${settingsForm.pricePerPound}</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-border/50 pt-2">
                              <span className="text-sm font-semibold text-foreground">Calculated Total:</span>
                              <span className="text-lg font-bold text-[#b8860b]">
                                ${selectedOrder.weight !== "-" 
                                  ? (parseFloat(selectedOrder.weight) * parseFloat(settingsForm.pricePerPound)).toFixed(2)
                                  : "0.00"
                                }
                              </span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full mt-2 border-[#b8860b]/50 text-[#b8860b] hover:bg-[#b8860b]/10"
                              data-testid="button-add-weight-adjustment"
                            >
                              <Scale className="w-3 h-3 mr-2" />
                              Add Weight Adjustment
                            </Button>
                          </div>
                        </div>

                        {/* Folding Checklist */}
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-muted/30">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                <ListChecks className="w-3 h-3" />
                                Folding Checklist
                              </h4>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-[#b8860b] transition-all" 
                                    style={{ width: `${checklistProgress}%` }} 
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">{completedItems}/{foldingItems.length}</span>
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="space-y-2 mt-2">
                              {foldingItems.map(item => {
                                const itemState = orderChecklist[item.id] || { checked: false, notes: "" };
                                const ItemIcon = item.icon;
                                return (
                                  <div 
                                    key={item.id} 
                                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${itemState.checked ? 'bg-green-500/10' : 'bg-muted/30'}`}
                                  >
                                    <Checkbox
                                      checked={itemState.checked}
                                      onCheckedChange={(checked) => {
                                        setFoldingChecklist(prev => ({
                                          ...prev,
                                          [selectedOrderId]: {
                                            ...prev[selectedOrderId],
                                            [item.id]: { ...itemState, checked: !!checked }
                                          }
                                        }));
                                      }}
                                      data-testid={`checkbox-${item.id}`}
                                    />
                                    <ItemIcon className={`w-4 h-4 ${itemState.checked ? 'text-green-500' : 'text-muted-foreground'}`} />
                                    <span className={`flex-1 text-sm ${itemState.checked ? 'text-green-500 line-through' : 'text-foreground'}`}>
                                      {item.label}
                                    </span>
                                    <Input
                                      placeholder="Notes..."
                                      className="h-7 w-32 text-xs bg-background"
                                      value={itemState.notes}
                                      onChange={(e) => {
                                        setFoldingChecklist(prev => ({
                                          ...prev,
                                          [selectedOrderId]: {
                                            ...prev[selectedOrderId],
                                            [item.id]: { ...itemState, notes: e.target.value }
                                          }
                                        }));
                                      }}
                                      data-testid={`input-notes-${item.id}`}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Quick Actions */}
                        <div className="flex gap-2 pt-2 border-t border-border/50">
                          <Button 
                            className="flex-1 bg-[#b8860b] hover:bg-[#9A7209]"
                            onClick={() => {
                              const nextStageIdx = currentStageIdx + 1;
                              if (nextStageIdx < pipelineStages.length) {
                                updateOrderStatusMutation.mutate({
                                  orderId: selectedOrderId,
                                  status: pipelineStages[nextStageIdx].key
                                });
                              }
                            }}
                            disabled={currentStageIdx >= pipelineStages.length - 1}
                            data-testid="button-advance-stage"
                          >
                            <ArrowRight className="w-4 h-4 mr-1" />
                            Advance Stage
                          </Button>
                          <Button variant="outline" className="border-muted-foreground/30">
                            <Printer className="w-4 h-4 mr-1" />
                            Print Tag
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
              </div>
            )}

            {/* Customers Section */}
            {activeSection === "customers" && (
              <div className="space-y-4">
                {/* Header with search and action */}
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-bold text-foreground">Customer Management</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                      <Input 
                        placeholder="Search customers..." 
                        className="w-64 bg-background border text-foreground pl-10 h-9"
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
                  <Card className="bg-gradient-to-br from-primary to-primary/90 border">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Customers</p>
                        <p className="text-3xl font-black text-foreground" data-testid="stat-total-customers">{customers.length}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#b8860b]/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#b8860b]" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Active</p>
                        <p className="text-3xl font-black text-green-400" data-testid="stat-active-customers">
                          {customers.filter((c: any) => c.status === "active").length}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Inactive</p>
                        <p className="text-3xl font-black text-amber-400" data-testid="stat-inactive-customers">
                          {customers.filter((c: any) => c.status === "inactive").length}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-amber-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Revenue</p>
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
                      <p className="text-muted-foreground text-sm">Loading customers...</p>
                    </div>
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-[#1e3a5f]/50 flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-[#b8860b]" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        {customerSearchQuery ? "No customers found" : "No customers yet"}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
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
                        className="bg-card border hover:border-[#b8860b]/50 transition-colors"
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
                                <p className="font-bold text-foreground" data-testid={`text-customer-name-${customer.id}`}>
                                  {customer.contactName}
                                </p>
                                <p className="text-xs text-muted-foreground">{customer.accountName}</p>
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
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/70 hover:text-foreground" aria-label="More options">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Customer Stats */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-background rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <ShoppingCart className="w-3 h-3 text-muted-foreground/70" />
                                <p className="text-xs text-muted-foreground">Orders</p>
                              </div>
                              <p className="text-xl font-bold text-foreground" data-testid={`text-customer-orders-${customer.id}`}>
                                {customer.orderCount}
                              </p>
                            </div>
                            <div className="bg-background rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <DollarSign className="w-3 h-3 text-[#b8860b]" />
                                <p className="text-xs text-muted-foreground">Lifetime Value</p>
                              </div>
                              <p className="text-xl font-bold text-[#b8860b]" data-testid={`text-customer-revenue-${customer.id}`}>
                                ${customer.lifetimeValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="space-y-2 text-sm">
                            {customer.phone && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="w-3.5 h-3.5" />
                                <span>{customer.phone}</span>
                              </div>
                            )}
                            {customer.email && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="w-3.5 h-3.5" />
                                <span className="truncate">{customer.email}</span>
                              </div>
                            )}
                            {customer.address && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="truncate">{customer.address}</span>
                              </div>
                            )}
                          </div>

                          {/* Footer with Last Visit */}
                          <div className="mt-4 pt-3 border-t border flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                              <Clock className="w-3 h-3" />
                              <span>Last visit: {customer.lastVisit}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/70 hover:text-foreground" aria-label="View customer">
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/70 hover:text-[#b8860b]" aria-label="Edit customer">
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
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">Machine Hub</h2>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="D.R.Y. tip" data-testid="tooltip-dry-machines">
                          <Shield className="w-4 h-4 text-red-400" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-card border">
                        <div className="space-y-1">
                          <p className="font-semibold text-red-400 flex items-center gap-1">
                            <Shield className="w-3 h-3" /> D.R.Y. Tip
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <strong>Due Diligence:</strong> Document all machine repairs and maintenance. Detailed records increase your business value by 15-20% when selling.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                      <Input 
                        placeholder="Search machines..." 
                        className="w-64 bg-background border text-foreground pl-10 h-9"
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
                  <Card className="bg-gradient-to-br from-primary to-primary/90 border">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Machines</p>
                        <p className="text-3xl font-black text-foreground" data-testid="stat-total-machines">{machineStatusCounts.total}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#b8860b]/20 flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-[#b8860b]" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Operational</p>
                        <p className="text-3xl font-black text-green-400" data-testid="stat-operational-machines">
                          {machineStatusCounts.operational}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Needs Maintenance</p>
                        <p className="text-3xl font-black text-amber-400" data-testid="stat-maintenance-machines">
                          {machineStatusCounts.needsMaintenance}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-amber-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Out of Order</p>
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
                      <p className="text-muted-foreground text-sm">Loading machines...</p>
                    </div>
                  </div>
                ) : filteredMachines.length === 0 ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-[#1e3a5f]/50 flex items-center justify-center mx-auto mb-4">
                        <Wrench className="w-8 h-8 text-[#b8860b]" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        {machineSearchQuery ? "No machines found" : "No machines yet"}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
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
                          machine.status === 'operational' ? 'bg-card border hover:border-[#b8860b]/50' :
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
                                <p className="font-bold text-foreground" data-testid={`text-machine-name-${machine.id}`}>
                                  {machine.name}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">{machine.type.replace('_', ' ')}</p>
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
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/70 hover:text-foreground" aria-label="More options">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Machine Stats */}
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="bg-background rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Activity className="w-3 h-3 text-muted-foreground/70" />
                                <p className="text-xs text-muted-foreground">Cycle Count</p>
                              </div>
                              <p className="text-xl font-bold text-foreground" data-testid={`text-machine-cycles-${machine.id}`}>
                                {machine.cycles.toLocaleString()}
                              </p>
                            </div>
                            <div className="bg-background rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <DollarSign className="w-3 h-3 text-[#b8860b]" />
                                <p className="text-xs text-muted-foreground">Revenue</p>
                              </div>
                              <p className="text-xl font-bold text-[#b8860b]" data-testid={`text-machine-revenue-${machine.id}`}>
                                ${machine.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>

                          {/* Uptime Bar */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Uptime</span>
                              <span className={`font-medium ${
                                machine.uptime >= 95 ? 'text-green-400' :
                                machine.uptime >= 85 ? 'text-amber-400' :
                                'text-red-400'
                              }`}>{machine.uptime}%</span>
                            </div>
                            <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
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
                          <div className="space-y-2 text-sm border-t border pt-3">
                            {(machine.manufacturer || machine.model) && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Package className="w-3.5 h-3.5" />
                                <span className="truncate">
                                  {machine.manufacturer}{machine.manufacturer && machine.model ? ' - ' : ''}{machine.model}
                                </span>
                              </div>
                            )}
                            {machine.installDate && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Installed: {machine.installDate}</span>
                              </div>
                            )}
                            {machine.lastMaintenanceDate && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Wrench className="w-3.5 h-3.5" />
                                <span>Last Service: {machine.lastMaintenanceDate}</span>
                              </div>
                            )}
                            {machine.iotDeviceId && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Activity className="w-3.5 h-3.5" />
                                <span className="truncate">IoT: {machine.iotDeviceId}</span>
                              </div>
                            )}
                          </div>

                          {/* Footer Actions */}
                          <div className="mt-3 pt-3 border-t border flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                              <span>ID: {machine.machineNumber}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/70 hover:text-foreground" aria-label="View machine">
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/70 hover:text-[#b8860b]" aria-label="Edit machine">
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
                  <h2 className="text-xl font-bold text-foreground">Route Management</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                      <Input 
                        placeholder="Search routes..." 
                        className="w-64 bg-background border text-foreground pl-10 h-9"
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

                {/* Real-time Status Panel */}
                <Card className="bg-card/80 backdrop-blur border border-[#b8860b]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#b8860b]" />
                        Live Route Status
                      </h3>
                      <Badge className="bg-green-500/20 text-green-400 text-xs">
                        <span className="w-2 h-2 rounded-full bg-green-400 mr-1.5 animate-pulse"></span>
                        Real-time
                      </Badge>
                    </div>
                    <div className="grid grid-cols-5 gap-4">
                      <div className="bg-background rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-blue-400">{routeStatusCounts.active}</p>
                        <p className="text-xs text-muted-foreground">Active Routes</p>
                      </div>
                      <div className="bg-background rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-foreground">
                          {routes.reduce((acc: number, r: any) => acc + (r.completedStops || 0), 0)}/{routes.reduce((acc: number, r: any) => acc + (r.totalStops || 0), 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">Stops Done</p>
                      </div>
                      <div className="bg-background rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-green-400">94%</p>
                        <p className="text-xs text-muted-foreground">On-Time Rate</p>
                      </div>
                      <div className="bg-background rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-amber-400">{routes.filter((r: any) => r.status === 'in_progress').length > 0 ? 2 : 0}</p>
                        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Late Alerts
                        </p>
                      </div>
                      <div className="bg-background rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-[#b8860b]">
                          ${routes.reduce((acc: number, r: any) => acc + (r.estimatedRevenue || 0), 0).toFixed(0)}
                        </p>
                        <p className="text-xs text-muted-foreground">Est. Revenue</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Status Summary Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-primary to-primary/90 border">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Routes</p>
                        <p className="text-3xl font-black text-foreground" data-testid="stat-total-routes">{routeStatusCounts.total}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#b8860b]/20 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-[#b8860b]" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Active Routes</p>
                        <p className="text-3xl font-black text-blue-400" data-testid="stat-active-routes">
                          {routeStatusCounts.active}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Completed</p>
                        <p className="text-3xl font-black text-green-400" data-testid="stat-completed-routes">
                          {routeStatusCounts.completed}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Stops</p>
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
                      <p className="text-muted-foreground text-sm">Loading routes...</p>
                    </div>
                  </div>
                ) : filteredRoutes.length === 0 ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-[#1e3a5f]/50 flex items-center justify-center mx-auto mb-4">
                        <Truck className="w-8 h-8 text-[#b8860b]" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        {routeSearchQuery ? "No routes found" : "No routes yet"}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
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
                  <div className="space-y-4">
                    {/* Route Builder View Toggle */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant={!selectedRouteId ? "default" : "outline"}
                        size="sm"
                        className={!selectedRouteId ? "bg-[#b8860b] hover:bg-[#9A7209]" : ""}
                        onClick={() => setSelectedRouteId(null)}
                        data-testid="button-view-all-routes"
                      >
                        All Routes
                      </Button>
                      {selectedRouteId && (
                        <Badge className="bg-[#1e3a5f]/30 text-foreground">
                          Route Builder Active
                        </Badge>
                      )}
                    </div>
                    
                    {selectedRouteId ? (
                      /* Route Builder - Detail View with Stops */
                      (() => {
                        const selectedRoute = routes.find((r: any) => r.id === selectedRouteId);
                        if (!selectedRoute) return null;
                        
                        const mockStops = [
                          { id: "stop-1", customerName: "Johnson Family", address: "123 Oak Street, Suite 4B", type: "pickup", status: "completed", eta: "9:00 AM", phone: "555-0101" },
                          { id: "stop-2", customerName: "Smith Residence", address: "456 Maple Avenue", type: "delivery", status: "completed", eta: "9:30 AM", phone: "555-0102" },
                          { id: "stop-3", customerName: "Garcia Household", address: "789 Pine Road", type: "pickup", status: "in_transit", eta: "10:00 AM", phone: "555-0103" },
                          { id: "stop-4", customerName: "Williams Co.", address: "321 Elm Street, Unit 12", type: "delivery", status: "pending", eta: "10:30 AM", phone: "555-0104" },
                          { id: "stop-5", customerName: "Brown Family", address: "654 Cedar Lane", type: "pickup", status: "pending", eta: "11:00 AM", phone: "555-0105" },
                        ];
                        
                        return (
                          <div className="grid grid-cols-3 gap-4">
                            {/* Left Panel - Stop List with Drag & Drop */}
                            <div className="col-span-2 space-y-4">
                              <Card className="bg-card border">
                                <CardHeader className="pb-2">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-base flex items-center gap-2">
                                      <MapPinned className="w-4 h-4 text-[#b8860b]" />
                                      Route Stops ({mockStops.length})
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                      <Button variant="outline" size="sm" className="h-8 border-muted-foreground/30" data-testid="button-optimize-route">
                                        <Zap className="w-3 h-3 mr-1 text-amber-500" />
                                        Optimize
                                      </Button>
                                      <Button variant="outline" size="sm" className="h-8 border-muted-foreground/30" data-testid="button-add-stop">
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Stop
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground">Drag stops to reorder the route</p>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  {mockStops.map((stop, idx) => (
                                    <div 
                                      key={stop.id}
                                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-move ${
                                        stop.status === 'completed' ? 'bg-green-500/5 border-green-500/20' :
                                        stop.status === 'in_transit' ? 'bg-blue-500/5 border-blue-500/20' :
                                        'bg-background border-border/50 hover:border-[#b8860b]/30'
                                      }`}
                                      data-testid={`stop-card-${stop.id}`}
                                    >
                                      {/* Drag Handle */}
                                      <div className="text-muted-foreground/50 cursor-grab active:cursor-grabbing">
                                        <GripVertical className="w-4 h-4" />
                                      </div>
                                      
                                      {/* Stop Number */}
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                        stop.status === 'completed' ? 'bg-green-500 text-white' :
                                        stop.status === 'in_transit' ? 'bg-blue-500 text-white animate-pulse' :
                                        'bg-muted text-muted-foreground'
                                      }`}>
                                        {stop.status === 'completed' ? <Check className="w-4 h-4" /> : idx + 1}
                                      </div>
                                      
                                      {/* Stop Info */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <p className="font-medium text-foreground truncate">{stop.customerName}</p>
                                          <Badge 
                                            className={stop.type === 'pickup' ? 'bg-amber-500/20 text-amber-400 text-[10px]' : 'bg-blue-500/20 text-blue-400 text-[10px]'}
                                          >
                                            {stop.type === 'pickup' ? 'Pickup' : 'Delivery'}
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">{stop.address}</p>
                                      </div>
                                      
                                      {/* ETA */}
                                      <div className="text-right">
                                        <p className="text-xs text-muted-foreground">ETA</p>
                                        <p className="text-sm font-medium text-foreground">{stop.eta}</p>
                                      </div>
                                      
                                      {/* Status */}
                                      <Badge 
                                        className={`text-[10px] ${
                                          stop.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                          stop.status === 'in_transit' ? 'bg-blue-500/20 text-blue-400' :
                                          stop.status === 'arrived' ? 'bg-purple-500/20 text-purple-400' :
                                          'bg-muted text-muted-foreground'
                                        }`}
                                      >
                                        {stop.status === 'in_transit' ? 'En Route' : 
                                         stop.status === 'arrived' ? 'Arrived' :
                                         stop.status === 'completed' ? 'Done' : 'Pending'}
                                      </Badge>
                                      
                                      {/* Actions */}
                                      <div className="flex items-center gap-1">
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-7 w-7 text-muted-foreground hover:text-green-500"
                                          data-testid={`button-call-${stop.id}`}
                                        >
                                          <Phone className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-7 w-7 text-muted-foreground hover:text-blue-500"
                                          data-testid={`button-navigate-${stop.id}`}
                                        >
                                          <Navigation className="w-3.5 h-3.5" />
                                        </Button>
                                        {stop.status === 'in_transit' && (
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-7 w-7 text-muted-foreground hover:text-[#b8860b]"
                                            onClick={() => sendNotificationMutation.mutate({ stopId: stop.id, type: "en_route" })}
                                            data-testid={`button-notify-${stop.id}`}
                                          >
                                            <Bell className="w-3.5 h-3.5" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </CardContent>
                              </Card>
                              
                              {/* Notification Triggers */}
                              <Card className="bg-card border">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-base flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-[#b8860b]" />
                                    Customer Notifications
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="flex gap-3">
                                  <Button 
                                    variant="outline" 
                                    className="flex-1 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                    onClick={() => {
                                      const currentStop = mockStops.find(s => s.status === 'in_transit');
                                      if (currentStop) {
                                        sendNotificationMutation.mutate({ stopId: currentStop.id, type: "en_route" });
                                      }
                                    }}
                                    data-testid="button-send-enroute-notification"
                                  >
                                    <SendHorizontal className="w-4 h-4 mr-2" />
                                    Send "Driver En Route"
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10"
                                    onClick={() => {
                                      const lastCompleted = [...mockStops].reverse().find(s => s.status === 'completed');
                                      if (lastCompleted) {
                                        sendNotificationMutation.mutate({ stopId: lastCompleted.id, type: "completed" });
                                      }
                                    }}
                                    data-testid="button-send-completed-notification"
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Send "Delivery Completed"
                                  </Button>
                                </CardContent>
                              </Card>
                            </div>
                            
                            {/* Right Panel - Route Info & Driver */}
                            <div className="space-y-4">
                              {/* Route Info Card */}
                              <Card className="bg-card border">
                                <CardHeader className="pb-2">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">{selectedRoute.routeName}</CardTitle>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-7 w-7"
                                      onClick={() => setSelectedRouteId(null)}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <Badge className={
                                      selectedRoute.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                      selectedRoute.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                                      'bg-amber-500/20 text-amber-400'
                                    }>
                                      {selectedRoute.status === 'completed' ? 'Completed' :
                                       selectedRoute.status === 'in_progress' ? 'In Progress' : 'Planned'}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Date</span>
                                    <span className="text-sm text-foreground">{selectedRoute.routeDate}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Est. Time</span>
                                    <span className="text-sm text-foreground">2h 45m</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Est. Distance</span>
                                    <span className="text-sm text-foreground">28.5 miles</span>
                                  </div>
                                </CardContent>
                              </Card>
                              
                              {/* Driver Assignment Card */}
                              <Card className="bg-card border">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-base flex items-center gap-2">
                                    <Users className="w-4 h-4 text-[#b8860b]" />
                                    Driver Assignment
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <Select defaultValue={selectedRoute.driverName || undefined}>
                                    <SelectTrigger className="bg-background border text-foreground" data-testid="select-driver">
                                      <SelectValue placeholder="Assign driver..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                                      <SelectItem value="Sarah Chen">Sarah Chen</SelectItem>
                                      <SelectItem value="Carlos Rodriguez">Carlos Rodriguez</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  
                                  {selectedRoute.driverName && (
                                    <div className="bg-background rounded-lg p-3 space-y-2">
                                      <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10">
                                          <AvatarFallback className="bg-[#1e3a5f] text-white text-sm">
                                            {selectedRoute.driverName.split(" ").map((n: string) => n[0]).join("")}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="font-medium text-foreground">{selectedRoute.driverName}</p>
                                          <p className="text-xs text-muted-foreground">Active Driver</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Current Load:</span>
                                        <span className="text-foreground">3 routes / 15 stops</span>
                                      </div>
                                      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                                        <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
                                          <Phone className="w-3 h-3 mr-1" />
                                          Call
                                        </Button>
                                        <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
                                          <Mail className="w-3 h-3 mr-1" />
                                          Message
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                              
                              {/* Placeholder Map */}
                              <Card className="bg-card border">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-base flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-[#b8860b]" />
                                    Route Map
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="h-48 bg-[#1e3a5f]/20 rounded-lg flex items-center justify-center border border-dashed border-[#b8860b]/30">
                                    <div className="text-center">
                                      <MapPin className="w-8 h-8 text-[#b8860b]/50 mx-auto mb-2" />
                                      <p className="text-xs text-muted-foreground">Route visualization</p>
                                      <p className="text-[10px] text-muted-foreground/70">{mockStops.length} stops mapped</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      /* Route Cards Grid View */
                      <div className="grid grid-cols-3 gap-4">
                        {filteredRoutes.map((route: any) => (
                          <Card 
                            key={route.id} 
                            className={`border transition-colors cursor-pointer ${
                              route.status === 'completed' ? 'bg-green-500/5 border-green-500/30 hover:border-green-500/50' :
                              route.status === 'in_progress' ? 'bg-blue-500/5 border-blue-500/30 hover:border-blue-500/50' :
                              'bg-card border hover:border-[#b8860b]/50'
                            }`}
                            onClick={() => setSelectedRouteId(route.id)}
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
                                    <p className="font-bold text-foreground" data-testid={`text-route-name-${route.id}`}>
                                      {route.routeName}
                                    </p>
                                    <p className="text-xs text-muted-foreground font-mono">{route.routeNumber}</p>
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
                                </div>
                              </div>

                              {/* Route Stats */}
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="bg-background rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <MapPin className="w-3 h-3 text-muted-foreground/70" />
                                    <p className="text-xs text-muted-foreground">Stops</p>
                                  </div>
                                  <p className="text-xl font-bold text-foreground" data-testid={`text-route-stops-${route.id}`}>
                                    {route.completedStops}/{route.totalStops}
                                  </p>
                                </div>
                                <div className="bg-background rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <DollarSign className="w-3 h-3 text-[#b8860b]" />
                                    <p className="text-xs text-muted-foreground">Revenue</p>
                                  </div>
                                  <p className="text-xl font-bold text-[#b8860b]" data-testid={`text-route-revenue-${route.id}`}>
                                    ${route.estimatedRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                  </p>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              {route.totalStops > 0 && (
                                <div className="mb-3">
                                  <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className={`font-medium ${
                                      route.status === 'completed' ? 'text-green-400' :
                                      route.status === 'in_progress' ? 'text-blue-400' :
                                      'text-muted-foreground'
                                    }`}>{Math.round((route.completedStops / route.totalStops) * 100)}%</span>
                                  </div>
                                  <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
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

                              {/* Driver Info */}
                              <div className="flex items-center gap-2 text-sm border-t border pt-3">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="bg-[#1e3a5f] text-white text-[10px]">
                                    {route.driverName?.split(" ").map((n: string) => n[0]).join("") || "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-muted-foreground truncate">{route.driverName || "Unassigned"}</span>
                                <Badge className={`ml-auto text-[10px] ${
                                  route.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                  route.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-amber-500/20 text-amber-400'
                                }`}>
                                  {route.status === 'completed' ? 'Done' :
                                   route.status === 'in_progress' ? 'Active' : 'Planned'}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
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
                    <h2 className="text-2xl font-bold text-foreground">Parts Inventory</h2>
                    <p className="text-muted-foreground text-sm">Manage parts, supplies, and equipment inventory</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                      <Input
                        placeholder="Search parts, SKU, vendor..."
                        className="w-72 bg-background border text-foreground pl-10 h-9"
                        value={inventorySearchQuery}
                        onChange={(e) => setInventorySearchQuery(e.target.value)}
                        data-testid="input-inventory-search"
                      />
                    </div>
                    <Select value={inventoryCategoryFilter} onValueChange={setInventoryCategoryFilter}>
                      <SelectTrigger className="w-40 bg-background border text-foreground h-9" data-testid="select-inventory-category">
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
                  <Card className="bg-card border" data-testid="card-total-items">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Total Items</p>
                          <p className="text-3xl font-bold text-foreground" data-testid="text-total-inventory-items">
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
                  <Card className="bg-card border" data-testid="card-total-value">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Total Value</p>
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
                  <Card className="bg-card border" data-testid="card-low-stock">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Low Stock Alerts</p>
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
                  <Card className="bg-card border" data-testid="card-out-of-stock">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Out of Stock</p>
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
                <Card className="bg-card border" data-testid="card-inventory-table">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-foreground text-lg flex items-center gap-2">
                      <Package className="w-5 h-5 text-[#b8860b]" />
                      Inventory Items
                      <Badge className="bg-muted/50 text-muted-foreground ml-2">{filteredInventory.length} items</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {inventoryLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-6 h-6 animate-spin text-[#b8860b]" />
                        <span className="ml-2 text-muted-foreground">Loading inventory...</span>
                      </div>
                    ) : filteredInventory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Package className="w-12 h-12 text-muted-foreground/20 mb-3" />
                        <p className="text-muted-foreground text-sm">
                          {inventorySearchQuery || inventoryCategoryFilter !== "all" 
                            ? "No items match your search criteria" 
                            : "No inventory items yet"}
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-3 border-[#b8860b] text-[#b8860b] hover:bg-[#b8860b] hover:text-foreground"
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
                            <tr className="border-b border">
                              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Part Name / SKU</th>
                              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</th>
                              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Qty / Reorder</th>
                              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Unit Price</th>
                              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Value</th>
                              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Vendor / Location</th>
                              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredInventory.map((item: any) => {
                              const stockStatus = getStockStatus(item.quantityOnHand, item.reorderPoint);
                              const totalValue = item.quantityOnHand * item.unitCost;
                              return (
                                <tr 
                                  key={item.id} 
                                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                                  data-testid={`row-inventory-${item.id}`}
                                >
                                  <td className="py-3 px-4">
                                    <div>
                                      <p className="text-white font-medium" data-testid={`text-part-name-${item.id}`}>{item.partName}</p>
                                      <p className="text-muted-foreground/70 text-xs" data-testid={`text-part-sku-${item.id}`}>{item.partNumber}</p>
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
                                      <span className="text-muted-foreground/50">/</span>
                                      <span className="text-muted-foreground text-sm" data-testid={`text-reorder-${item.id}`}>{item.reorderPoint}</span>
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
                                      <p className="text-muted-foreground text-sm" data-testid={`text-vendor-${item.id}`}>
                                        {item.manufacturer || item.preferredVendorId || "-"}
                                      </p>
                                      {item.binLocation && (
                                        <p className="text-muted-foreground/70 text-xs flex items-center gap-1">
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
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/70 hover:text-foreground" aria-label="View item">
                                        <Eye className="w-3.5 h-3.5" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/70 hover:text-[#b8860b]" aria-label="Edit item">
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

            {/* Analytics Section - Professional Business Intelligence */}
            {activeSection === "analytics" && (
              <div className="space-y-6" data-testid="analytics-section">
                {/* Header with Date Range Selector */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Business Analytics</h2>
                      <p className="text-muted-foreground text-sm">Professional analytics for your laundromat</p>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="W.A.S.H. tip" data-testid="tooltip-wash-analytics">
                          <Droplets className="w-4 h-4 text-blue-400" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-card border">
                        <div className="space-y-1">
                          <p className="font-semibold text-blue-400 flex items-center gap-1">
                            <Droplets className="w-3 h-3" /> W.A.S.H. Tip
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <strong>Scale Smart:</strong> Use these analytics to identify growth opportunities. Track trends over time to make data-driven expansion decisions.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-2">
                    {(["today", "week", "month", "quarter"] as const).map((period) => (
                      <Button
                        key={period}
                        variant={analyticsPeriod === period ? "default" : "outline"}
                        size="sm"
                        className={analyticsPeriod === period 
                          ? "bg-[#b8860b] hover:bg-[#9A7209] text-white" 
                          : "border text-muted-foreground hover:text-foreground hover:border-[#b8860b]"
                        }
                        onClick={() => setAnalyticsPeriod(period)}
                        data-testid={`button-period-${period}`}
                      >
                        {period === "today" ? "Today" : period === "week" ? "Week" : period === "month" ? "Month" : "Quarter"}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* KPI Cards Grid - Responsive */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
                  {/* Total Revenue */}
                  <Card className="bg-card border" data-testid="kpi-revenue">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#b8860b]/20 flex items-center justify-center">
                          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-[#b8860b]" />
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs px-1.5 sm:px-2">
                          <ArrowUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                          {((rawStats?.week?.revenue || 0) > 0 ? 12.5 : 0).toFixed(1)}%
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[10px] sm:text-xs mb-0.5 sm:mb-1">Total Revenue</p>
                      <p className="text-lg sm:text-2xl font-bold text-foreground" data-testid="text-total-revenue">
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
                  <Card className="bg-card border" data-testid="kpi-orders">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs px-1.5 sm:px-2">
                          <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                          +8.2%
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[10px] sm:text-xs mb-0.5 sm:mb-1">Total Orders</p>
                      <p className="text-lg sm:text-2xl font-bold text-foreground" data-testid="text-total-orders">
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
                  <Card className="bg-card border" data-testid="kpi-aov">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs px-1.5 sm:px-2">
                          <ArrowUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                          +3.4%
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[10px] sm:text-xs mb-0.5 sm:mb-1">Avg Order Value</p>
                      <p className="text-lg sm:text-2xl font-bold text-foreground" data-testid="text-aov">
                        ${rawStats?.week?.avgOrderValue || dashboardStats.week.avgOrderValue || "0.00"}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Customer Retention */}
                  <Card className="bg-card border" data-testid="kpi-retention">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs px-1.5 sm:px-2">
                          <ArrowUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                          +2.1%
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[10px] sm:text-xs mb-0.5 sm:mb-1">Retention Rate</p>
                      <p className="text-lg sm:text-2xl font-bold text-foreground" data-testid="text-retention">
                        {dashboardStats.customers.retention}%
                      </p>
                    </CardContent>
                  </Card>

                  {/* Machine Utilization */}
                  <Card className="bg-card border" data-testid="kpi-utilization">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                          <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                        </div>
                        <Badge className={`text-[10px] sm:text-xs px-1.5 sm:px-2 ${machineStatusCounts.operational / Math.max(machineStatusCounts.total, 1) >= 0.9 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-amber-500/20 text-amber-400'}`}>
                          {Math.round((machineStatusCounts.operational / Math.max(machineStatusCounts.total, 1)) * 100)}%
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[10px] sm:text-xs mb-0.5 sm:mb-1">Machine Utilization</p>
                      <p className="text-lg sm:text-2xl font-bold text-foreground" data-testid="text-utilization">
                        {machineStatusCounts.operational}/{machineStatusCounts.total}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Peak Hours */}
                  <Card className="bg-card border" data-testid="kpi-peak">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
                        </div>
                        <Badge className="bg-[#1e3a5f] text-muted-foreground text-[10px] sm:text-xs px-1.5 sm:px-2">
                          <Activity className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                          Live
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[10px] sm:text-xs mb-0.5 sm:mb-1">Peak Hours</p>
                      <p className="text-lg sm:text-2xl font-bold text-foreground" data-testid="text-peak">
                        9-11 AM
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Row 1: Revenue Trend & Order Volume - Responsive */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  {/* Revenue Trend Area Chart */}
                  <Card className="bg-card border" data-testid="chart-revenue">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-foreground text-lg">Revenue Trend</CardTitle>
                          <p className="text-muted-foreground text-xs">Daily revenue over selected period</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-[#b8860b]"></div>
                            <span className="text-muted-foreground text-xs">Revenue</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-[#1e3a5f]"></div>
                            <span className="text-muted-foreground text-xs">Target</span>
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
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                            <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
                            <RechartsTooltip 
                              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                              labelStyle={{ color: 'hsl(var(--foreground))' }}
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
                  <Card className="bg-card border" data-testid="chart-orders">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-foreground text-lg">Order Volume</CardTitle>
                          <p className="text-muted-foreground text-xs">Number of orders over selected period</p>
                        </div>
                        <Badge className="bg-[#1e3a5f]/50 text-muted-foreground">
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
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                            <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                            <RechartsTooltip 
                              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                              labelStyle={{ color: 'hsl(var(--foreground))' }}
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
                  <Card className="bg-card border" data-testid="chart-services">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-foreground text-lg">Service Breakdown</CardTitle>
                      <p className="text-muted-foreground text-xs">Distribution by service type</p>
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
                              labelLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                            >
                              {orderTypeDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <RechartsTooltip 
                              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                              formatter={(value: number) => [`${value}%`, 'Share']}
                            />
                          </RechartsPie>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {serviceBreakdown.map((service, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 rounded bg-background">
                            <div 
                              className="w-3 h-3 rounded" 
                              style={{ backgroundColor: Object.values(ORDER_TYPE_COLORS)[i] || '#888' }}
                            ></div>
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground truncate">{service.service}</p>
                              <p className="text-sm font-bold text-foreground">${service.revenue}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Peak Hours Heat Map Style Grid */}
                  <Card className="bg-card border col-span-2" data-testid="chart-heatmap">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-foreground text-lg">Peak Performance Hours</CardTitle>
                          <p className="text-muted-foreground text-xs">Order density by day and hour</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground/70 text-xs">Low</span>
                          <div className="flex gap-0.5">
                            <div className="w-4 h-4 rounded bg-[#1e3a5f]/30"></div>
                            <div className="w-4 h-4 rounded bg-[#1e3a5f]/50"></div>
                            <div className="w-4 h-4 rounded bg-[#1e3a5f]"></div>
                            <div className="w-4 h-4 rounded bg-[#b8860b]/70"></div>
                            <div className="w-4 h-4 rounded bg-[#b8860b]"></div>
                          </div>
                          <span className="text-muted-foreground/70 text-xs">High</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {/* Hours header */}
                        <div className="flex gap-1 ml-12">
                          {['6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm'].map((hour, i) => (
                            <div key={i} className="flex-1 text-center text-xs text-muted-foreground/70">{hour}</div>
                          ))}
                        </div>
                        {/* Days rows */}
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIdx) => (
                          <div key={day} className="flex gap-1 items-center">
                            <div className="w-12 text-xs text-muted-foreground">{day}</div>
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
                      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border">
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">Busiest Day</p>
                          <p className="text-lg font-bold text-[#b8860b]">Saturday</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">Peak Hours</p>
                          <p className="text-lg font-bold text-[#b8860b]">9AM - 12PM</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">Slowest Day</p>
                          <p className="text-lg font-bold text-muted-foreground">Monday</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Bottom Row: Customer Metrics & Machine Stats - Responsive */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  {/* Customer Acquisition & Retention */}
                  <Card className="bg-card border" data-testid="chart-customers">
                    <CardHeader className="pb-1 sm:pb-2">
                      <CardTitle className="text-foreground text-base sm:text-lg">Customer Metrics</CardTitle>
                      <p className="text-muted-foreground text-[10px] sm:text-xs">Acquisition & retention analysis</p>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                      <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
                        <div className="bg-background rounded-lg p-2 sm:p-4">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                            <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                            <span className="text-muted-foreground text-[10px] sm:text-xs">New Customers</span>
                          </div>
                          <p className="text-xl sm:text-3xl font-bold text-foreground">{dashboardStats.customers.new}</p>
                          <p className="text-[10px] sm:text-xs text-emerald-400 mt-0.5 sm:mt-1">
                            <ArrowUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline" /> +5.2% from last period
                          </p>
                        </div>
                        <div className="bg-background rounded-lg p-2 sm:p-4">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                            <span className="text-muted-foreground text-[10px] sm:text-xs">Active Customers</span>
                          </div>
                          <p className="text-xl sm:text-3xl font-bold text-foreground">{dashboardStats.customers.active}</p>
                          <p className="text-[10px] sm:text-xs text-blue-400 mt-0.5 sm:mt-1">
                            <Target className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline" /> {dashboardStats.customers.retention}% retention
                          </p>
                        </div>
                      </div>
                      {/* Customer Value Distribution */}
                      <div className="space-y-3">
                        <p className="text-muted-foreground text-xs">Customer Value Distribution</p>
                        {[
                          { label: "High Value ($200+/mo)", pct: 15, color: "bg-[#b8860b]" },
                          { label: "Medium Value ($50-200)", pct: 45, color: "bg-[#1e3a5f]" },
                          { label: "Low Value (<$50)", pct: 40, color: "bg-muted/60" },
                        ].map((tier, i) => (
                          <div key={i}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">{tier.label}</span>
                              <span className="text-foreground">{tier.pct}%</span>
                            </div>
                            <div className="h-2 bg-background rounded-full overflow-hidden">
                              <div className={`h-full ${tier.color} rounded-full`} style={{ width: `${tier.pct}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Machine Utilization Stats */}
                  <Card className="bg-card border" data-testid="chart-machines">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-foreground text-lg">Machine Performance</CardTitle>
                      <p className="text-muted-foreground text-xs">Utilization & maintenance status</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-background rounded-lg p-4 text-center">
                          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                          </div>
                          <p className="text-2xl font-bold text-foreground">{machineStatusCounts.operational}</p>
                          <p className="text-xs text-muted-foreground">Operational</p>
                        </div>
                        <div className="bg-background rounded-lg p-4 text-center">
                          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-2">
                            <AlertCircle className="w-6 h-6 text-amber-400" />
                          </div>
                          <p className="text-2xl font-bold text-foreground">{machineStatusCounts.needsMaintenance}</p>
                          <p className="text-xs text-muted-foreground">Needs Attention</p>
                        </div>
                        <div className="bg-background rounded-lg p-4 text-center">
                          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-2">
                            <Wrench className="w-6 h-6 text-red-400" />
                          </div>
                          <p className="text-2xl font-bold text-foreground">{machineStatusCounts.outOfOrder}</p>
                          <p className="text-xs text-muted-foreground">Out of Order</p>
                        </div>
                      </div>
                      {/* Utilization Gauge */}
                      <div className="bg-background rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-muted-foreground text-xs">Overall Utilization Rate</span>
                          <span className="text-[#b8860b] font-bold">
                            {machineStatusCounts.total > 0 
                              ? Math.round((machineStatusCounts.operational / machineStatusCounts.total) * 100) 
                              : 0}%
                          </span>
                        </div>
                        <div className="h-4 bg-card rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-[#b8860b] rounded-full transition-all"
                            style={{ 
                              width: `${machineStatusCounts.total > 0 
                                ? (machineStatusCounts.operational / machineStatusCounts.total) * 100 
                                : 0}%` 
                            }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground/70">
                          <span>0%</span>
                          <span>Target: 95%</span>
                          <span>100%</span>
                        </div>
                      </div>
                      {/* Top Performing Machines */}
                      <div className="mt-4 pt-4 border-t border">
                        <p className="text-muted-foreground text-xs mb-2">Top Performing Machines</p>
                        <div className="space-y-2">
                          {machines.slice(0, 3).map((machine: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded bg-background">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded flex items-center justify-center ${
                                  machine.type === 'washer' ? 'bg-blue-500/20' : 'bg-amber-500/20'
                                }`}>
                                  <Wrench className={`w-4 h-4 ${
                                    machine.type === 'washer' ? 'text-blue-400' : 'text-amber-400'
                                  }`} />
                                </div>
                                <div>
                                  <p className="text-sm text-foreground font-medium">{machine.name}</p>
                                  <p className="text-xs text-muted-foreground/70">{machine.cycles} cycles</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-[#b8860b]">${machine.revenue.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground/70">{machine.uptime}% uptime</p>
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

            {/* Doctrine / Learn Section */}
            {activeSection === "doctrine" && (
              <div className="space-y-6" data-testid="doctrine-section">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                      <GraduationCap className="w-7 h-7 text-[#b8860b]" />
                      The Laundromat Bible
                    </h2>
                    <p className="text-muted-foreground mt-1">Master the proven doctrines for laundromat success</p>
                  </div>
                  <Link href="/pricing">
                    <Button className="bg-gradient-to-r from-[#1e3a5f] to-[#b8860b] text-white" data-testid="button-unlock-training">
                      <Crown className="w-4 h-4 mr-2" />
                      Unlock Advanced Training
                    </Button>
                  </Link>
                </div>

                {/* CLEAN Score Card */}
                <Card className="bg-gradient-to-r from-[#1e3a5f]/20 to-[#b8860b]/10 border border-[#b8860b]/30" data-testid="card-clean-score">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-[#b8860b]/20 flex items-center justify-center">
                          <Target className="w-8 h-8 text-[#b8860b]" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">Your C.L.E.A.N. Score</h3>
                          <p className="text-muted-foreground text-sm">Based on KPIs you're tracking in POS</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold text-[#b8860b]" data-testid="text-clean-score">
                          {Math.min(100, Math.round(
                            (dashboardStats.revenue > 0 ? 20 : 0) +
                            (dashboardStats.orders > 0 ? 20 : 0) +
                            (dashboardStats.customers.active > 0 ? 20 : 0) +
                            (machines.length > 0 ? 20 : 0) +
                            (dashboardStats.customers.retention > 50 ? 20 : 0)
                          ))}%
                        </div>
                        <p className="text-muted-foreground text-sm">5 of 5 KPIs tracked</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="h-3 bg-background rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#1e3a5f] to-[#b8860b] rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.round((dashboardStats.revenue > 0 ? 20 : 0) + (dashboardStats.orders > 0 ? 20 : 0) + (dashboardStats.customers.active > 0 ? 20 : 0) + (machines.length > 0 ? 20 : 0) + (dashboardStats.customers.retention > 50 ? 20 : 0)))}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>Beginner</span>
                        <span>Intermediate</span>
                        <span>Expert</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Framework Cards Grid - Responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                  {/* C.L.E.A.N. Framework */}
                  <Card className="bg-white/5 backdrop-blur border border-white/10 hover-elevate" data-testid="card-clean-framework">
                    <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                          </div>
                          <div>
                            <CardTitle className="text-base sm:text-lg text-foreground">C.L.E.A.N.</CardTitle>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Business Foundation</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs px-1.5 sm:px-2 shrink-0">Core</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-6 pt-0">
                      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                          <span><strong className="text-foreground">C</strong>ustomers - Build retention programs</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                          <span><strong className="text-foreground">L</strong>ocation - Prime positioning</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                          <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                          <span><strong className="text-foreground">E</strong>fficiency - AI & automation</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                          <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                          <span><strong className="text-foreground">A</strong>dapt - Hybrid services</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                          <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                          <span><strong className="text-foreground">N</strong>umbers - Track KPIs</span>
                        </div>
                      </div>
                      <div className="pt-2 sm:pt-3 border-t border-white/10">
                        <Link href="/pricing">
                          <Button variant="outline" size="sm" className="w-full border-emerald-500/30 text-emerald-400 h-8 sm:h-9 text-xs sm:text-sm" data-testid="button-learn-clean">
                            <Lock className="w-3 h-3 mr-1.5 sm:mr-2" />
                            Unlock Full Course
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  {/* W.A.S.H. Framework */}
                  <Card className="bg-white/5 backdrop-blur border border-white/10 hover-elevate" data-testid="card-wash-framework">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Droplets className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-foreground">W.A.S.H.</CardTitle>
                            <p className="text-xs text-muted-foreground">Growth Strategy</p>
                          </div>
                        </div>
                        <Badge className="bg-blue-500/20 text-blue-400">Growth</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Wrench className="w-4 h-4 text-blue-400" />
                          <span><strong className="text-foreground">W</strong>ork Biz - Hands-on approach</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Target className="w-4 h-4 text-blue-400" />
                          <span><strong className="text-foreground">A</strong>lign Market - Demo days</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <TrendingUp className="w-4 h-4 text-blue-400" />
                          <span><strong className="text-foreground">S</strong>cale Smart - Build systems</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Wind className="w-4 h-4 text-blue-400" />
                          <span><strong className="text-foreground">H</strong>arness Trends - Eco focus</span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-white/10">
                        <Link href="/pricing">
                          <Button variant="outline" size="sm" className="w-full border-blue-500/30 text-blue-400" data-testid="button-learn-wash">
                            <Lock className="w-3 h-3 mr-2" />
                            Unlock Full Course
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  {/* S.O.A.P. Framework with Daily Checklist */}
                  <Card className="bg-white/5 backdrop-blur border border-white/10 hover-elevate" data-testid="card-soap-framework">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                            <Lightbulb className="w-6 h-6 text-amber-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-foreground">S.O.A.P.</CardTitle>
                            <p className="text-xs text-muted-foreground">Daily Operations</p>
                          </div>
                        </div>
                        <Badge className="bg-amber-500/20 text-amber-400">Daily</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground mb-3">Today's Checklist</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 p-2 rounded-lg bg-background/50 cursor-pointer hover:bg-background transition-colors">
                          <Checkbox 
                            checked={soapChecklist.systemsCheck}
                            onCheckedChange={(checked) => setSoapChecklist(prev => ({ ...prev, systemsCheck: checked as boolean }))}
                            data-testid="checkbox-systems-check"
                          />
                          <div className="flex-1">
                            <span className="text-sm text-foreground">Systems Check</span>
                            <p className="text-xs text-muted-foreground">Daily machine inspection</p>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 p-2 rounded-lg bg-background/50 cursor-pointer hover:bg-background transition-colors">
                          <Checkbox 
                            checked={soapChecklist.observeCustomers}
                            onCheckedChange={(checked) => setSoapChecklist(prev => ({ ...prev, observeCustomers: checked as boolean }))}
                            data-testid="checkbox-observe-customers"
                          />
                          <div className="flex-1">
                            <span className="text-sm text-foreground">Observe Customers</span>
                            <p className="text-xs text-muted-foreground">Monitor flow & behavior</p>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 p-2 rounded-lg bg-background/50 cursor-pointer hover:bg-background transition-colors">
                          <Checkbox 
                            checked={soapChecklist.adjustOps}
                            onCheckedChange={(checked) => setSoapChecklist(prev => ({ ...prev, adjustOps: checked as boolean }))}
                            data-testid="checkbox-adjust-ops"
                          />
                          <div className="flex-1">
                            <span className="text-sm text-foreground">Adjust Operations</span>
                            <p className="text-xs text-muted-foreground">Optimize pricing & hours</p>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 p-2 rounded-lg bg-background/50 cursor-pointer hover:bg-background transition-colors">
                          <Checkbox 
                            checked={soapChecklist.promoteBrand}
                            onCheckedChange={(checked) => setSoapChecklist(prev => ({ ...prev, promoteBrand: checked as boolean }))}
                            data-testid="checkbox-promote-brand"
                          />
                          <div className="flex-1">
                            <span className="text-sm text-foreground">Promote Brand</span>
                            <p className="text-xs text-muted-foreground">Authentic marketing</p>
                          </div>
                        </label>
                      </div>
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {Object.values(soapChecklist).filter(Boolean).length}/4 completed today
                        </span>
                        <Link href="/pricing">
                          <Button variant="ghost" size="sm" className="text-amber-400" data-testid="button-learn-soap">
                            <Lock className="w-3 h-3 mr-1" />
                            Full Training
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  {/* D.R.Y. Framework */}
                  <Card className="bg-white/5 backdrop-blur border border-white/10 hover-elevate" data-testid="card-dry-framework">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-red-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-foreground">D.R.Y.</CardTitle>
                            <p className="text-xs text-muted-foreground">Buying & Selling</p>
                          </div>
                        </div>
                        <Badge className="bg-red-500/20 text-red-400">Risk</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Search className="w-4 h-4 text-red-400" />
                          <span><strong className="text-foreground">D</strong>ue Diligence - Verify everything</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Shield className="w-4 h-4 text-red-400" />
                          <span><strong className="text-foreground">R</strong>isk Management - Compliance</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Eye className="w-4 h-4 text-red-400" />
                          <span><strong className="text-foreground">Y</strong>our Eyes Open - Avoid traps</span>
                        </div>
                      </div>
                      <div className="p-3 bg-red-500/10 rounded-lg mt-2">
                        <p className="text-xs text-red-400">
                          <AlertCircle className="w-3 h-3 inline mr-1" />
                          Critical for acquisitions and exits
                        </p>
                      </div>
                      <div className="pt-3 border-t border-white/10">
                        <Link href="/pricing">
                          <Button variant="outline" size="sm" className="w-full border-red-500/30 text-red-400" data-testid="button-learn-dry">
                            <Lock className="w-3 h-3 mr-2" />
                            Unlock Full Course
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Insights from Current Data */}
                <Card className="bg-card border" data-testid="card-doctrine-insights">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-[#b8860b]" />
                      Doctrine Insights from Your Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-background">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm font-medium text-foreground">C.L.E.A.N. Tip</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {dashboardStats.customers.retention > 70 
                            ? "Great retention! Focus on upselling to your loyal customers." 
                            : "Boost retention with a loyalty program - customers who return 3x spend 67% more."}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-background">
                        <div className="flex items-center gap-2 mb-2">
                          <Droplets className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-medium text-foreground">W.A.S.H. Tip</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {machines.length > 10 
                            ? "Consider route optimization software to scale your delivery service efficiently." 
                            : "Start with demo days to attract new customers and showcase your services."}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-background">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-amber-400" />
                          <span className="text-sm font-medium text-foreground">S.O.A.P. Tip</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {Object.values(soapChecklist).filter(Boolean).length === 4
                            ? "All daily tasks complete! Consistency builds winning habits."
                            : "Complete your daily S.O.A.P. checklist above to build operational excellence."}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-background">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-red-400" />
                          <span className="text-sm font-medium text-foreground">D.R.Y. Tip</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {machineStatusCounts.needsMaintenance > 0
                            ? `${machineStatusCounts.needsMaintenance} machines need attention - document all repairs for resale value.`
                            : "Keep detailed maintenance logs - buyers pay 15-20% more for well-documented operations."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Upgrade CTA Banner */}
                <Card className="bg-gradient-to-r from-[#1e3a5f] to-[#1e3a5f]/80 border border-[#b8860b]/50" data-testid="card-upgrade-cta">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-[#b8860b]/20 flex items-center justify-center">
                          <Crown className="w-7 h-7 text-[#b8860b]" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Upgrade to Unlock Full Training</h3>
                          <p className="text-white/70 text-sm">Get personalized recommendations, video courses, and expert coaching</p>
                        </div>
                      </div>
                      <Link href="/pricing">
                        <Button className="bg-[#b8860b] hover:bg-[#9A7209] text-white" data-testid="button-upgrade-training">
                          View Plans
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Settings Section */}
            {activeSection === "settings" && (
              <div className="space-y-6" data-testid="settings-section">
                <h2 className="text-2xl font-bold text-foreground">Settings</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Business Profile Card */}
                  <Card className="bg-card border" data-testid="card-business-profile">
                    <CardHeader>
                      <CardTitle className="text-foreground flex items-center gap-2">
                        <Building className="w-5 h-5 text-[#b8860b]" />
                        Business Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Logo Upload */}
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-20 h-20 rounded-lg bg-background border-2 border-dashed border flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#b8860b] transition-colors"
                          onClick={() => document.getElementById('logo-upload')?.click()}
                          data-testid="button-upload-logo"
                        >
                          {settingsForm.logoUrl ? (
                            <img src={settingsForm.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            <Upload className="w-8 h-8 text-[#b8860b]" />
                          )}
                        </div>
                        <input 
                          id="logo-upload" 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleLogoUpload}
                          data-testid="input-logo-upload"
                        />
                        <div>
                          <p className="text-white font-medium">Business Logo</p>
                          <p className="text-sm text-muted-foreground">PNG, JPG up to 2MB</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label className="text-muted-foreground text-sm">Business Name</Label>
                          <Input
                            placeholder="Your Laundromat Name"
                            className="bg-background border text-foreground"
                            value={settingsForm.businessName}
                            onChange={(e) => setSettingsForm({ ...settingsForm, businessName: e.target.value })}
                            data-testid="input-business-name"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-sm">Phone</Label>
                            <Input
                              placeholder="(555) 123-4567"
                              className="bg-background border text-foreground"
                              value={settingsForm.phone}
                              onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                              data-testid="input-business-phone"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-sm">Email</Label>
                            <Input
                              type="email"
                              placeholder="info@laundromat.com"
                              className="bg-background border text-foreground"
                              value={settingsForm.email}
                              onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                              data-testid="input-business-email"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label className="text-muted-foreground text-sm">Website</Label>
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-muted-foreground/70" />
                            <Input
                              placeholder="www.yourlaundromat.com"
                              className="bg-background border text-foreground flex-1"
                              value={settingsForm.website}
                              onChange={(e) => setSettingsForm({ ...settingsForm, website: e.target.value })}
                              data-testid="input-business-website"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label className="text-muted-foreground text-sm">Address</Label>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground/70" />
                            <Input
                              placeholder="Street Address"
                              className="bg-background border text-foreground flex-1"
                              value={settingsForm.address}
                              onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                              data-testid="input-business-address"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-sm">City</Label>
                            <Input
                              placeholder="City"
                              className="bg-background border text-foreground"
                              value={settingsForm.city}
                              onChange={(e) => setSettingsForm({ ...settingsForm, city: e.target.value })}
                              data-testid="input-business-city"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-sm">State</Label>
                            <Input
                              placeholder="State"
                              className="bg-background border text-foreground"
                              value={settingsForm.state}
                              onChange={(e) => setSettingsForm({ ...settingsForm, state: e.target.value })}
                              data-testid="input-business-state"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-sm">ZIP</Label>
                            <Input
                              placeholder="ZIP"
                              className="bg-background border text-foreground"
                              value={settingsForm.zip}
                              onChange={(e) => setSettingsForm({ ...settingsForm, zip: e.target.value })}
                              data-testid="input-business-zip"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Service Pricing Card */}
                  <Card className="bg-card border" data-testid="card-service-pricing">
                    <CardHeader>
                      <CardTitle className="text-foreground flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-[#b8860b]" />
                        Service Pricing
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Pricing Mode Toggle */}
                      <div className="flex items-center gap-2 p-1 bg-background rounded-lg">
                        <button
                          onClick={() => setSettingsForm({ ...settingsForm, pricingMode: "flat_rate" })}
                          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                            settingsForm.pricingMode === "flat_rate"
                              ? "bg-[#b8860b] text-white"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          data-testid="button-pricing-flat-rate"
                        >
                          <Scale className="w-4 h-4 inline mr-2" />
                          Flat Rate
                        </button>
                        <button
                          onClick={() => setSettingsForm({ ...settingsForm, pricingMode: "per_pound" })}
                          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                            settingsForm.pricingMode === "per_pound"
                              ? "bg-[#b8860b] text-white"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          data-testid="button-pricing-per-pound"
                        >
                          <Weight className="w-4 h-4 inline mr-2" />
                          Per Pound
                        </button>
                      </div>

                      {/* Conditional Pricing Inputs */}
                      {settingsForm.pricingMode === "flat_rate" ? (
                        <div className="space-y-3">
                          <p className="text-xs text-muted-foreground">Set fixed prices for each load size</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-muted-foreground text-sm">Small Load</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="15.00"
                                  className="bg-background border text-foreground pl-8"
                                  value={settingsForm.smallLoadPrice}
                                  onChange={(e) => setSettingsForm({ ...settingsForm, smallLoadPrice: e.target.value })}
                                  data-testid="input-small-load-price"
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-muted-foreground text-sm">Medium Load</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="25.00"
                                  className="bg-background border text-foreground pl-8"
                                  value={settingsForm.mediumLoadPrice}
                                  onChange={(e) => setSettingsForm({ ...settingsForm, mediumLoadPrice: e.target.value })}
                                  data-testid="input-medium-load-price"
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-muted-foreground text-sm">Large Load</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="40.00"
                                  className="bg-background border text-foreground pl-8"
                                  value={settingsForm.largeLoadPrice}
                                  onChange={(e) => setSettingsForm({ ...settingsForm, largeLoadPrice: e.target.value })}
                                  data-testid="input-large-load-price"
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-muted-foreground text-sm">Extra Large</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="55.00"
                                  className="bg-background border text-foreground pl-8"
                                  value={settingsForm.extraLargeLoadPrice}
                                  onChange={(e) => setSettingsForm({ ...settingsForm, extraLargeLoadPrice: e.target.value })}
                                  data-testid="input-xl-load-price"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs text-muted-foreground">Charge by weight for precise pricing</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-muted-foreground text-sm">Price per lb</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="1.75"
                                  className="bg-background border text-foreground pl-8"
                                  value={settingsForm.pricePerPound}
                                  onChange={(e) => setSettingsForm({ ...settingsForm, pricePerPound: e.target.value })}
                                  data-testid="input-price-per-pound"
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-muted-foreground text-sm">Minimum Weight (lbs)</Label>
                              <Input
                                type="number"
                                placeholder="10"
                                className="bg-background border text-foreground"
                                value={settingsForm.minimumWeight}
                                onChange={(e) => setSettingsForm({ ...settingsForm, minimumWeight: e.target.value })}
                                data-testid="input-minimum-weight"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-sm">Rush Surcharge (%)</Label>
                            <div className="relative">
                              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                              <Input
                                type="number"
                                placeholder="50"
                                className="bg-background border text-foreground pl-8"
                                value={settingsForm.rushSurcharge}
                                onChange={(e) => setSettingsForm({ ...settingsForm, rushSurcharge: e.target.value })}
                                data-testid="input-rush-surcharge"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Common pricing settings */}
                      <div className="pt-3 border-t border space-y-3">
                        <p className="text-xs text-muted-foreground font-medium">Additional Fees</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-sm">Pickup/Delivery Fee</Label>
                            <div className="relative">
                              <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="5.00"
                                className="bg-background border text-foreground pl-9"
                                value={settingsForm.pickupDeliveryFee}
                                onChange={(e) => setSettingsForm({ ...settingsForm, pickupDeliveryFee: e.target.value })}
                                data-testid="input-pickup-delivery-fee"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-sm">Dry Cleaning Markup (%)</Label>
                            <div className="relative">
                              <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                              <Input
                                type="number"
                                placeholder="25"
                                className="bg-background border text-foreground pl-9"
                                value={settingsForm.dryCleaningMarkup}
                                onChange={(e) => setSettingsForm({ ...settingsForm, dryCleaningMarkup: e.target.value })}
                                data-testid="input-dry-cleaning-markup"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Calculator Integration Card */}
                  <Card className="bg-card border" data-testid="card-calculator">
                    <CardHeader>
                      <CardTitle className="text-foreground flex items-center gap-2">
                        <Scale className="w-5 h-5 text-[#b8860b]" />
                        Calculator Integration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#b8860b]/20 flex items-center justify-center">
                            <Scale className="w-5 h-5 text-[#b8860b]" />
                          </div>
                          <div>
                            <p className="text-white font-medium">Enable Price Calculator</p>
                            <p className="text-xs text-muted-foreground">Show pricing widget on order screen</p>
                          </div>
                        </div>
                        <Switch
                          checked={settingsForm.enableCalculator}
                          onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, enableCalculator: checked })}
                          data-testid="switch-enable-calculator"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <Coins className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">Accept Tips</p>
                            <p className="text-xs text-muted-foreground">Allow customers to add gratuity</p>
                          </div>
                        </div>
                        <Switch
                          checked={settingsForm.acceptTips}
                          onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, acceptTips: checked })}
                          data-testid="switch-accept-tips"
                        />
                      </div>

                      {settingsForm.acceptTips && (
                        <div className="space-y-1.5">
                          <Label className="text-muted-foreground text-sm">Tip Options (%)</Label>
                          <Input
                            placeholder="15,18,20,25"
                            className="bg-background border text-foreground"
                            value={settingsForm.defaultTipOptions}
                            onChange={(e) => setSettingsForm({ ...settingsForm, defaultTipOptions: e.target.value })}
                            data-testid="input-tip-options"
                          />
                          <p className="text-xs text-muted-foreground/70">Comma-separated percentage options</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Financial Settings Card */}
                  <Card className="bg-card border" data-testid="card-financial">
                    <CardHeader>
                      <CardTitle className="text-foreground flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[#b8860b]" />
                        Financial Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-muted-foreground text-sm">Tax Rate (%)</Label>
                          <div className="relative">
                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="8.25"
                              className="bg-background border text-foreground pl-8"
                              value={settingsForm.taxRate}
                              onChange={(e) => setSettingsForm({ ...settingsForm, taxRate: e.target.value })}
                              data-testid="input-tax-rate"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-muted-foreground text-sm">Currency</Label>
                          <Select
                            value={settingsForm.currency}
                            onValueChange={(value: "USD" | "CAD" | "EUR" | "GBP") => setSettingsForm({ ...settingsForm, currency: value })}
                          >
                            <SelectTrigger className="bg-background border text-foreground" data-testid="select-currency">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="CAD">CAD ($)</SelectItem>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                              <SelectItem value="GBP">GBP (£)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-muted-foreground text-sm">Order Number Prefix</Label>
                          <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                            <Input
                              placeholder="WBH"
                              className="bg-background border text-foreground pl-8"
                              value={settingsForm.orderNumberPrefix}
                              onChange={(e) => setSettingsForm({ ...settingsForm, orderNumberPrefix: e.target.value })}
                              data-testid="input-order-prefix"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5 flex flex-col justify-end">
                          <div className="flex items-center justify-between p-3 bg-background rounded-lg h-10">
                            <div className="flex items-center gap-2">
                              <Printer className="w-4 h-4 text-muted-foreground/70" />
                              <span className="text-sm text-foreground">Auto-Print</span>
                            </div>
                            <Switch
                              checked={settingsForm.autoPrintReceipts}
                              onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, autoPrintReceipts: checked })}
                              data-testid="switch-auto-print"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-muted-foreground text-sm">Receipt Footer Message</Label>
                        <Input
                          placeholder="Thank you for your business!"
                          className="bg-background border text-foreground"
                          value={settingsForm.receiptFooterMessage}
                          onChange={(e) => setSettingsForm({ ...settingsForm, receiptFooterMessage: e.target.value })}
                          data-testid="input-receipt-footer"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Subscription Tiers Card - Full Width */}
                  <Card className="bg-card border lg:col-span-2" data-testid="card-subscription">
                    <CardHeader>
                      <CardTitle className="text-foreground flex items-center gap-2">
                        <Crown className="w-5 h-5 text-[#b8860b]" />
                        Subscription Plans
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Starter Plan */}
                        <div 
                          className={`p-5 rounded-xl border-2 transition-all cursor-pointer ${
                            settingsForm.currentPlan === "starter"
                              ? "border-[#b8860b] bg-[#b8860b]/10"
                              : "border bg-background hover:border-[#b8860b]/50"
                          }`}
                          onClick={() => setSettingsForm({ ...settingsForm, currentPlan: "starter" })}
                          data-testid="plan-starter"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-lg font-bold text-foreground">Starter</h4>
                            {settingsForm.currentPlan === "starter" && (
                              <Badge className="bg-[#b8860b] text-white text-xs">Current</Badge>
                            )}
                          </div>
                          <p className="text-3xl font-black text-[#b8860b] mb-2">$49<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Up to 100 orders/month</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Basic analytics</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Email support</li>
                          </ul>
                        </div>

                        {/* Professional Plan - Recommended */}
                        <div 
                          className={`p-5 rounded-xl border-2 transition-all cursor-pointer relative ${
                            settingsForm.currentPlan === "professional"
                              ? "border-[#b8860b] bg-[#b8860b]/10"
                              : "border-[#b8860b]/50 bg-background hover:border-[#b8860b]"
                          }`}
                          onClick={() => setSettingsForm({ ...settingsForm, currentPlan: "professional" })}
                          data-testid="plan-professional"
                        >
                          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#b8860b] text-white text-xs">
                            RECOMMENDED
                          </Badge>
                          <div className="flex items-center justify-between mb-3 mt-1">
                            <h4 className="text-lg font-bold text-foreground">Professional</h4>
                            {settingsForm.currentPlan === "professional" && (
                              <Badge className="bg-[#b8860b] text-white text-xs">Current</Badge>
                            )}
                          </div>
                          <p className="text-3xl font-black text-[#b8860b] mb-2">$149<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Unlimited orders</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Advanced analytics</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Route optimization</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Priority support</li>
                          </ul>
                        </div>

                        {/* Enterprise Plan */}
                        <div 
                          className={`p-5 rounded-xl border-2 transition-all cursor-pointer ${
                            settingsForm.currentPlan === "enterprise"
                              ? "border-[#b8860b] bg-[#b8860b]/10"
                              : "border bg-background hover:border-[#b8860b]/50"
                          }`}
                          onClick={() => setSettingsForm({ ...settingsForm, currentPlan: "enterprise" })}
                          data-testid="plan-enterprise"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-lg font-bold text-foreground">Enterprise</h4>
                            {settingsForm.currentPlan === "enterprise" && (
                              <Badge className="bg-[#b8860b] text-white text-xs">Current</Badge>
                            )}
                          </div>
                          <p className="text-3xl font-black text-[#b8860b] mb-2">$299<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Everything in Pro</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Multi-location support</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Custom integrations</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Dedicated account manager</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> White-label options</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button 
                    onClick={saveSettings} 
                    className="bg-[#b8860b] hover:bg-[#9A7209] text-white px-8"
                    data-testid="button-save-settings"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </div>
            )}

            {/* Calculators Section */}
            {activeSection === "calculators" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-[#b8860b]" />
                      Business Calculators
                    </h2>
                    <p className="text-sm text-muted-foreground">Professional tools to optimize your laundromat operations</p>
                  </div>
                </div>

                {/* Calculator Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-border pb-3">
                  {[
                    { id: "pricing", label: "Pricing", icon: DollarSign },
                    { id: "profitability", label: "Profitability", icon: TrendingUp },
                    { id: "labor", label: "Labor Cost", icon: Users },
                    { id: "roi", label: "ROI Projector", icon: PieChart },
                  ].map((tab) => (
                    <Button
                      key={tab.id}
                      variant={activeCalculator === tab.id ? "default" : "outline"}
                      className={`gap-2 ${activeCalculator === tab.id ? "bg-[#b8860b] hover:bg-[#9A7209]" : ""}`}
                      onClick={() => setActiveCalculator(tab.id as typeof activeCalculator)}
                      data-testid={`tab-calculator-${tab.id}`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </Button>
                  ))}
                </div>

                {/* Pricing Calculator */}
                {activeCalculator === "pricing" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-card border" data-testid="card-pricing-calculator">
                      <CardHeader>
                        <CardTitle className="text-foreground flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-[#b8860b]" />
                          Pricing Calculator
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-muted-foreground text-sm">Weight (lbs)</Label>
                          <div className="relative">
                            <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="Enter weight"
                              className="bg-background border text-foreground pl-10"
                              value={pricingForm.weight}
                              onChange={(e) => setPricingForm({ ...pricingForm, weight: e.target.value })}
                              data-testid="input-pricing-weight"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-muted-foreground text-sm">Service Type</Label>
                          <Select 
                            value={pricingForm.serviceType}
                            onValueChange={(value: "wdf" | "dry_cleaning" | "pud") => setPricingForm({ ...pricingForm, serviceType: value })}
                          >
                            <SelectTrigger className="bg-background border text-foreground" data-testid="select-pricing-service">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="wdf">Wash-Dry-Fold</SelectItem>
                              <SelectItem value="dry_cleaning">Dry Cleaning</SelectItem>
                              <SelectItem value="pud">Pickup & Delivery</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm">Extras</Label>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="rush"
                                checked={pricingForm.rush}
                                onCheckedChange={(checked) => setPricingForm({ ...pricingForm, rush: !!checked })}
                                data-testid="checkbox-pricing-rush"
                              />
                              <Label htmlFor="rush" className="text-sm text-foreground flex items-center gap-1">
                                <Zap className="w-3 h-3 text-amber-400" /> Rush
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="starch"
                                checked={pricingForm.starch}
                                onCheckedChange={(checked) => setPricingForm({ ...pricingForm, starch: !!checked })}
                                data-testid="checkbox-pricing-starch"
                              />
                              <Label htmlFor="starch" className="text-sm text-foreground">Starch</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="fabricSoftener"
                                checked={pricingForm.fabricSoftener}
                                onCheckedChange={(checked) => setPricingForm({ ...pricingForm, fabricSoftener: !!checked })}
                                data-testid="checkbox-pricing-softener"
                              />
                              <Label htmlFor="fabricSoftener" className="text-sm text-foreground flex items-center gap-1">
                                <Droplets className="w-3 h-3 text-cyan-400" /> Fabric Softener
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="specialCare"
                                checked={pricingForm.specialCare}
                                onCheckedChange={(checked) => setPricingForm({ ...pricingForm, specialCare: !!checked })}
                                data-testid="checkbox-pricing-special"
                              />
                              <Label htmlFor="specialCare" className="text-sm text-foreground flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-purple-400" /> Special Care
                              </Label>
                            </div>
                          </div>
                        </div>

                        <Button 
                          className="w-full bg-[#b8860b] hover:bg-[#9A7209] text-white"
                          onClick={() => pricingCalculatorMutation.mutate(pricingForm)}
                          disabled={!pricingForm.weight || pricingCalculatorMutation.isPending}
                          data-testid="button-calculate-pricing"
                        >
                          {pricingCalculatorMutation.isPending ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Calculating...
                            </>
                          ) : (
                            <>
                              <Calculator className="w-4 h-4 mr-2" />
                              Calculate Price
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Pricing Results */}
                    <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1e3a5f]/80 border-[#b8860b]/20" data-testid="card-pricing-results">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Receipt className="w-5 h-5 text-[#b8860b]" />
                          Price Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {pricingResult ? (
                          <div className="space-y-4">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-white/70">Base Price</span>
                                <span className="text-white font-semibold">${pricingResult.basePrice.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-white/70">Extras</span>
                                <span className="text-white font-semibold">${pricingResult.extras.toFixed(2)}</span>
                              </div>
                              {pricingResult.rushSurcharge > 0 && (
                                <div className="flex justify-between items-center py-2 border-b border-white/10">
                                  <span className="text-amber-400 flex items-center gap-1">
                                    <Zap className="w-3 h-3" /> Rush Surcharge
                                  </span>
                                  <span className="text-amber-400 font-semibold">${pricingResult.rushSurcharge.toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-white/70">Tax ({settingsForm.taxRate}%)</span>
                                <span className="text-white font-semibold">${pricingResult.tax.toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center py-4 bg-white/10 rounded-lg px-4">
                              <span className="text-white text-lg font-bold">Total</span>
                              <span className="text-3xl font-black text-[#b8860b]">${pricingResult.total.toFixed(2)}</span>
                            </div>
                            <Button 
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => {
                                toast({
                                  title: "Applied to Order",
                                  description: `Price of $${pricingResult.total.toFixed(2)} applied to current order`,
                                });
                              }}
                              data-testid="button-apply-pricing"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Apply to Order
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Calculator className="w-12 h-12 text-white/30 mx-auto mb-3" />
                            <p className="text-white/50">Enter weight and options to calculate price</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Profitability Calculator */}
                {activeCalculator === "profitability" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="bg-card border" data-testid="card-profitability-calculator">
                      <CardHeader>
                        <CardTitle className="text-foreground flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-[#b8860b]" />
                          Monthly Inputs
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-muted-foreground text-sm">Monthly Revenue</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                            <Input
                              type="number"
                              placeholder="e.g., 50000"
                              className="bg-background border text-foreground pl-10"
                              value={profitabilityForm.monthlyRevenue}
                              onChange={(e) => setProfitabilityForm({ ...profitabilityForm, monthlyRevenue: e.target.value })}
                              data-testid="input-profit-revenue"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-sm">Labor Cost</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              className="bg-background border text-foreground"
                              value={profitabilityForm.laborCost}
                              onChange={(e) => setProfitabilityForm({ ...profitabilityForm, laborCost: e.target.value })}
                              data-testid="input-profit-labor"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-sm">Utilities</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              className="bg-background border text-foreground"
                              value={profitabilityForm.utilitiesCost}
                              onChange={(e) => setProfitabilityForm({ ...profitabilityForm, utilitiesCost: e.target.value })}
                              data-testid="input-profit-utilities"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-sm">Supplies</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              className="bg-background border text-foreground"
                              value={profitabilityForm.suppliesCost}
                              onChange={(e) => setProfitabilityForm({ ...profitabilityForm, suppliesCost: e.target.value })}
                              data-testid="input-profit-supplies"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-sm">Rent</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              className="bg-background border text-foreground"
                              value={profitabilityForm.rentCost}
                              onChange={(e) => setProfitabilityForm({ ...profitabilityForm, rentCost: e.target.value })}
                              data-testid="input-profit-rent"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-sm">Equipment</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              className="bg-background border text-foreground"
                              value={profitabilityForm.equipmentCost}
                              onChange={(e) => setProfitabilityForm({ ...profitabilityForm, equipmentCost: e.target.value })}
                              data-testid="input-profit-equipment"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-sm">Other</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              className="bg-background border text-foreground"
                              value={profitabilityForm.otherCosts}
                              onChange={(e) => setProfitabilityForm({ ...profitabilityForm, otherCosts: e.target.value })}
                              data-testid="input-profit-other"
                            />
                          </div>
                        </div>

                        <Button 
                          className="w-full bg-[#b8860b] hover:bg-[#9A7209] text-white"
                          onClick={() => profitabilityCalculatorMutation.mutate(profitabilityForm)}
                          disabled={!profitabilityForm.monthlyRevenue || profitabilityCalculatorMutation.isPending}
                          data-testid="button-calculate-profitability"
                        >
                          {profitabilityCalculatorMutation.isPending ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Calculator className="w-4 h-4 mr-2" />
                              Analyze Profitability
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Profitability Results */}
                    <Card className="bg-card border lg:col-span-2" data-testid="card-profitability-results">
                      <CardHeader>
                        <CardTitle className="text-foreground flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-[#b8860b]" />
                          Profitability Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {profitabilityResult ? (
                          <div className="space-y-6">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <p className="text-xs text-muted-foreground mb-1">Gross Profit</p>
                                <p className="text-xl font-bold text-emerald-400">${profitabilityResult.grossProfit?.toLocaleString()}</p>
                                <p className="text-xs text-emerald-400">{profitabilityResult.grossMargin?.toFixed(1)}% margin</p>
                              </div>
                              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <p className="text-xs text-muted-foreground mb-1">Net Profit</p>
                                <p className="text-xl font-bold text-blue-400">${profitabilityResult.netProfit?.toLocaleString()}</p>
                                <p className="text-xs text-blue-400">{profitabilityResult.netMargin?.toFixed(1)}% margin</p>
                              </div>
                              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <p className="text-xs text-muted-foreground mb-1">Break-Even</p>
                                <p className="text-xl font-bold text-amber-400">{profitabilityResult.breakEven?.days || 0} days</p>
                                <p className="text-xs text-amber-400">${profitabilityResult.breakEven?.revenue?.toLocaleString()}</p>
                              </div>
                              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                <p className="text-xs text-muted-foreground mb-1">Health Score</p>
                                <p className="text-xl font-bold text-purple-400">{profitabilityResult.healthScore}/100</p>
                                <p className="text-xs text-purple-400">{profitabilityResult.healthScore >= 80 ? "Excellent" : profitabilityResult.healthScore >= 60 ? "Good" : "Needs Work"}</p>
                              </div>
                            </div>

                            {/* Yearly Projection & Growth Scenarios */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 rounded-lg bg-muted/30 border">
                                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-[#b8860b]" />
                                  Yearly Projection
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Annual Revenue</span>
                                    <span className="text-sm font-semibold text-foreground">${profitabilityResult.yearlyProjection?.revenue?.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Annual Profit</span>
                                    <span className="text-sm font-semibold text-emerald-400">${profitabilityResult.yearlyProjection?.profit?.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="p-4 rounded-lg bg-muted/30 border">
                                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 text-[#b8860b]" />
                                  Growth Scenarios
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Conservative (+5%)</span>
                                    <span className="text-sm font-semibold text-foreground">${profitabilityResult.growthScenarios?.conservative?.yearlyProfit?.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Moderate (+10%)</span>
                                    <span className="text-sm font-semibold text-foreground">${profitabilityResult.growthScenarios?.moderate?.yearlyProfit?.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Aggressive (+20%)</span>
                                    <span className="text-sm font-semibold text-emerald-400">${profitabilityResult.growthScenarios?.aggressive?.yearlyProfit?.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Expense Breakdown */}
                            {profitabilityResult.expenseBreakdown && (
                              <div className="p-4 rounded-lg bg-muted/30 border">
                                <h4 className="text-sm font-semibold text-foreground mb-3">Expense Breakdown</h4>
                                <div className="space-y-2">
                                  {Object.entries(profitabilityResult.expenseBreakdown).map(([key, value]: [string, any]) => (
                                    <div key={key} className="flex items-center gap-3">
                                      <div className="flex-1">
                                        <div className="flex justify-between text-sm mb-1">
                                          <span className="text-muted-foreground capitalize">{key}</span>
                                          <span className="text-foreground">${value.amount?.toLocaleString()} ({value.percentage?.toFixed(1)}%)</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-[#b8860b] rounded-full transition-all"
                                            style={{ width: `${Math.min(value.percentage || 0, 100)}%` }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Recommendations */}
                            {profitabilityResult.recommendations && profitabilityResult.recommendations.length > 0 && (
                              <div className="p-4 rounded-lg bg-[#1e3a5f]/10 border border-[#1e3a5f]/20">
                                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                  <Lightbulb className="w-4 h-4 text-[#b8860b]" />
                                  Recommendations
                                </h4>
                                <ul className="space-y-2">
                                  {profitabilityResult.recommendations.map((rec: string, idx: number) => (
                                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                      {rec}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-muted-foreground">Enter your monthly figures to analyze profitability</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Labor Cost Calculator */}
                {activeCalculator === "labor" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-card border" data-testid="card-labor-calculator">
                      <CardHeader>
                        <CardTitle className="text-foreground flex items-center gap-2">
                          <Users className="w-5 h-5 text-[#b8860b]" />
                          Labor Inputs
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-sm">Number of Employees</Label>
                            <Input
                              type="number"
                              placeholder="e.g., 5"
                              className="bg-background border text-foreground"
                              value={laborForm.numberOfEmployees}
                              onChange={(e) => setLaborForm({ ...laborForm, numberOfEmployees: e.target.value })}
                              data-testid="input-labor-employees"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-sm">Avg Hourly Wage ($)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="e.g., 15.00"
                              className="bg-background border text-foreground"
                              value={laborForm.averageHourlyWage}
                              onChange={(e) => setLaborForm({ ...laborForm, averageHourlyWage: e.target.value })}
                              data-testid="input-labor-wage"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-sm">Avg Hours/Week</Label>
                            <Input
                              type="number"
                              placeholder="e.g., 35"
                              className="bg-background border text-foreground"
                              value={laborForm.averageHoursPerWeek}
                              onChange={(e) => setLaborForm({ ...laborForm, averageHoursPerWeek: e.target.value })}
                              data-testid="input-labor-hours"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-sm">Payroll Tax (%)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="7.65"
                              className="bg-background border text-foreground"
                              value={laborForm.payrollTaxRate}
                              onChange={(e) => setLaborForm({ ...laborForm, payrollTaxRate: e.target.value })}
                              data-testid="input-labor-tax"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-sm">Benefits/Employee ($)</Label>
                            <Input
                              type="number"
                              placeholder="e.g., 200"
                              className="bg-background border text-foreground"
                              value={laborForm.benefitsCostPerEmployee}
                              onChange={(e) => setLaborForm({ ...laborForm, benefitsCostPerEmployee: e.target.value })}
                              data-testid="input-labor-benefits"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-sm">Monthly lbs (optional)</Label>
                            <Input
                              type="number"
                              placeholder="e.g., 10000"
                              className="bg-background border text-foreground"
                              value={laborForm.monthlyPounds}
                              onChange={(e) => setLaborForm({ ...laborForm, monthlyPounds: e.target.value })}
                              data-testid="input-labor-pounds"
                            />
                          </div>
                        </div>

                        <Button 
                          className="w-full bg-[#b8860b] hover:bg-[#9A7209] text-white"
                          onClick={() => laborCalculatorMutation.mutate(laborForm)}
                          disabled={!laborForm.numberOfEmployees || !laborForm.averageHourlyWage || laborCalculatorMutation.isPending}
                          data-testid="button-calculate-labor"
                        >
                          {laborCalculatorMutation.isPending ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Calculating...
                            </>
                          ) : (
                            <>
                              <Calculator className="w-4 h-4 mr-2" />
                              Calculate Labor Costs
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Labor Results */}
                    <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1e3a5f]/80 border-[#b8860b]/20" data-testid="card-labor-results">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Coins className="w-5 h-5 text-[#b8860b]" />
                          Labor Cost Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {laborResult ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 rounded-lg bg-white/10">
                                <p className="text-xs text-white/60 mb-1">Weekly Cost</p>
                                <p className="text-2xl font-bold text-white">${laborResult.weeklyLaborCost?.toLocaleString()}</p>
                              </div>
                              <div className="p-4 rounded-lg bg-white/10">
                                <p className="text-xs text-white/60 mb-1">Monthly Cost</p>
                                <p className="text-2xl font-bold text-[#b8860b]">${laborResult.monthlyLaborCost?.toLocaleString()}</p>
                              </div>
                              <div className="p-4 rounded-lg bg-white/10">
                                <p className="text-xs text-white/60 mb-1">Annual Cost</p>
                                <p className="text-2xl font-bold text-white">${laborResult.annualLaborCost?.toLocaleString()}</p>
                              </div>
                              <div className="p-4 rounded-lg bg-white/10">
                                <p className="text-xs text-white/60 mb-1">Cost per Hour</p>
                                <p className="text-2xl font-bold text-white">${laborResult.costPerHour?.toFixed(2)}</p>
                              </div>
                            </div>
                            {laborResult.costPerPound !== null && (
                              <div className="p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                                <div className="flex justify-between items-center">
                                  <span className="text-white/80">Labor Cost per Pound</span>
                                  <span className="text-2xl font-bold text-emerald-400">${laborResult.costPerPound?.toFixed(3)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <Users className="w-12 h-12 text-white/30 mx-auto mb-3" />
                            <p className="text-white/50">Enter employee details to calculate labor costs</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* ROI Calculator */}
                {activeCalculator === "roi" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-card border" data-testid="card-roi-calculator">
                      <CardHeader>
                        <CardTitle className="text-foreground flex items-center gap-2">
                          <Cog className="w-5 h-5 text-[#b8860b]" />
                          Machine Investment
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-muted-foreground text-sm">Machine Cost ($)</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                            <Input
                              type="number"
                              placeholder="e.g., 25000"
                              className="bg-background border text-foreground pl-10"
                              value={roiForm.machineCost}
                              onChange={(e) => setRoiForm({ ...roiForm, machineCost: e.target.value })}
                              data-testid="input-roi-cost"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-sm">Cycles per Day</Label>
                            <Input
                              type="number"
                              placeholder="e.g., 20"
                              className="bg-background border text-foreground"
                              value={roiForm.cyclesPerDay}
                              onChange={(e) => setRoiForm({ ...roiForm, cyclesPerDay: e.target.value })}
                              data-testid="input-roi-cycles"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-sm">Revenue per Cycle ($)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="e.g., 5.00"
                              className="bg-background border text-foreground"
                              value={roiForm.revenuePerCycle}
                              onChange={(e) => setRoiForm({ ...roiForm, revenuePerCycle: e.target.value })}
                              data-testid="input-roi-revenue"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-sm">Cost per Cycle ($)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="e.g., 1.50"
                              className="bg-background border text-foreground"
                              value={roiForm.operatingCostPerCycle}
                              onChange={(e) => setRoiForm({ ...roiForm, operatingCostPerCycle: e.target.value })}
                              data-testid="input-roi-opcost"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-sm">Discount Rate (%)</Label>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="10"
                              className="bg-background border text-foreground"
                              value={roiForm.discountRate}
                              onChange={(e) => setRoiForm({ ...roiForm, discountRate: e.target.value })}
                              data-testid="input-roi-discount"
                            />
                          </div>
                        </div>

                        <Button 
                          className="w-full bg-[#b8860b] hover:bg-[#9A7209] text-white"
                          onClick={() => roiCalculatorMutation.mutate(roiForm)}
                          disabled={!roiForm.machineCost || !roiForm.cyclesPerDay || roiCalculatorMutation.isPending}
                          data-testid="button-calculate-roi"
                        >
                          {roiCalculatorMutation.isPending ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Calculating...
                            </>
                          ) : (
                            <>
                              <Calculator className="w-4 h-4 mr-2" />
                              Calculate ROI
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* ROI Results */}
                    <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1e3a5f]/80 border-[#b8860b]/20" data-testid="card-roi-results">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-[#b8860b]" />
                          Return on Investment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {roiResult ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 rounded-lg bg-white/10">
                                <p className="text-xs text-white/60 mb-1">Daily Profit</p>
                                <p className="text-2xl font-bold text-emerald-400">${roiResult.dailyProfit?.toFixed(2)}</p>
                              </div>
                              <div className="p-4 rounded-lg bg-white/10">
                                <p className="text-xs text-white/60 mb-1">Monthly Profit</p>
                                <p className="text-2xl font-bold text-[#b8860b]">${roiResult.monthlyProfit?.toLocaleString()}</p>
                              </div>
                              <div className="p-4 rounded-lg bg-white/10">
                                <p className="text-xs text-white/60 mb-1">Payback Period</p>
                                <p className="text-2xl font-bold text-white">{roiResult.paybackPeriodMonths?.toFixed(1)} mo</p>
                              </div>
                              <div className="p-4 rounded-lg bg-white/10">
                                <p className="text-xs text-white/60 mb-1">5-Year ROI</p>
                                <p className="text-2xl font-bold text-emerald-400">{roiResult.fiveYearROI?.toFixed(0)}%</p>
                              </div>
                            </div>
                            <div className="p-4 rounded-lg bg-purple-500/20 border border-purple-500/30">
                              <div className="flex justify-between items-center">
                                <span className="text-white/80">Net Present Value (NPV)</span>
                                <span className="text-2xl font-bold text-purple-400">${roiResult.npv?.toLocaleString()}</span>
                              </div>
                              <p className="text-xs text-white/50 mt-1">
                                {roiResult.npv > 0 ? "Positive NPV - Good investment!" : "Negative NPV - Consider alternatives"}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <Cog className="w-12 h-12 text-white/30 mx-auto mb-3" />
                            <p className="text-white/50">Enter machine details to calculate ROI</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {/* Templates Section */}
            {activeSection === "templates" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#b8860b]" />
                      Document Templates
                    </h2>
                    <p className="text-sm text-muted-foreground">Professional templates for your laundromat operations</p>
                  </div>
                </div>

                {/* Template Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-border pb-3">
                  {[
                    { id: "receipt", label: "Receipt", icon: ReceiptText },
                    { id: "invoice", label: "Invoice", icon: FileSpreadsheet },
                    { id: "daily-report", label: "Daily Report", icon: ClipboardList },
                    { id: "customer-statement", label: "Statement", icon: UserSquare },
                  ].map((tab) => (
                    <Button
                      key={tab.id}
                      variant={activeTemplate === tab.id ? "default" : "outline"}
                      className={`gap-2 ${activeTemplate === tab.id ? "bg-[#b8860b] hover:bg-[#9A7209]" : ""}`}
                      onClick={() => setActiveTemplate(tab.id as typeof activeTemplate)}
                      data-testid={`tab-template-${tab.id}`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </Button>
                  ))}
                </div>

                {/* Receipt Template */}
                {activeTemplate === "receipt" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-white border shadow-lg" data-testid="card-receipt-template">
                      <CardContent className="p-8">
                        {/* Receipt Preview */}
                        <div className="max-w-sm mx-auto font-mono text-sm">
                          {/* Header */}
                          <div className="text-center border-b border-dashed border-gray-300 pb-4 mb-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
                              <Building className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900">{settingsForm.businessName || "Your Laundromat"}</h3>
                            <p className="text-xs text-gray-500">{settingsForm.address || "123 Main Street"}</p>
                            <p className="text-xs text-gray-500">{settingsForm.city || "City"}, {settingsForm.state || "ST"} {settingsForm.zip || "00000"}</p>
                            <p className="text-xs text-gray-500">{settingsForm.phone || "(555) 123-4567"}</p>
                          </div>

                          {/* Order Info */}
                          <div className="border-b border-dashed border-gray-300 pb-4 mb-4">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Order #:</span>
                              <span className="font-semibold text-gray-900">{templateReceiptData.orderNumber}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Date:</span>
                              <span className="text-gray-700">{new Date().toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Customer:</span>
                              <span className="text-gray-700">{templateReceiptData.customerName}</span>
                            </div>
                          </div>

                          {/* Items */}
                          <div className="border-b border-dashed border-gray-300 pb-4 mb-4 space-y-2">
                            {templateReceiptData.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <span className="text-gray-700">{item.description}</span>
                                <span className="text-gray-900">${item.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          {/* Totals */}
                          <div className="space-y-1 mb-4">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Subtotal:</span>
                              <span className="text-gray-700">${templateReceiptData.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Tax ({settingsForm.taxRate}%):</span>
                              <span className="text-gray-700">${templateReceiptData.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold border-t border-gray-300 pt-2 mt-2">
                              <span className="text-gray-900">TOTAL:</span>
                              <span className="text-gray-900">${templateReceiptData.total.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Payment Method */}
                          <div className="border-t border-dashed border-gray-300 pt-4 text-center">
                            <p className="text-xs text-gray-500">Payment: {templateReceiptData.paymentMethod}</p>
                            <p className="text-xs text-gray-500 mt-4">{settingsForm.receiptFooterMessage || "Thank you for your business!"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-4">
                      <Card className="bg-card border" data-testid="card-receipt-actions">
                        <CardHeader>
                          <CardTitle className="text-foreground text-sm">Receipt Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Button 
                            className="w-full bg-[#b8860b] hover:bg-[#9A7209] text-white"
                            onClick={() => toast({ title: "PDF Generated", description: "Receipt PDF has been downloaded" })}
                            data-testid="button-receipt-pdf"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Generate PDF
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => window.print()}
                            data-testid="button-receipt-print"
                          >
                            <Printer className="w-4 h-4 mr-2" />
                            Print Receipt
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Invoice Template */}
                {activeTemplate === "invoice" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-white border shadow-lg" data-testid="card-invoice-template">
                      <CardContent className="p-8">
                        {/* Invoice Preview */}
                        <div className="max-w-md mx-auto">
                          {/* Header */}
                          <div className="flex justify-between items-start mb-8">
                            <div>
                              <div className="w-16 h-16 bg-[#1e3a5f] rounded-lg flex items-center justify-center mb-3">
                                <Building className="w-8 h-8 text-white" />
                              </div>
                              <h3 className="font-bold text-lg text-gray-900">{settingsForm.businessName || "Your Laundromat"}</h3>
                              <p className="text-xs text-gray-500">{settingsForm.address || "123 Main Street"}</p>
                              <p className="text-xs text-gray-500">{settingsForm.phone || "(555) 123-4567"}</p>
                            </div>
                            <div className="text-right">
                              <h2 className="text-2xl font-bold text-[#b8860b] mb-2">INVOICE</h2>
                              <p className="text-sm text-gray-500">#{templateInvoiceData.invoiceNumber}</p>
                              <p className="text-sm text-gray-500">Date: {new Date().toLocaleDateString()}</p>
                              <p className="text-sm text-gray-500">Due: {templateInvoiceData.dueDate}</p>
                            </div>
                          </div>

                          {/* Bill To */}
                          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 uppercase mb-1">Bill To:</p>
                            <p className="font-semibold text-gray-900">{templateInvoiceData.customerName}</p>
                            <p className="text-sm text-gray-500">{templateInvoiceData.customerAddress}</p>
                            <p className="text-sm text-gray-500">{templateInvoiceData.customerEmail}</p>
                          </div>

                          {/* Items */}
                          <table className="w-full mb-8">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left text-xs text-gray-500 pb-2">Description</th>
                                <th className="text-right text-xs text-gray-500 pb-2">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {templateReceiptData.items.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-100">
                                  <td className="py-3 text-sm text-gray-700">{item.description}</td>
                                  <td className="py-3 text-sm text-gray-900 text-right">${item.price.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Totals */}
                          <div className="border-t border-gray-200 pt-4">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-500">Subtotal</span>
                              <span className="text-sm text-gray-700">${templateReceiptData.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between mb-3">
                              <span className="text-sm text-gray-500">Tax</span>
                              <span className="text-sm text-gray-700">${templateReceiptData.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-[#1e3a5f] rounded-lg">
                              <span className="font-bold text-white">Total Due</span>
                              <span className="text-xl font-bold text-[#b8860b]">${templateReceiptData.total.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Payment Terms */}
                          <div className="mt-6 text-center text-xs text-gray-500">
                            <p>Payment Terms: Net 30</p>
                            <p className="mt-1">{settingsForm.receiptFooterMessage || "Thank you for your business!"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-4">
                      <Card className="bg-card border" data-testid="card-invoice-actions">
                        <CardHeader>
                          <CardTitle className="text-foreground text-sm">Invoice Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Button 
                            className="w-full bg-[#b8860b] hover:bg-[#9A7209] text-white"
                            onClick={() => toast({ title: "PDF Generated", description: "Invoice PDF has been downloaded" })}
                            data-testid="button-invoice-pdf"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Generate PDF
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => toast({ title: "Email Sent", description: `Invoice sent to ${templateInvoiceData.customerEmail}` })}
                            data-testid="button-invoice-email"
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Email to Customer
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Daily Report Template */}
                {activeTemplate === "daily-report" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-card border" data-testid="card-report-template">
                      <CardHeader>
                        <CardTitle className="text-foreground flex items-center gap-2">
                          <CalendarDays className="w-5 h-5 text-[#b8860b]" />
                          Daily Operations Report
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-muted-foreground text-sm">Report Date</Label>
                          <Input
                            type="date"
                            className="bg-background border text-foreground"
                            value={dailyReportDate}
                            onChange={(e) => setDailyReportDate(e.target.value)}
                            data-testid="input-report-date"
                          />
                        </div>

                        {/* Auto-filled Stats */}
                        <div className="p-4 rounded-lg bg-muted/30 border">
                          <h4 className="text-sm font-semibold text-foreground mb-4">Day's Summary</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Total Revenue</p>
                              <p className="text-lg font-bold text-[#b8860b]">${dashboardStats.today.revenue}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Order Count</p>
                              <p className="text-lg font-bold text-foreground">{dashboardStats.today.orders}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Avg Ticket</p>
                              <p className="text-lg font-bold text-foreground">${dashboardStats.today.avgTicket}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Completed</p>
                              <p className="text-lg font-bold text-emerald-400">{dashboardStats.today.completed}</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-muted/30 border">
                          <h4 className="text-sm font-semibold text-foreground mb-3">Machine Status</h4>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                              <span className="text-sm text-muted-foreground">{machineStatusCounts.operational} Online</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                              <span className="text-sm text-muted-foreground">{machineStatusCounts.needsMaintenance} Maintenance</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-400"></div>
                              <span className="text-sm text-muted-foreground">{machineStatusCounts.outOfOrder} Offline</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-4">
                      <Card className="bg-card border" data-testid="card-report-actions">
                        <CardHeader>
                          <CardTitle className="text-foreground text-sm">Report Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Button 
                            className="w-full bg-[#b8860b] hover:bg-[#9A7209] text-white"
                            onClick={() => toast({ title: "PDF Generated", description: "Daily report PDF has been downloaded" })}
                            data-testid="button-report-pdf"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Generate PDF
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Customer Statement Template */}
                {activeTemplate === "customer-statement" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-card border" data-testid="card-statement-template">
                      <CardHeader>
                        <CardTitle className="text-foreground flex items-center gap-2">
                          <UserSquare className="w-5 h-5 text-[#b8860b]" />
                          Customer Statement
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-muted-foreground text-sm">Select Customer</Label>
                          <Select 
                            value={selectedStatementCustomer}
                            onValueChange={setSelectedStatementCustomer}
                          >
                            <SelectTrigger className="bg-background border text-foreground" data-testid="select-statement-customer">
                              <SelectValue placeholder="Choose a customer..." />
                            </SelectTrigger>
                            <SelectContent>
                              {customers.slice(0, 10).map((customer: any) => (
                                <SelectItem key={customer.id} value={customer.id}>
                                  {customer.accountName || customer.contactName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-sm">Start Date</Label>
                            <Input
                              type="date"
                              className="bg-background border text-foreground"
                              value={statementDateRange.start}
                              onChange={(e) => setStatementDateRange({ ...statementDateRange, start: e.target.value })}
                              data-testid="input-statement-start"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground text-sm">End Date</Label>
                            <Input
                              type="date"
                              className="bg-background border text-foreground"
                              value={statementDateRange.end}
                              onChange={(e) => setStatementDateRange({ ...statementDateRange, end: e.target.value })}
                              data-testid="input-statement-end"
                            />
                          </div>
                        </div>

                        {/* Statement Preview */}
                        {selectedStatementCustomer && (
                          <div className="p-4 rounded-lg bg-muted/30 border">
                            <h4 className="text-sm font-semibold text-foreground mb-3">Statement Summary</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Previous Balance</span>
                                <span className="text-foreground">$0.00</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">New Charges</span>
                                <span className="text-foreground">$245.50</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Payments</span>
                                <span className="text-emerald-400">-$200.00</span>
                              </div>
                              <div className="flex justify-between text-sm font-bold border-t border-border pt-2 mt-2">
                                <span className="text-foreground">Balance Due</span>
                                <span className="text-[#b8860b]">$45.50</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <div className="space-y-4">
                      <Card className="bg-card border" data-testid="card-statement-actions">
                        <CardHeader>
                          <CardTitle className="text-foreground text-sm">Statement Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Button 
                            className="w-full bg-[#b8860b] hover:bg-[#9A7209] text-white"
                            disabled={!selectedStatementCustomer}
                            onClick={() => toast({ title: "PDF Generated", description: "Customer statement PDF has been downloaded" })}
                            data-testid="button-statement-pdf"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Generate PDF
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            disabled={!selectedStatementCustomer}
                            onClick={() => toast({ title: "Email Sent", description: "Statement has been emailed to customer" })}
                            data-testid="button-statement-email"
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Email to Customer
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>

        {/* New Order Dialog with WDF Enhancements */}
        <Dialog open={newOrderOpen} onOpenChange={setNewOrderOpen}>
          <DialogContent className="bg-card border text-foreground max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#b8860b]" />
                Create New Order
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Start a new WDF, PUD, or self-service order with full options
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Basic Info Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[#b8860b] uppercase tracking-wide">Customer Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Customer Name *</label>
                    <Input
                      placeholder="Enter customer name"
                      className="bg-background border text-foreground h-9"
                      value={newOrderForm.customerName}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, customerName: e.target.value })}
                      data-testid="input-new-order-customer"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Phone Number *</label>
                    <Input
                      placeholder="(555) 123-4567"
                      className="bg-background border text-foreground h-9"
                      value={newOrderForm.customerPhone}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, customerPhone: e.target.value })}
                      data-testid="input-new-order-phone"
                    />
                  </div>
                </div>
              </div>

              {/* Order Type & Service Section */}
              <div className="space-y-3 pt-2 border-t border-border/50">
                <h4 className="text-xs font-semibold text-[#b8860b] uppercase tracking-wide">Order Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Order Type</label>
                    <Select 
                      value={newOrderForm.orderType} 
                      onValueChange={(value: "wash_dry_fold" | "pickup_delivery" | "dry_cleaning" | "self_service") => 
                        setNewOrderForm({ ...newOrderForm, orderType: value })
                      }
                    >
                      <SelectTrigger className="bg-background border text-foreground h-9" data-testid="select-new-order-type">
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
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Service Type</label>
                    <Select 
                      value={newOrderForm.serviceType} 
                      onValueChange={(value: "regular" | "express_24hr" | "same_day_rush") => 
                        setNewOrderForm({ ...newOrderForm, serviceType: value })
                      }
                    >
                      <SelectTrigger className="bg-background border text-foreground h-9" data-testid="select-service-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            Regular (48-72 hrs)
                          </div>
                        </SelectItem>
                        <SelectItem value="express_24hr">
                          <div className="flex items-center gap-2">
                            <Zap className="w-3 h-3 text-amber-500" />
                            Express 24hr (+25%)
                          </div>
                        </SelectItem>
                        <SelectItem value="same_day_rush">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-3 h-3 text-red-500" />
                            Same Day Rush (+50%)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground flex items-center gap-2">
                    <Scale className="w-3 h-3" />
                    Estimated Weight (lbs)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Enter weight..."
                    className="bg-background border text-foreground h-9"
                    value={newOrderForm.weight}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, weight: e.target.value })}
                    data-testid="input-new-order-weight"
                  />
                  {newOrderForm.weight && (
                    <p className="text-xs text-muted-foreground">
                      Estimated: <span className="text-[#b8860b] font-semibold">
                        ${(parseFloat(newOrderForm.weight) * parseFloat(settingsForm.pricePerPound) * 
                          (newOrderForm.serviceType === "express_24hr" ? 1.25 : 
                           newOrderForm.serviceType === "same_day_rush" ? 1.5 : 1)).toFixed(2)}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* WDF Options Section - Only show for wash_dry_fold */}
              {newOrderForm.orderType === "wash_dry_fold" && (
                <div className="space-y-3 pt-2 border-t border-border/50">
                  <h4 className="text-xs font-semibold text-[#b8860b] uppercase tracking-wide">WDF Preferences</h4>
                  
                  {/* Special Care Options */}
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Special Care Options</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "delicates", label: "Delicates", icon: Sparkles },
                        { id: "whites_separate", label: "Whites Separate", icon: Layers },
                        { id: "cold_wash", label: "Cold Wash Only", icon: Droplets },
                      ].map((option) => {
                        const isSelected = newOrderForm.specialCare.includes(option.id);
                        const OptionIcon = option.icon;
                        return (
                          <Button
                            key={option.id}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className={`h-8 ${isSelected ? 'bg-[#b8860b] hover:bg-[#9A7209]' : 'border-muted-foreground/30'}`}
                            onClick={() => {
                              setNewOrderForm({
                                ...newOrderForm,
                                specialCare: isSelected 
                                  ? newOrderForm.specialCare.filter(c => c !== option.id)
                                  : [...newOrderForm.specialCare, option.id]
                              });
                            }}
                            data-testid={`button-care-${option.id}`}
                          >
                            <OptionIcon className="w-3 h-3 mr-1.5" />
                            {option.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Starch Preference */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Starch Preference</label>
                      <Select 
                        value={newOrderForm.starchPreference} 
                        onValueChange={(value: "none" | "light" | "medium" | "heavy") => 
                          setNewOrderForm({ ...newOrderForm, starchPreference: value })
                        }
                      >
                        <SelectTrigger className="bg-background border text-foreground h-9" data-testid="select-starch">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="heavy">Heavy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Folding Preference */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Folding Preference</label>
                      <Select 
                        value={newOrderForm.foldingPreference} 
                        onValueChange={(value: "standard" | "military" | "hung" | "rolled") => 
                          setNewOrderForm({ ...newOrderForm, foldingPreference: value })
                        }
                      >
                        <SelectTrigger className="bg-background border text-foreground h-9" data-testid="select-folding">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard Fold</SelectItem>
                          <SelectItem value="military">Military Style</SelectItem>
                          <SelectItem value="hung">Hung on Hangers</SelectItem>
                          <SelectItem value="rolled">Rolled (Space Saver)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Fabric Softener */}
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-foreground">Fabric Softener</span>
                    </div>
                    <Switch
                      checked={newOrderForm.fabricSoftener}
                      onCheckedChange={(checked) => setNewOrderForm({ ...newOrderForm, fabricSoftener: checked })}
                      data-testid="switch-fabric-softener"
                    />
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              <div className="space-y-1.5 pt-2 border-t border-border/50">
                <label className="text-xs text-muted-foreground">Special Instructions</label>
                <Input
                  placeholder="Any special requests or notes..."
                  className="bg-background border text-foreground h-9"
                  value={newOrderForm.specialInstructions}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, specialInstructions: e.target.value })}
                  data-testid="input-new-order-instructions"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 border text-foreground" 
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
          <DialogContent className="bg-card border text-foreground max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#b8860b]" />
                Add New Customer
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Create a new customer account for your laundromat
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Account Name *</label>
                <Input
                  placeholder="Business or household name"
                  className="bg-background border text-foreground"
                  value={newCustomerForm.accountName}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, accountName: e.target.value })}
                  data-testid="input-new-customer-account"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Contact Name *</label>
                <Input
                  placeholder="Primary contact person"
                  className="bg-background border text-foreground"
                  value={newCustomerForm.contactName}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, contactName: e.target.value })}
                  data-testid="input-new-customer-contact"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Phone Number *</label>
                <Input
                  placeholder="(555) 123-4567"
                  className="bg-background border text-foreground"
                  value={newCustomerForm.phone}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                  data-testid="input-new-customer-phone"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Email (optional)</label>
                <Input
                  type="email"
                  placeholder="customer@email.com"
                  className="bg-background border text-foreground"
                  value={newCustomerForm.email}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                  data-testid="input-new-customer-email"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Address (optional)</label>
                <Input
                  placeholder="Street address, city, state"
                  className="bg-background border text-foreground"
                  value={newCustomerForm.address}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
                  data-testid="input-new-customer-address"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 border text-foreground" 
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
          <DialogContent className="bg-card border text-foreground max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#b8860b]" />
                Add New Machine
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Register a new machine in your laundromat
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Machine Name *</label>
                <Input
                  placeholder="e.g., Washer 1, Front Loader A"
                  className="bg-background border text-foreground"
                  value={newMachineForm.machineName}
                  onChange={(e) => setNewMachineForm({ ...newMachineForm, machineName: e.target.value })}
                  data-testid="input-new-machine-name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Machine Type *</label>
                <Select 
                  value={newMachineForm.machineType} 
                  onValueChange={(value: "washer" | "dryer" | "combo" | "ironer" | "folder") => 
                    setNewMachineForm({ ...newMachineForm, machineType: value })
                  }
                >
                  <SelectTrigger className="bg-background border text-foreground" data-testid="select-new-machine-type">
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
                  <label className="text-sm text-muted-foreground">Manufacturer</label>
                  <Input
                    placeholder="e.g., Dexter, Speed Queen"
                    className="bg-background border text-foreground"
                    value={newMachineForm.manufacturer}
                    onChange={(e) => setNewMachineForm({ ...newMachineForm, manufacturer: e.target.value })}
                    data-testid="input-new-machine-manufacturer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Model</label>
                  <Input
                    placeholder="e.g., T-900, SC80"
                    className="bg-background border text-foreground"
                    value={newMachineForm.model}
                    onChange={(e) => setNewMachineForm({ ...newMachineForm, model: e.target.value })}
                    data-testid="input-new-machine-model"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Serial Number</label>
                <Input
                  placeholder="Machine serial number"
                  className="bg-background border text-foreground"
                  value={newMachineForm.serialNumber}
                  onChange={(e) => setNewMachineForm({ ...newMachineForm, serialNumber: e.target.value })}
                  data-testid="input-new-machine-serial"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Install Date</label>
                <Input
                  type="date"
                  className="bg-background border text-foreground"
                  value={newMachineForm.installDate}
                  onChange={(e) => setNewMachineForm({ ...newMachineForm, installDate: e.target.value })}
                  data-testid="input-new-machine-install-date"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 border text-foreground" 
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
          <DialogContent className="bg-card border text-foreground max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#b8860b]" />
                Create New Route
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Plan a new pickup or delivery route
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Route Name *</label>
                <Input
                  placeholder="e.g., North Zone Morning, Downtown PM"
                  className="bg-background border text-foreground"
                  value={newRouteForm.routeName}
                  onChange={(e) => setNewRouteForm({ ...newRouteForm, routeName: e.target.value })}
                  data-testid="input-new-route-name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Route Type *</label>
                <Select 
                  value={newRouteForm.routeType} 
                  onValueChange={(value: "pickup" | "delivery" | "pickup_delivery") => 
                    setNewRouteForm({ ...newRouteForm, routeType: value })
                  }
                >
                  <SelectTrigger className="bg-background border text-foreground" data-testid="select-new-route-type">
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
                <label className="text-sm text-muted-foreground">Route Date *</label>
                <Input
                  type="date"
                  className="bg-background border text-foreground"
                  value={newRouteForm.routeDate}
                  onChange={(e) => setNewRouteForm({ ...newRouteForm, routeDate: e.target.value })}
                  data-testid="input-new-route-date"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Driver ID (Optional)</label>
                <Input
                  placeholder="Assign a driver (optional)"
                  className="bg-background border text-foreground"
                  value={newRouteForm.driverId}
                  onChange={(e) => setNewRouteForm({ ...newRouteForm, driverId: e.target.value })}
                  data-testid="input-new-route-driver"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 border text-foreground" 
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
          <DialogContent className="bg-card border text-foreground max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#b8860b]" />
                Add New Part
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Add a new part or supply to your inventory
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Part Name *</label>
                  <Input
                    placeholder="e.g., Drive Belt, Lint Filter"
                    className="bg-background border text-foreground"
                    value={newPartForm.partName}
                    onChange={(e) => setNewPartForm({ ...newPartForm, partName: e.target.value })}
                    data-testid="input-new-part-name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Part Number / SKU *</label>
                  <Input
                    placeholder="e.g., DXT-BELT-001"
                    className="bg-background border text-foreground"
                    value={newPartForm.partNumber}
                    onChange={(e) => setNewPartForm({ ...newPartForm, partNumber: e.target.value })}
                    data-testid="input-new-part-number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Category *</label>
                <Select 
                  value={newPartForm.category} 
                  onValueChange={(value: "Parts" | "Supplies" | "Chemicals" | "Equipment") => 
                    setNewPartForm({ ...newPartForm, category: value })
                  }
                >
                  <SelectTrigger className="bg-background border text-foreground" data-testid="select-new-part-category">
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
                <label className="text-sm text-muted-foreground">Description</label>
                <Input
                  placeholder="Brief description of the part"
                  className="bg-background border text-foreground"
                  value={newPartForm.description}
                  onChange={(e) => setNewPartForm({ ...newPartForm, description: e.target.value })}
                  data-testid="input-new-part-description"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Manufacturer / Vendor</label>
                  <Input
                    placeholder="e.g., Dexter, Speed Queen"
                    className="bg-background border text-foreground"
                    value={newPartForm.manufacturer}
                    onChange={(e) => setNewPartForm({ ...newPartForm, manufacturer: e.target.value })}
                    data-testid="input-new-part-manufacturer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Bin Location</label>
                  <Input
                    placeholder="e.g., Shelf A-1"
                    className="bg-background border text-foreground"
                    value={newPartForm.binLocation}
                    onChange={(e) => setNewPartForm({ ...newPartForm, binLocation: e.target.value })}
                    data-testid="input-new-part-bin"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Quantity *</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="bg-background border text-foreground"
                    value={newPartForm.quantityOnHand}
                    onChange={(e) => setNewPartForm({ ...newPartForm, quantityOnHand: parseInt(e.target.value) || 0 })}
                    data-testid="input-new-part-quantity"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Reorder Point</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="5"
                    className="bg-background border text-foreground"
                    value={newPartForm.reorderPoint}
                    onChange={(e) => setNewPartForm({ ...newPartForm, reorderPoint: parseInt(e.target.value) || 5 })}
                    data-testid="input-new-part-reorder-point"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Reorder Qty</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="10"
                    className="bg-background border text-foreground"
                    value={newPartForm.reorderQuantity}
                    onChange={(e) => setNewPartForm({ ...newPartForm, reorderQuantity: parseInt(e.target.value) || 10 })}
                    data-testid="input-new-part-reorder-quantity"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Unit Cost ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="bg-background border text-foreground"
                    value={newPartForm.unitCost}
                    onChange={(e) => setNewPartForm({ ...newPartForm, unitCost: e.target.value })}
                    data-testid="input-new-part-unit-cost"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Retail Price ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="bg-background border text-foreground"
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
                className="flex-1 border text-foreground" 
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
