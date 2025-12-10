import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import WdfPricingCalculator, { type CalculationResult } from "@/components/pos/WdfPricingCalculator";
import WdfSubscriptionManager from "@/components/pos/WdfSubscriptionManager";
import WdfPricingConfig from "@/components/pos/WdfPricingConfig";
import {
  ShoppingCart,
  Users,
  DollarSign,
  CreditCard,
  Banknote,
  Receipt,
  Search,
  Plus,
  Minus,
  Trash2,
  Clock,
  Scale,
  Shirt,
  Truck,
  Wind,
  Droplets,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Wallet,
  Calculator,
  History,
  Star,
  UserCheck,
  Printer,
  X,
  ChevronRight,
  Settings,
  Package,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const TAX_RATE = 0.0825;

const SERVICES = [
  { id: "wash", name: "Wash", icon: Droplets, pricePerLb: 1.75, unit: "lb" },
  { id: "dry", name: "Dry", icon: Wind, pricePerLb: 1.25, unit: "lb" },
  { id: "fold", name: "Fold", icon: Shirt, pricePerLb: 0.75, unit: "lb" },
  { id: "wash_dry_fold", name: "Wash & Fold", icon: Shirt, pricePerLb: 2.50, unit: "lb" },
  { id: "pickup", name: "Pickup", icon: Truck, price: 5.00, unit: "flat" },
  { id: "delivery", name: "Delivery", icon: Truck, price: 5.00, unit: "flat" },
  { id: "express", name: "Express (Same Day)", icon: Clock, price: 10.00, unit: "flat" },
];

const PAYMENT_METHODS = [
  { id: "cash", name: "Cash", icon: Banknote },
  { id: "card", name: "Card", icon: CreditCard },
  { id: "account", name: "Account", icon: Wallet },
];

type CartItem = {
  id: string;
  serviceId: string;
  name: string;
  quantity: number;
  weight?: number;
  unitPrice: number;
  unit: string;
  subtotal: number;
};

type Customer = {
  id: string;
  accountName: string;
  contactName: string;
  phone: string;
  email?: string;
  currentBalance: number;
  loyaltyPoints: number;
};

type Transaction = {
  id: string;
  transactionNumber: string;
  customerName: string;
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  orderType: string;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function PosSuite() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("register");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<string>("cash");
  const [weightInput, setWeightInput] = useState<Record<string, string>>({});
  const [quantityInput, setQuantityInput] = useState<Record<string, number>>({});
  
  const [shiftOpen, setShiftOpen] = useState(false);
  const [openingCash, setOpeningCash] = useState("");
  const [closingCash, setClosingCash] = useState("");
  const [showStartShiftDialog, setShowStartShiftDialog] = useState(false);
  const [showEndShiftDialog, setShowEndShiftDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  
  const [cashBreakdown, setCashBreakdown] = useState({
    hundreds: 0, fifties: 0, twenties: 0, tens: 0, fives: 0, ones: 0,
    quarters: 0, dimes: 0, nickels: 0, pennies: 0
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/pos/customers'],
  });

  const { data: todayTransactions = [] } = useQuery<Transaction[]>({
    queryKey: ['/api/pos/transactions/today'],
  });

  const { data: currentShift } = useQuery({
    queryKey: ['/api/pos/shifts/current'],
  });

  const { data: dailySummary } = useQuery({
    queryKey: ['/api/pos/summary/today'],
  });

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return [];
    const search = customerSearch.toLowerCase();
    return (customers as Customer[]).filter(c => 
      c.accountName?.toLowerCase().includes(search) ||
      c.contactName?.toLowerCase().includes(search) ||
      c.phone?.includes(search)
    ).slice(0, 5);
  }, [customers, customerSearch]);

  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [cart]);

  const addToCart = (service: typeof SERVICES[0]) => {
    const weight = parseFloat(weightInput[service.id] || "0");
    const quantity = quantityInput[service.id] || 1;
    
    if (service.unit === "lb" && weight <= 0) {
      toast({ title: "Enter weight", description: "Please enter the weight for this service", variant: "destructive" });
      return;
    }

    const unitPrice = service.unit === "lb" ? service.pricePerLb! : service.price!;
    const subtotal = service.unit === "lb" ? weight * unitPrice : quantity * unitPrice;

    const newItem: CartItem = {
      id: `${service.id}-${Date.now()}`,
      serviceId: service.id,
      name: service.name,
      quantity: service.unit === "lb" ? 1 : quantity,
      weight: service.unit === "lb" ? weight : undefined,
      unitPrice,
      unit: service.unit,
      subtotal,
    };

    setCart(prev => [...prev, newItem]);
    setWeightInput(prev => ({ ...prev, [service.id]: "" }));
    setQuantityInput(prev => ({ ...prev, [service.id]: 1 }));
    
    toast({ title: "Added to cart", description: `${service.name} added` });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setSelectedPayment("cash");
  };

  const createTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/pos/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setLastTransaction(data);
      setShowReceiptDialog(true);
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['/api/pos/transactions/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pos/summary/today'] });
      toast({ title: "Transaction Complete", description: "Payment processed successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to process transaction", variant: "destructive" });
    },
  });

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({ title: "Cart empty", description: "Add items to cart first", variant: "destructive" });
      return;
    }

    const transactionData = {
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.contactName || "Walk-in",
      items: cart.map(item => ({
        serviceId: item.serviceId,
        name: item.name,
        quantity: item.quantity,
        weight: item.weight,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
      subtotal: cartTotals.subtotal,
      tax: cartTotals.tax,
      total: cartTotals.total,
      paymentMethod: selectedPayment,
      status: "completed",
    };

    createTransactionMutation.mutate(transactionData);
  };

  const startShiftMutation = useMutation({
    mutationFn: async (data: { openingCash: number }) => {
      return apiRequest('/api/pos/shifts/start', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setShiftOpen(true);
      setShowStartShiftDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/pos/shifts/current'] });
      toast({ title: "Shift Started", description: `Opening cash: ${formatCurrency(parseFloat(openingCash))}` });
    },
  });

  const endShiftMutation = useMutation({
    mutationFn: async (data: { closingCash: number; cashBreakdown: typeof cashBreakdown }) => {
      return apiRequest('/api/pos/shifts/end', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data: any) => {
      setShiftOpen(false);
      setShowEndShiftDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/pos/shifts/current'] });
      toast({ 
        title: "Shift Ended", 
        description: `Variance: ${formatCurrency(data?.variance || 0)}` 
      });
    },
  });

  const calculateCashTotal = () => {
    return (
      cashBreakdown.hundreds * 100 +
      cashBreakdown.fifties * 50 +
      cashBreakdown.twenties * 20 +
      cashBreakdown.tens * 10 +
      cashBreakdown.fives * 5 +
      cashBreakdown.ones * 1 +
      cashBreakdown.quarters * 0.25 +
      cashBreakdown.dimes * 0.1 +
      cashBreakdown.nickels * 0.05 +
      cashBreakdown.pennies * 0.01
    );
  };

  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 12 }, (_, i) => ({
      hour: `${i + 8}:00`,
      revenue: Math.floor(Math.random() * 500 + 100),
      transactions: Math.floor(Math.random() * 15 + 3),
    }));
    return hours;
  }, []);

  const paymentBreakdown = useMemo(() => {
    return [
      { name: "Cash", value: 45, color: "#10B981" },
      { name: "Card", value: 40, color: "#3B82F6" },
      { name: "Account", value: 15, color: "#C8A661" },
    ];
  }, []);

  const serviceBreakdown = useMemo(() => {
    return [
      { name: "Wash & Fold", count: 45, revenue: 1250 },
      { name: "Dry Cleaning", count: 22, revenue: 880 },
      { name: "Pickup/Delivery", count: 18, revenue: 450 },
      { name: "Express", count: 8, revenue: 320 },
    ];
  }, []);

  return (
    <>
      <Helmet>
        <title>POS Suite - Transaction Register | WashBizHub</title>
        <meta name="description" content="Enterprise-grade Point of Sale system for laundromat operations" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-[#C8A661]" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">POS Suite</h1>
                  <p className="text-sm text-muted-foreground">Transaction Management</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Badge 
                  variant={shiftOpen ? "default" : "secondary"}
                  className={shiftOpen ? "bg-emerald-500" : ""}
                  data-testid="badge-shift-status"
                >
                  {shiftOpen ? "Shift Open" : "Shift Closed"}
                </Badge>
                
                {!shiftOpen ? (
                  <Button 
                    onClick={() => setShowStartShiftDialog(true)}
                    className="bg-[#0A1628] hover:bg-[#1a3a5c]"
                    data-testid="button-start-shift"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Start Shift
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    onClick={() => setShowEndShiftDialog(true)}
                    data-testid="button-end-shift"
                  >
                    End Shift
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-4xl grid-cols-7 mb-6">
              <TabsTrigger value="register" data-testid="tab-register">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Register
              </TabsTrigger>
              <TabsTrigger value="wdf-pricing" data-testid="tab-wdf-pricing">
                <Scale className="h-4 w-4 mr-2" />
                WDF Pricing
              </TabsTrigger>
              <TabsTrigger value="subscriptions" data-testid="tab-subscriptions">
                <Package className="h-4 w-4 mr-2" />
                Subscriptions
              </TabsTrigger>
              <TabsTrigger value="drawer" data-testid="tab-drawer">
                <Banknote className="h-4 w-4 mr-2" />
                Drawer
              </TabsTrigger>
              <TabsTrigger value="summary" data-testid="tab-summary">
                <BarChart3 className="h-4 w-4 mr-2" />
                Summary
              </TabsTrigger>
              <TabsTrigger value="customers" data-testid="tab-customers">
                <Users className="h-4 w-4 mr-2" />
                Customers
              </TabsTrigger>
              <TabsTrigger value="settings" data-testid="tab-settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="register" className="space-y-0">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shirt className="h-5 w-5" />
                        Services
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {SERVICES.map((service) => (
                          <div 
                            key={service.id}
                            className="border rounded-lg p-4 hover-elevate cursor-pointer"
                            data-testid={`service-${service.id}`}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                <service.icon className="h-5 w-5 text-foreground" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{service.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {service.unit === "lb" 
                                    ? `${formatCurrency(service.pricePerLb!)}/lb` 
                                    : formatCurrency(service.price!)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {service.unit === "lb" ? (
                                <div className="flex-1 flex items-center gap-2">
                                  <Input
                                    type="number"
                                    placeholder="Weight"
                                    className="w-20"
                                    value={weightInput[service.id] || ""}
                                    onChange={(e) => setWeightInput(prev => ({ ...prev, [service.id]: e.target.value }))}
                                    data-testid={`input-weight-${service.id}`}
                                  />
                                  <span className="text-sm text-muted-foreground">lbs</span>
                                </div>
                              ) : (
                                <div className="flex-1 flex items-center gap-2">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => setQuantityInput(prev => ({ ...prev, [service.id]: Math.max(1, (prev[service.id] || 1) - 1) }))}
                                    data-testid={`button-qty-minus-${service.id}`}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-8 text-center">{quantityInput[service.id] || 1}</span>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => setQuantityInput(prev => ({ ...prev, [service.id]: (prev[service.id] || 1) + 1 }))}
                                    data-testid={`button-qty-plus-${service.id}`}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                              <Button
                                size="sm"
                                onClick={() => addToCart(service)}
                                className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
                                data-testid={`button-add-${service.id}`}
                              >
                                Add
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Recent Transactions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {(todayTransactions as Transaction[]).slice(0, 10).map((txn) => (
                            <div 
                              key={txn.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                              data-testid={`transaction-${txn.id}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                  <Receipt className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="font-medium">{txn.customerName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {txn.transactionNumber} • {new Date(txn.createdAt).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{formatCurrency(txn.total)}</p>
                                <Badge variant="secondary" className="text-xs">
                                  {txn.paymentMethod}
                                </Badge>
                              </div>
                            </div>
                          ))}
                          {(todayTransactions as Transaction[]).length === 0 && (
                            <p className="text-center text-muted-foreground py-8">No transactions today</p>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Customer
                        </CardTitle>
                        {selectedCustomer && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedCustomer(null);
                              setCustomerSearch("");
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {selectedCustomer ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-[#0A1628] flex items-center justify-center">
                              <UserCheck className="h-6 w-6 text-[#C8A661]" />
                            </div>
                            <div>
                              <p className="font-semibold">{selectedCustomer.contactName}</p>
                              <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-muted/50 rounded-lg p-3 text-center">
                              <p className="text-lg font-bold text-[#C8A661]">{formatCurrency(selectedCustomer.currentBalance)}</p>
                              <p className="text-xs text-muted-foreground">Balance</p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3 text-center">
                              <p className="text-lg font-bold text-[#C8A661]">{selectedCustomer.loyaltyPoints || 0}</p>
                              <p className="text-xs text-muted-foreground">Points</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search customer..."
                              className="pl-10"
                              value={customerSearch}
                              onChange={(e) => setCustomerSearch(e.target.value)}
                              data-testid="input-customer-search"
                            />
                          </div>
                          {filteredCustomers.length > 0 && (
                            <div className="border rounded-lg divide-y">
                              {filteredCustomers.map((customer) => (
                                <button
                                  key={customer.id}
                                  className="w-full flex items-center gap-3 p-3 hover:bg-muted text-left"
                                  onClick={() => {
                                    setSelectedCustomer(customer);
                                    setCustomerSearch("");
                                  }}
                                  data-testid={`customer-option-${customer.id}`}
                                >
                                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                    <Users className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{customer.contactName}</p>
                                    <p className="text-xs text-muted-foreground">{customer.phone}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground text-center">
                            Or continue as walk-in customer
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5" />
                          Cart ({cart.length})
                        </CardTitle>
                        {cart.length > 0 && (
                          <Button variant="ghost" size="sm" onClick={clearCart}>
                            Clear
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {cart.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          Cart is empty
                        </p>
                      ) : (
                        <div className="space-y-4">
                          <ScrollArea className="h-48">
                            <div className="space-y-2">
                              {cart.map((item) => (
                                <div 
                                  key={item.id}
                                  className="flex items-center justify-between p-2 border rounded-lg"
                                  data-testid={`cart-item-${item.id}`}
                                >
                                  <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {item.weight 
                                        ? `${item.weight} lbs @ ${formatCurrency(item.unitPrice)}/lb`
                                        : `${item.quantity} × ${formatCurrency(item.unitPrice)}`
                                      }
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">{formatCurrency(item.subtotal)}</span>
                                    <Button 
                                      size="icon" 
                                      variant="ghost"
                                      onClick={() => removeFromCart(item.id)}
                                      data-testid={`button-remove-${item.id}`}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>

                          <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Subtotal</span>
                              <span>{formatCurrency(cartTotals.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Tax ({(TAX_RATE * 100).toFixed(2)}%)</span>
                              <span>{formatCurrency(cartTotals.tax)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg">
                              <span>Total</span>
                              <span className="text-[#C8A661]" data-testid="text-cart-total">
                                {formatCurrency(cartTotals.total)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                        {PAYMENT_METHODS.map((method) => (
                          <Button
                            key={method.id}
                            variant={selectedPayment === method.id ? "default" : "outline"}
                            className={selectedPayment === method.id ? "bg-[#0A1628]" : ""}
                            onClick={() => setSelectedPayment(method.id)}
                            data-testid={`payment-${method.id}`}
                          >
                            <method.icon className="h-4 w-4 mr-2" />
                            {method.name}
                          </Button>
                        ))}
                      </div>

                      <Button
                        className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] h-12 text-lg"
                        disabled={cart.length === 0 || createTransactionMutation.isPending}
                        onClick={handleCheckout}
                        data-testid="button-checkout"
                      >
                        {createTransactionMutation.isPending ? (
                          "Processing..."
                        ) : (
                          <>
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            Complete Sale
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="drawer" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Banknote className="h-5 w-5" />
                      Cash Drawer Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-[#C8A661]" data-testid="text-opening-cash">
                          {formatCurrency(parseFloat(openingCash) || 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">Opening Cash</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-emerald-500" data-testid="text-expected-cash">
                          {formatCurrency((parseFloat(openingCash) || 0) + (dailySummary as any)?.totalCashSales || 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">Expected Cash</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Shift Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cash Sales</span>
                          <span className="font-medium">{formatCurrency((dailySummary as any)?.totalCashSales || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Card Sales</span>
                          <span className="font-medium">{formatCurrency((dailySummary as any)?.totalCardSales || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Account Sales</span>
                          <span className="font-medium">{formatCurrency((dailySummary as any)?.totalAccountSales || 0)}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-2">
                          <span>Total Sales</span>
                          <span className="text-[#C8A661]">{formatCurrency((dailySummary as any)?.totalSales || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Cash Count
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "$100", key: "hundreds", value: 100 },
                        { label: "$50", key: "fifties", value: 50 },
                        { label: "$20", key: "twenties", value: 20 },
                        { label: "$10", key: "tens", value: 10 },
                        { label: "$5", key: "fives", value: 5 },
                        { label: "$1", key: "ones", value: 1 },
                      ].map((denom) => (
                        <div key={denom.key} className="flex items-center gap-2">
                          <Label className="w-12">{denom.label}</Label>
                          <Input
                            type="number"
                            min="0"
                            value={(cashBreakdown as any)[denom.key]}
                            onChange={(e) => setCashBreakdown(prev => ({ 
                              ...prev, 
                              [denom.key]: parseInt(e.target.value) || 0 
                            }))}
                            className="w-20"
                            data-testid={`input-cash-${denom.key}`}
                          />
                          <span className="text-sm text-muted-foreground">
                            = {formatCurrency((cashBreakdown as any)[denom.key] * denom.value)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Counted Total</span>
                        <span className="text-2xl font-bold text-[#C8A661]" data-testid="text-counted-total">
                          {formatCurrency(calculateCashTotal())}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Variance Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <p className="text-xl font-bold">
                        {formatCurrency((parseFloat(openingCash) || 0) + ((dailySummary as any)?.totalCashSales || 0))}
                      </p>
                      <p className="text-sm text-muted-foreground">Expected</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <p className="text-xl font-bold">{formatCurrency(calculateCashTotal())}</p>
                      <p className="text-sm text-muted-foreground">Counted</p>
                    </div>
                    <div className={`rounded-lg p-4 text-center ${
                      calculateCashTotal() - ((parseFloat(openingCash) || 0) + ((dailySummary as any)?.totalCashSales || 0)) >= 0
                        ? "bg-emerald-500/10"
                        : "bg-red-500/10"
                    }`}>
                      <p className={`text-xl font-bold ${
                        calculateCashTotal() - ((parseFloat(openingCash) || 0) + ((dailySummary as any)?.totalCashSales || 0)) >= 0
                          ? "text-emerald-500"
                          : "text-red-500"
                      }`} data-testid="text-variance">
                        {formatCurrency(
                          calculateCashTotal() - ((parseFloat(openingCash) || 0) + ((dailySummary as any)?.totalCashSales || 0))
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">Variance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Sales</p>
                        <p className="text-2xl font-bold text-[#C8A661]" data-testid="text-total-sales">
                          {formatCurrency((dailySummary as any)?.totalSales || 2847.50)}
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-emerald-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Transactions</p>
                        <p className="text-2xl font-bold" data-testid="text-transaction-count">
                          {(dailySummary as any)?.transactionCount || 47}
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Receipt className="h-6 w-6 text-blue-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Ticket</p>
                        <p className="text-2xl font-bold" data-testid="text-avg-ticket">
                          {formatCurrency((dailySummary as any)?.avgTicket || 60.58)}
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-purple-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Weight</p>
                        <p className="text-2xl font-bold" data-testid="text-total-weight">
                          {(dailySummary as any)?.totalWeight || 856} lbs
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-[#C8A661]/10 flex items-center justify-center">
                        <Scale className="h-6 w-6 text-[#C8A661]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Hourly Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={hourlyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <RechartsTooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px' 
                            }}
                          />
                          <Bar dataKey="revenue" fill="#C8A661" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={paymentBreakdown}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name, value }) => `${name}: ${value}%`}
                          >
                            {paymentBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Top Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {serviceBreakdown.map((service, index) => (
                      <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`service-row-${index}`}>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <span className="font-bold text-[#C8A661]">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-semibold">{service.name}</p>
                            <p className="text-sm text-muted-foreground">{service.count} orders</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#C8A661]">{formatCurrency(service.revenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customers" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Customer Lookup
                    </CardTitle>
                    <Button className="bg-[#0A1628] hover:bg-[#1a3a5c]" data-testid="button-add-customer">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Customer
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, phone, or email..."
                      className="pl-10"
                      data-testid="input-customer-lookup"
                    />
                  </div>

                  <div className="space-y-4">
                    {(customers as Customer[]).slice(0, 10).map((customer) => (
                      <div 
                        key={customer.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover-elevate cursor-pointer"
                        data-testid={`customer-row-${customer.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-[#0A1628] flex items-center justify-center">
                            <span className="text-lg font-bold text-[#C8A661]">
                              {customer.contactName?.charAt(0) || "?"}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold">{customer.contactName}</p>
                            <p className="text-sm text-muted-foreground">{customer.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="font-bold">{formatCurrency(customer.currentBalance)}</p>
                            <p className="text-xs text-muted-foreground">Balance</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold flex items-center gap-1">
                              <Star className="h-4 w-4 text-[#C8A661]" />
                              {customer.loyaltyPoints || 0}
                            </p>
                            <p className="text-xs text-muted-foreground">Points</p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {(customers as Customer[]).length === 0 && (
                      <p className="text-center text-muted-foreground py-12">
                        No customers found. Add your first customer to get started.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wdf-pricing" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <WdfPricingCalculator 
                  onAddToCart={(result: CalculationResult) => {
                    const newItem = {
                      id: `wdf-${Date.now()}`,
                      serviceId: "wash_dry_fold",
                      name: `Wash & Fold (${result.weight} lbs)`,
                      quantity: 1,
                      weight: result.weight,
                      unitPrice: result.subtotal / result.weight,
                      unit: "lb",
                      subtotal: result.total,
                    };
                    setCart(prev => [...prev, newItem]);
                    setActiveTab("register");
                    toast({ title: "Added to cart", description: `WDF order for ${result.weight} lbs added` });
                  }}
                />
                
                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-[#C8A661]" />
                      </div>
                      <div>
                        <span className="text-lg font-bold">Pricing Insights</span>
                        <p className="text-sm text-muted-foreground font-normal">Volume discount effectiveness</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-[#C8A661]" data-testid="text-avg-order-weight">18.5</p>
                        <p className="text-xs text-muted-foreground">Avg Order Weight (lbs)</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-green-600" data-testid="text-discount-orders">42%</p>
                        <p className="text-xs text-muted-foreground">Orders with Discounts</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-[#C8A661]" data-testid="text-effective-rate">$1.72</p>
                        <p className="text-xs text-muted-foreground">Effective Rate/lb</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600" data-testid="text-express-orders">15%</p>
                        <p className="text-xs text-muted-foreground">Express Service</p>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Weight Distribution</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>0-10 lbs</span>
                            <span className="font-medium">35%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-[#C8A661] rounded-full" style={{ width: '35%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>11-25 lbs</span>
                            <span className="font-medium">45%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-[#C8A661] rounded-full" style={{ width: '45%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>26+ lbs</span>
                            <span className="font-medium">20%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-[#C8A661] rounded-full" style={{ width: '20%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Popular Add-ons</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Stain Treatment</span>
                          <span className="font-medium text-green-600">+28%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Fabric Softener</span>
                          <span className="font-medium text-green-600">+62%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Premium Folding</span>
                          <span className="font-medium text-green-600">+18%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="subscriptions" className="space-y-6">
              <WdfSubscriptionManager 
                customerId={selectedCustomer?.id}
              />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <WdfPricingConfig />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={showStartShiftDialog} onOpenChange={setShowStartShiftDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Shift</DialogTitle>
            <DialogDescription>
              Enter your opening cash drawer amount to begin your shift.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Opening Cash Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  className="pl-10"
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                  data-testid="input-opening-cash"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStartShiftDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-[#0A1628] hover:bg-[#1a3a5c]"
              onClick={() => startShiftMutation.mutate({ openingCash: parseFloat(openingCash) })}
              disabled={!openingCash || startShiftMutation.isPending}
              data-testid="button-confirm-start-shift"
            >
              Start Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEndShiftDialog} onOpenChange={setShowEndShiftDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>End Shift</DialogTitle>
            <DialogDescription>
              Count your cash drawer and confirm the closing amount.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Closing Cash Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  className="pl-10"
                  value={closingCash}
                  onChange={(e) => setClosingCash(e.target.value)}
                  data-testid="input-closing-cash"
                />
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">Expected: {formatCurrency((parseFloat(openingCash) || 0) + ((dailySummary as any)?.totalCashSales || 0))}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndShiftDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-[#0A1628] hover:bg-[#1a3a5c]"
              onClick={() => endShiftMutation.mutate({ 
                closingCash: parseFloat(closingCash), 
                cashBreakdown 
              })}
              disabled={!closingCash || endShiftMutation.isPending}
              data-testid="button-confirm-end-shift"
            >
              End Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Transaction Complete
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {lastTransaction && (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="text-center border-b pb-3">
                  <p className="font-bold">WashBizHub Laundry</p>
                  <p className="text-sm text-muted-foreground">{lastTransaction.transactionNumber}</p>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(lastTransaction.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatCurrency(lastTransaction.tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total</span>
                    <span>{formatCurrency(lastTransaction.total)}</span>
                  </div>
                </div>
                <div className="text-center text-sm text-muted-foreground pt-2 border-t">
                  <p>{new Date().toLocaleString()}</p>
                  <p>Thank you for your business!</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex-col gap-2">
            <Button 
              className="w-full"
              variant="outline"
              data-testid="button-print-receipt"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
            <Button 
              className="w-full bg-[#0A1628] hover:bg-[#1a3a5c]"
              onClick={() => setShowReceiptDialog(false)}
              data-testid="button-new-transaction"
            >
              New Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}