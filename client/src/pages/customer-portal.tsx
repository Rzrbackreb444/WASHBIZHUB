import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  LogIn,
  UserPlus,
  ArrowRight,
  Crown,
  Star,
  Gift,
  CreditCard,
  Package,
  Settings,
  ChevronRight,
  ChevronDown,
  Copy,
  Share2,
  Check,
  AlertCircle,
  Clock,
  RefreshCw,
  Droplets,
  Thermometer,
  Wind,
  Shirt,
  Sparkles,
  AlertTriangle,
  PackageCheck,
  Truck,
  Receipt,
  Calendar,
  Filter,
  Eye,
  EyeOff,
  Send,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Home,
  ArrowLeft,
} from "lucide-react";
import type { CustomerPortalAccount, CustomerPreferences, LoyaltyTransaction } from "@shared/schema";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

const preferencesSchema = z.object({
  detergentType: z.string(),
  detergentBrand: z.string().optional(),
  fabricSoftener: z.boolean(),
  fabricSoftenerType: z.string().optional(),
  waterTemperature: z.string(),
  dryerHeat: z.string(),
  foldingStyle: z.string(),
  hangDelicates: z.boolean(),
  separateColors: z.boolean(),
  allergies: z.string().optional(),
  specialInstructions: z.string().optional(),
  starchShirts: z.boolean(),
  starchLevel: z.string(),
  packagingPreference: z.string(),
});

type AuthView = "login" | "register" | "forgot-password";
type DashboardSection = "dashboard" | "orders" | "preferences" | "loyalty" | "payments" | "referrals" | "profile";

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  total: string;
  items?: { name: string; quantity: number; price: string }[];
  statusHistory?: { status: string; date: string; note?: string }[];
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export default function CustomerPortal() {
  const { toast } = useToast();
  const [authView, setAuthView] = useState<AuthView>("login");
  const [activeSection, setActiveSection] = useState<DashboardSection>("dashboard");
  const [showPassword, setShowPassword] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [orderDateFilter, setOrderDateFilter] = useState<string>("");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && ["dashboard", "orders", "preferences", "loyalty", "payments", "referrals", "profile"].includes(hash)) {
      setActiveSection(hash as DashboardSection);
    }
  }, []);

  const handleSectionChange = (section: DashboardSection) => {
    setActiveSection(section);
    window.location.hash = section;
  };

  const { data: session, isLoading: sessionLoading } = useQuery<{ user: CustomerPortalAccount } | null>({
    queryKey: ["/api/customer/session"],
  });

  const { data: preferences, isLoading: preferencesLoading } = useQuery<CustomerPreferences>({
    queryKey: ["/api/customer/preferences"],
    enabled: !!session?.user,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/customer/orders"],
    enabled: !!session?.user,
  });

  const { data: loyaltyTransactions, isLoading: loyaltyLoading } = useQuery<LoyaltyTransaction[]>({
    queryKey: ["/api/customer/loyalty/transactions"],
    enabled: !!session?.user,
  });

  const { data: paymentMethods, isLoading: paymentsLoading } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/customer/payment-methods"],
    enabled: !!session?.user,
  });

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { 
      email: "", 
      password: "", 
      confirmPassword: "", 
      firstName: "", 
      lastName: "", 
      phone: "", 
      address: "",
      city: "",
      state: "",
      zip: "",
    },
  });

  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const preferencesForm = useForm<z.infer<typeof preferencesSchema>>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      detergentType: preferences?.detergentType || "standard",
      detergentBrand: preferences?.detergentBrand || "",
      fabricSoftener: preferences?.fabricSoftener ?? true,
      fabricSoftenerType: preferences?.fabricSoftenerType || "",
      waterTemperature: preferences?.waterTemperature || "warm",
      dryerHeat: preferences?.dryerHeat || "medium",
      foldingStyle: preferences?.foldingStyle || "standard",
      hangDelicates: preferences?.hangDelicates ?? true,
      separateColors: preferences?.separateColors ?? true,
      allergies: preferences?.allergies?.join(", ") || "",
      specialInstructions: preferences?.specialInstructions || "",
      starchShirts: preferences?.starchShirts ?? false,
      starchLevel: preferences?.starchLevel || "light",
      packagingPreference: preferences?.packagingPreference || "folded_in_bag",
    },
  });

  useEffect(() => {
    if (preferences) {
      preferencesForm.reset({
        detergentType: preferences.detergentType || "standard",
        detergentBrand: preferences.detergentBrand || "",
        fabricSoftener: preferences.fabricSoftener ?? true,
        fabricSoftenerType: preferences.fabricSoftenerType || "",
        waterTemperature: preferences.waterTemperature || "warm",
        dryerHeat: preferences.dryerHeat || "medium",
        foldingStyle: preferences.foldingStyle || "standard",
        hangDelicates: preferences.hangDelicates ?? true,
        separateColors: preferences.separateColors ?? true,
        allergies: preferences.allergies?.join(", ") || "",
        specialInstructions: preferences.specialInstructions || "",
        starchShirts: preferences.starchShirts ?? false,
        starchLevel: preferences.starchLevel || "light",
        packagingPreference: preferences.packagingPreference || "folded_in_bag",
      });
    }
  }, [preferences, preferencesForm]);

  const loginMutation = useMutation({
    mutationFn: (data: z.infer<typeof loginSchema>) =>
      apiRequest("/api/customer/login", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/session"] });
      toast({ title: "Welcome back!", description: "You have successfully logged in." });
    },
    onError: (error: Error) => {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: z.infer<typeof registerSchema>) =>
      apiRequest("/api/customer/register", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Registration successful!", description: "Please check your email to verify your account." });
      setAuthView("login");
    },
    onError: (error: Error) => {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (data: z.infer<typeof forgotPasswordSchema>) =>
      apiRequest("/api/customer/forgot-password", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Email sent!", description: "Please check your email for password reset instructions." });
      setAuthView("login");
    },
    onError: (error: Error) => {
      toast({ title: "Request failed", description: error.message, variant: "destructive" });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("/api/customer/logout", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/session"] });
      toast({ title: "Logged out", description: "You have been successfully logged out." });
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (data: z.infer<typeof preferencesSchema>) =>
      apiRequest("/api/customer/preferences", { 
        method: "PUT", 
        body: JSON.stringify({
          ...data,
          allergies: data.allergies ? data.allergies.split(",").map(s => s.trim()).filter(Boolean) : [],
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/preferences"] });
      toast({ title: "Preferences updated!", description: "Your laundry preferences have been saved." });
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  const deletePaymentMethodMutation = useMutation({
    mutationFn: (paymentMethodId: string) =>
      apiRequest(`/api/customer/payment-methods/${paymentMethodId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/payment-methods"] });
      toast({ title: "Payment method removed", description: "The payment method has been deleted." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to remove", description: error.message, variant: "destructive" });
    },
  });

  const setDefaultPaymentMutation = useMutation({
    mutationFn: (paymentMethodId: string) =>
      apiRequest(`/api/customer/payment-methods/${paymentMethodId}/default`, { method: "PUT" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/payment-methods"] });
      toast({ title: "Default updated", description: "Your default payment method has been changed." });
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  const copyReferralCode = () => {
    if (session?.user?.referralCode) {
      navigator.clipboard.writeText(session.user.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast({ title: "Copied!", description: "Referral code copied to clipboard." });
    }
  };

  const shareReferralEmail = () => {
    const code = session?.user?.referralCode;
    const subject = encodeURIComponent("Join me on WashBizHub!");
    const body = encodeURIComponent(
      `Hey! I've been using WashBizHub for my laundry and it's been great. Use my referral code ${code} when you sign up and we both get bonus loyalty points!\n\nSign up here: ${window.location.origin}/customer-portal`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case "platinum": return "bg-gradient-to-r from-slate-400 to-slate-600 text-white";
      case "gold": return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
      case "silver": return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800";
      default: return "bg-gradient-to-r from-amber-600 to-amber-800 text-white";
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case "platinum": return <Crown className="h-4 w-4" />;
      case "gold": return <Star className="h-4 w-4" />;
      case "silver": return <Star className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getNextTierPoints = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case "bronze": return { next: "Silver", points: 500 };
      case "silver": return { next: "Gold", points: 1500 };
      case "gold": return { next: "Platinum", points: 5000 };
      default: return { next: "Max", points: 0 };
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed": case "delivered": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "in_progress": case "processing": case "washing": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "ready": case "ready_for_pickup": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "picked_up": case "out_for_delivery": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "cancelled": case "failed": return "bg-red-500/10 text-red-600 border-red-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed": case "delivered": return <CheckCircle className="h-4 w-4" />;
      case "in_progress": case "processing": case "washing": return <RefreshCw className="h-4 w-4" />;
      case "ready": case "ready_for_pickup": return <PackageCheck className="h-4 w-4" />;
      case "picked_up": case "out_for_delivery": return <Truck className="h-4 w-4" />;
      case "cancelled": case "failed": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const filteredOrders = orders?.filter((order) => {
    if (!orderDateFilter) return true;
    const orderDate = new Date(order.createdAt);
    const filterDate = new Date(orderDateFilter);
    return orderDate >= filterDate;
  });

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sidebar via-background to-sidebar/50">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Droplets className="h-10 w-10 text-primary" />
                <span className="font-bebas text-3xl tracking-wider text-foreground">WashBizHub</span>
              </div>
              <h1 className="text-2xl font-semibold text-foreground">Customer Portal</h1>
              <p className="text-muted-foreground">
                {authView === "login" && "Welcome back! Sign in to manage your laundry."}
                {authView === "register" && "Create an account to get started."}
                {authView === "forgot-password" && "Enter your email to reset your password."}
              </p>
            </div>

            <Card className="backdrop-blur-sm bg-card/95 border-border/50">
              <CardContent className="pt-6">
                {authView === "login" && (
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="your@email.com"
                                  className="pl-10"
                                  data-testid="input-login-email"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  {...field}
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter password"
                                  className="pl-10 pr-10"
                                  data-testid="input-login-password"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                  data-testid="button-toggle-password"
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                        data-testid="button-login-submit"
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            <LogIn className="h-4 w-4 mr-2" />
                            Sign In
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                )}

                {authView === "register" && (
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="John" data-testid="input-register-firstname" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Doe" data-testid="input-register-lastname" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input {...field} type="email" placeholder="your@email.com" className="pl-10" data-testid="input-register-email" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (Optional)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input {...field} type="tel" placeholder="(555) 123-4567" className="pl-10" data-testid="input-register-phone" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address (Optional)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input {...field} placeholder="123 Main St" className="pl-10" data-testid="input-register-address" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <FormField
                          control={registerForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} placeholder="City" data-testid="input-register-city" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} placeholder="State" data-testid="input-register-state" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="zip"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} placeholder="ZIP" data-testid="input-register-zip" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input {...field} type={showPassword ? "text" : "password"} placeholder="Create password" className="pl-10" data-testid="input-register-password" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input {...field} type={showPassword ? "text" : "password"} placeholder="Confirm password" className="pl-10" data-testid="input-register-confirm-password" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={registerMutation.isPending}
                        data-testid="button-register-submit"
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Create Account
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                )}

                {authView === "forgot-password" && (
                  <Form {...forgotPasswordForm}>
                    <form onSubmit={forgotPasswordForm.handleSubmit((data) => forgotPasswordMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={forgotPasswordForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input {...field} type="email" placeholder="your@email.com" className="pl-10" data-testid="input-forgot-email" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={forgotPasswordMutation.isPending}
                        data-testid="button-forgot-submit"
                      >
                        {forgotPasswordMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Reset Link
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-4 pt-0">
                <Separator />
                {authView === "login" && (
                  <div className="flex flex-col gap-2 w-full text-center text-sm">
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => setAuthView("forgot-password")}
                      data-testid="link-forgot-password"
                    >
                      Forgot your password?
                    </button>
                    <span className="text-muted-foreground">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={() => setAuthView("register")}
                        data-testid="link-register"
                      >
                        Sign up
                      </button>
                    </span>
                  </div>
                )}
                {authView === "register" && (
                  <span className="text-sm text-muted-foreground text-center">
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => setAuthView("login")}
                      data-testid="link-login"
                    >
                      Sign in
                    </button>
                  </span>
                )}
                {authView === "forgot-password" && (
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline flex items-center gap-1 mx-auto"
                    onClick={() => setAuthView("login")}
                    data-testid="link-back-login"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to sign in
                  </button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const user = session.user;
  const tierInfo = getNextTierPoints(user.loyaltyTier || "bronze");
  const currentPoints = user.loyaltyPoints || 0;
  const progressToNext = tierInfo.points > 0 ? Math.min(100, (currentPoints / tierInfo.points) * 100) : 100;
  const activeOrders = orders?.filter((o) => !["completed", "delivered", "cancelled"].includes(o.status.toLowerCase())) || [];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-sidebar/95 backdrop-blur-md border-b border-sidebar-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Droplets className="h-8 w-8 text-primary" />
            <span className="font-bebas text-xl tracking-wider text-sidebar-foreground hidden sm:block">WashBizHub</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <Badge className={`${getTierColor(user.loyaltyTier || "bronze")} gap-1`} data-testid="badge-loyalty-tier">
                {getTierIcon(user.loyaltyTier || "bronze")}
                {user.loyaltyTier?.charAt(0).toUpperCase() + (user.loyaltyTier?.slice(1) || "ronze")}
              </Badge>
              <span className="text-sidebar-foreground text-sm" data-testid="text-loyalty-points">{currentPoints.toLocaleString()} pts</span>
            </div>
            <Separator orientation="vertical" className="h-6 hidden md:block bg-sidebar-border" />
            <span className="text-sidebar-foreground text-sm hidden sm:block" data-testid="text-welcome-name">
              {user.firstName} {user.lastName}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => logoutMutation.mutate()}
              data-testid="button-logout"
            >
              <LogIn className="h-4 w-4 rotate-180" />
              <span className="hidden sm:inline ml-2">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeSection} onValueChange={(v) => handleSectionChange(v as DashboardSection)}>
          <TabsList className="w-full flex overflow-x-auto gap-1 p-1 bg-muted/50 mb-6" data-testid="tabs-navigation">
            <TabsTrigger value="dashboard" className="flex-1 min-w-fit gap-2" data-testid="tab-dashboard">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 min-w-fit gap-2" data-testid="tab-orders">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex-1 min-w-fit gap-2" data-testid="tab-preferences">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="loyalty" className="flex-1 min-w-fit gap-2" data-testid="tab-loyalty">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Loyalty</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex-1 min-w-fit gap-2" data-testid="tab-payments">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex-1 min-w-fit gap-2" data-testid="tab-referrals">
              <Gift className="h-4 w-4" />
              <span className="hidden sm:inline">Referrals</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6" data-testid="section-dashboard">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold" data-testid="text-dashboard-title">
                Welcome back, {user.firstName}!
              </h1>
              <p className="text-muted-foreground">Here's an overview of your laundry activity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="hover-elevate" data-testid="card-stat-points">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Loyalty Points</p>
                      <p className="text-2xl font-bold text-primary">{currentPoints.toLocaleString()}</p>
                    </div>
                    <div className={`p-3 rounded-full ${getTierColor(user.loyaltyTier || "bronze")}`}>
                      <Star className="h-5 w-5" />
                    </div>
                  </div>
                  <Progress value={progressToNext} className="mt-4" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {tierInfo.points > 0 
                      ? `${(tierInfo.points - currentPoints).toLocaleString()} points to ${tierInfo.next}`
                      : "Maximum tier achieved!"
                    }
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-stat-tier">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Your Tier</p>
                      <p className="text-2xl font-bold capitalize">{user.loyaltyTier || "Bronze"}</p>
                    </div>
                    <div className={`p-3 rounded-full ${getTierColor(user.loyaltyTier || "bronze")}`}>
                      <Crown className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    Lifetime spend: <span className="font-medium text-foreground">${parseFloat(user.lifetimeSpend || "0").toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-stat-orders">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Orders</p>
                      <p className="text-2xl font-bold">{activeOrders.length}</p>
                    </div>
                    <div className="p-3 rounded-full bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    Total orders: <span className="font-medium text-foreground">{orders?.length || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {activeOrders.length > 0 && (
              <Card data-testid="card-active-orders">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Active Orders
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeOrders.slice(0, 3).map((order) => (
                    <div 
                      key={order.id} 
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                      data-testid={`order-active-${order.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${getOrderStatusColor(order.status)}`}>
                          {getOrderStatusIcon(order.status)}
                        </div>
                        <div>
                          <p className="font-medium">Order #{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={getOrderStatusColor(order.status)}>
                          {order.status.replace(/_/g, " ")}
                        </Badge>
                        <p className="text-sm font-medium mt-1">${order.total}</p>
                      </div>
                    </div>
                  ))}
                  {activeOrders.length > 3 && (
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => handleSectionChange("orders")}
                      data-testid="button-view-all-orders"
                    >
                      View all {activeOrders.length} active orders
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                size="lg"
                className="h-auto py-6 flex-col gap-2"
                onClick={() => handleSectionChange("preferences")}
                data-testid="button-quick-preferences"
              >
                <Settings className="h-6 w-6" />
                <span>Update Preferences</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-auto py-6 flex-col gap-2"
                onClick={() => handleSectionChange("referrals")}
                data-testid="button-quick-referrals"
              >
                <Gift className="h-6 w-6" />
                <span>Refer Friends</span>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6" data-testid="section-orders">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Order History</h2>
                <p className="text-muted-foreground">View and track all your orders</p>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={orderDateFilter}
                  onChange={(e) => setOrderDateFilter(e.target.value)}
                  className="w-auto"
                  data-testid="input-order-filter-date"
                />
                {orderDateFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOrderDateFilter("")}
                    data-testid="button-clear-filter"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {ordersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : filteredOrders && filteredOrders.length > 0 ? (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Collapsible 
                    key={order.id} 
                    open={expandedOrders.has(order.id)}
                    onOpenChange={() => toggleOrderExpand(order.id)}
                  >
                    <Card data-testid={`order-card-${order.id}`}>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover-elevate">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-full ${getOrderStatusColor(order.status)}`}>
                                {getOrderStatusIcon(order.status)}
                              </div>
                              <div>
                                <CardTitle className="text-base">Order #{order.orderNumber}</CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <Badge variant="outline" className={getOrderStatusColor(order.status)}>
                                  {order.status.replace(/_/g, " ")}
                                </Badge>
                                <p className="font-semibold mt-1">${order.total}</p>
                              </div>
                              {expandedOrders.has(order.id) ? (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0 space-y-4">
                          <Separator />
                          
                          {order.items && order.items.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Items</h4>
                              <div className="space-y-2">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-sm">
                                    <span>{item.name} × {item.quantity}</span>
                                    <span>${item.price}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {order.statusHistory && order.statusHistory.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Status Timeline</h4>
                              <div className="relative pl-6 space-y-4">
                                {order.statusHistory.map((status, idx) => (
                                  <div key={idx} className="relative">
                                    <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                      <div className="w-2 h-2 rounded-full bg-white" />
                                    </div>
                                    {idx < order.statusHistory!.length - 1 && (
                                      <div className="absolute -left-[15px] top-4 w-0.5 h-full bg-border" />
                                    )}
                                    <div>
                                      <p className="font-medium text-sm capitalize">
                                        {status.status.replace(/_/g, " ")}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(status.date).toLocaleString()}
                                      </p>
                                      {status.note && (
                                        <p className="text-sm text-muted-foreground mt-1">{status.note}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No orders yet</h3>
                  <p className="text-muted-foreground">Your order history will appear here.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6" data-testid="section-preferences">
            <div>
              <h2 className="text-xl font-semibold">Laundry Preferences</h2>
              <p className="text-muted-foreground">Customize how we handle your laundry</p>
            </div>

            <Form {...preferencesForm}>
              <form onSubmit={preferencesForm.handleSubmit((data) => updatePreferencesMutation.mutate(data))} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-primary" />
                      Detergent & Softener
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={preferencesForm.control}
                      name="detergentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Detergent Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-detergent-type">
                                <SelectValue placeholder="Select detergent type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="hypoallergenic">Hypoallergenic</SelectItem>
                              <SelectItem value="scent_free">Scent-Free</SelectItem>
                              <SelectItem value="eco_friendly">Eco-Friendly</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={preferencesForm.control}
                      name="detergentBrand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Brand (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Tide, All Free & Clear" data-testid="input-detergent-brand" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center justify-between">
                      <FormField
                        control={preferencesForm.control}
                        name="fabricSoftener"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-fabric-softener"
                              />
                            </FormControl>
                            <FormLabel className="!mt-0">Use Fabric Softener</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                    {preferencesForm.watch("fabricSoftener") && (
                      <FormField
                        control={preferencesForm.control}
                        name="fabricSoftenerType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Softener Type/Brand</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Downy, Snuggle" data-testid="input-softener-type" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Thermometer className="h-5 w-5 text-primary" />
                      Wash & Dry Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={preferencesForm.control}
                      name="waterTemperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Water Temperature</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-water-temp">
                                <SelectValue placeholder="Select temperature" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cold">Cold</SelectItem>
                              <SelectItem value="warm">Warm</SelectItem>
                              <SelectItem value="hot">Hot</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={preferencesForm.control}
                      name="dryerHeat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dryer Heat</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-dryer-heat">
                                <SelectValue placeholder="Select heat level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="air_dry">Air Dry Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shirt className="h-5 w-5 text-primary" />
                      Folding & Finishing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={preferencesForm.control}
                      name="foldingStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Folding Style</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-folding-style">
                                <SelectValue placeholder="Select folding style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="standard">Standard Fold</SelectItem>
                              <SelectItem value="military">Military Fold</SelectItem>
                              <SelectItem value="hung">Hung on Hangers</SelectItem>
                              <SelectItem value="rolled">Rolled</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <div className="space-y-3">
                      <FormField
                        control={preferencesForm.control}
                        name="hangDelicates"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-hang-delicates"
                              />
                            </FormControl>
                            <FormLabel className="!mt-0">Hang Delicate Items</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={preferencesForm.control}
                        name="separateColors"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-separate-colors"
                              />
                            </FormControl>
                            <FormLabel className="!mt-0">Separate Colors & Whites</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <FormField
                        control={preferencesForm.control}
                        name="starchShirts"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-starch-shirts"
                              />
                            </FormControl>
                            <FormLabel className="!mt-0">Starch Dress Shirts</FormLabel>
                          </FormItem>
                        )}
                      />
                      {preferencesForm.watch("starchShirts") && (
                        <FormField
                          control={preferencesForm.control}
                          name="starchLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Starch Level</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-starch-level">
                                    <SelectValue placeholder="Select starch level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="light">Light</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="heavy">Heavy</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                    <FormField
                      control={preferencesForm.control}
                      name="packagingPreference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Packaging Preference</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-packaging">
                                <SelectValue placeholder="Select packaging" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="folded_in_bag">Folded in Bag</SelectItem>
                              <SelectItem value="on_hangers">On Hangers</SelectItem>
                              <SelectItem value="box">In Box</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      Special Instructions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={preferencesForm.control}
                      name="allergies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Allergies</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., fragrance, dyes (comma separated)"
                              data-testid="input-allergies"
                            />
                          </FormControl>
                          <FormDescription>
                            List any allergies or sensitivities we should know about
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={preferencesForm.control}
                      name="specialInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Instructions</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Any other special requests or instructions..."
                              rows={4}
                              data-testid="input-special-instructions"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={updatePreferencesMutation.isPending}
                  data-testid="button-save-preferences"
                >
                  {updatePreferencesMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="loyalty" className="space-y-6" data-testid="section-loyalty">
            <div>
              <h2 className="text-xl font-semibold">Loyalty Program</h2>
              <p className="text-muted-foreground">Earn points and unlock exclusive rewards</p>
            </div>

            <Card className="overflow-hidden">
              <div className={`p-6 ${getTierColor(user.loyaltyTier || "bronze")}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-white/20 rounded-full">
                      <Crown className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-sm opacity-90">Current Tier</p>
                      <h3 className="text-2xl font-bold capitalize">{user.loyaltyTier || "Bronze"}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold" data-testid="text-points-balance">{currentPoints.toLocaleString()}</p>
                    <p className="text-sm opacity-90">Available Points</p>
                  </div>
                </div>
              </div>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress to {tierInfo.next}</span>
                      <span className="font-medium">{Math.round(progressToNext)}%</span>
                    </div>
                    <Progress value={progressToNext} className="h-3" data-testid="progress-tier" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {tierInfo.points > 0 
                        ? `${(tierInfo.points - currentPoints).toLocaleString()} more points needed`
                        : "You've reached the highest tier!"
                      }
                    </p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{user.lifetimePoints?.toLocaleString() || 0}</p>
                      <p className="text-sm text-muted-foreground">Lifetime Points</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">${parseFloat(user.lifetimeSpend || "0").toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Lifetime Spend</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tier Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">1 point per $1 spent</span>
                  </div>
                  {(user.loyaltyTier === "silver" || user.loyaltyTier === "gold" || user.loyaltyTier === "platinum") && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">5% discount on all orders</span>
                    </div>
                  )}
                  {(user.loyaltyTier === "gold" || user.loyaltyTier === "platinum") && (
                    <>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Free pickup & delivery</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Priority processing</span>
                      </div>
                    </>
                  )}
                  {user.loyaltyTier === "platinum" && (
                    <>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">15% discount on all orders</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Exclusive platinum member events</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Redemption Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Gift className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">$5 Off</p>
                        <p className="text-xs text-muted-foreground">Next order</p>
                      </div>
                    </div>
                    <Badge variant="outline">500 pts</Badge>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Gift className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">$15 Off</p>
                        <p className="text-xs text-muted-foreground">Next order</p>
                      </div>
                    </div>
                    <Badge variant="outline">1,200 pts</Badge>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Gift className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">Free Wash</p>
                        <p className="text-xs text-muted-foreground">Up to $30 value</p>
                      </div>
                    </div>
                    <Badge variant="outline">2,000 pts</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  Points History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loyaltyLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : loyaltyTransactions && loyaltyTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {loyaltyTransactions.slice(0, 10).map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        data-testid={`loyalty-tx-${tx.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            tx.transactionType === "earned" || tx.transactionType === "bonus"
                              ? "bg-green-500/10 text-green-600"
                              : "bg-amber-500/10 text-amber-600"
                          }`}>
                            {tx.transactionType === "earned" || tx.transactionType === "bonus" ? (
                              <Plus className="h-4 w-4" />
                            ) : (
                              <Gift className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm capitalize">
                              {tx.transactionType.replace(/_/g, " ")}
                            </p>
                            <p className="text-xs text-muted-foreground">{tx.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            tx.transactionType === "earned" || tx.transactionType === "bonus"
                              ? "text-green-600"
                              : "text-amber-600"
                          }`}>
                            {tx.transactionType === "earned" || tx.transactionType === "bonus" ? "+" : "-"}
                            {Math.abs(tx.points).toLocaleString()} pts
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No points transactions yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6" data-testid="section-payments">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Payment Methods</h2>
                <p className="text-muted-foreground">Manage your saved payment methods</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-payment">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Card
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Payment Method</DialogTitle>
                    <DialogDescription>
                      Securely add a new credit or debit card to your account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-6">
                    <div className="p-6 border-2 border-dashed rounded-lg text-center">
                      <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Stripe payment form would be integrated here.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Cards are securely processed by Stripe.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button disabled>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Card
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {paymentsLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : paymentMethods && paymentMethods.length > 0 ? (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <Card key={method.id} data-testid={`payment-method-${method.id}`}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-muted rounded-lg">
                            <CreditCard className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium capitalize">{method.brand}</p>
                              <span className="text-muted-foreground">•••• {method.last4}</span>
                              {method.isDefault && (
                                <Badge variant="secondary" className="text-xs">Default</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Expires {method.expMonth.toString().padStart(2, "0")}/{method.expYear}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!method.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDefaultPaymentMutation.mutate(method.id)}
                              disabled={setDefaultPaymentMutation.isPending}
                              data-testid={`button-set-default-${method.id}`}
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deletePaymentMethodMutation.mutate(method.id)}
                            disabled={deletePaymentMethodMutation.isPending}
                            data-testid={`button-remove-payment-${method.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No payment methods</h3>
                  <p className="text-muted-foreground mb-4">Add a card to make checkout faster.</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button data-testid="button-add-first-payment">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Card
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Payment Method</DialogTitle>
                        <DialogDescription>
                          Securely add a new credit or debit card.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-6">
                        <div className="p-6 border-2 border-dashed rounded-lg text-center">
                          <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">
                            Stripe payment form integration placeholder.
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}

            <Card className="bg-muted/50">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Secure Payments</p>
                    <p>Your payment information is encrypted and securely processed by Stripe. We never store your full card details.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6" data-testid="section-referrals">
            <div>
              <h2 className="text-xl font-semibold">Refer Friends</h2>
              <p className="text-muted-foreground">Share the love and earn rewards</p>
            </div>

            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-primary/20 rounded-full">
                    <Gift className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Give $10, Get $10</h3>
                    <p className="text-muted-foreground">
                      When your friend places their first order, you both get $10 off!
                    </p>
                  </div>
                </div>
              </div>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <Label className="text-sm text-muted-foreground">Your Referral Code</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 p-4 bg-muted rounded-lg font-mono text-lg font-semibold text-center" data-testid="text-referral-code">
                      {user.referralCode || "LOADING..."}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyReferralCode}
                      data-testid="button-copy-referral"
                    >
                      {copiedCode ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    className="flex-1"
                    onClick={shareReferralEmail}
                    data-testid="button-share-email"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Share via Email
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={copyReferralCode}
                    data-testid="button-share-copy"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-bold text-primary" data-testid="text-referral-count">
                      {user.referralCount || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Friends Referred</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">
                      ${((user.referralCount || 0) * 10).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Earned in Rewards</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-full text-primary font-semibold text-sm w-8 h-8 flex items-center justify-center">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Share your code</p>
                      <p className="text-sm text-muted-foreground">
                        Send your unique referral code to friends and family
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-full text-primary font-semibold text-sm w-8 h-8 flex items-center justify-center">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Friend signs up</p>
                      <p className="text-sm text-muted-foreground">
                        They create an account using your referral code
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-full text-primary font-semibold text-sm w-8 h-8 flex items-center justify-center">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Everyone wins</p>
                      <p className="text-sm text-muted-foreground">
                        You both get $10 off when they place their first order
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around py-2" data-testid="mobile-nav">
          <button
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              activeSection === "dashboard" ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => handleSectionChange("dashboard")}
            data-testid="mobile-nav-dashboard"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </button>
          <button
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              activeSection === "orders" ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => handleSectionChange("orders")}
            data-testid="mobile-nav-orders"
          >
            <Package className="h-5 w-5" />
            <span className="text-xs">Orders</span>
          </button>
          <button
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              activeSection === "loyalty" ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => handleSectionChange("loyalty")}
            data-testid="mobile-nav-loyalty"
          >
            <Star className="h-5 w-5" />
            <span className="text-xs">Loyalty</span>
          </button>
          <button
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              activeSection === "preferences" ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => handleSectionChange("preferences")}
            data-testid="mobile-nav-preferences"
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}