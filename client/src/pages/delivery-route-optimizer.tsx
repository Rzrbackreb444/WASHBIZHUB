import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PremiumResults } from "@/components/withPremiumEnhancements";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  MapPin, Truck, Clock, DollarSign, Plus, Trash2, Route, 
  Navigation, Fuel, TrendingUp, CheckCircle, AlertTriangle, 
  ExternalLink, Loader2, Target, BarChart3, Sparkles, Timer,
  Package, ArrowRight, Info
} from "lucide-react";

interface DeliveryStop {
  id: string;
  address: string;
  orderValue: number;
  timeWindowStart: string;
  timeWindowEnd: string;
}

interface OptimizedStop {
  sequence: number;
  id: string;
  address: string;
  orderValue: number;
  estimatedArrival: string;
  estimatedDeparture: string;
  distanceFromPrevious: number;
  timeFromPrevious: number;
  timeWindowStart: string;
  timeWindowEnd: string;
  timeWindowStatus: "on-time" | "early" | "late" | "at-risk";
  waitTime: number;
  cumulativeDistance: number;
  cumulativeTime: number;
  cumulativeRevenue: number;
  notes: string;
}

interface RouteResult {
  success: boolean;
  data: {
    summary: {
      totalStops: number;
      totalDistance: number;
      totalTime: number;
      totalDrivingTime: number;
      totalServiceTime: number;
      totalWaitTime: number;
      totalBreakTime: number;
      estimatedStartTime: string;
      estimatedEndTime: string;
      fuelCost: number;
      totalRevenue: number;
      revenuePerMile: number;
      revenuePerHour: number;
      costPerStop: number;
      profitMargin: number;
    };
    optimizedRoute: OptimizedStop[];
    capacityUtilization: {
      totalOrderValue: number;
      vehicleCapacity: number;
      utilizationPercent: number;
      status: "optimal" | "underutilized" | "near-capacity" | "over-capacity";
      recommendation: string;
    };
    timeWindowCompliance: {
      onTimeStops: number;
      earlyStops: number;
      lateStops: number;
      atRiskStops: number;
      complianceRate: number;
      status: "excellent" | "good" | "needs-attention" | "critical";
    };
    efficiency: {
      milesPerStop: number;
      stopsPerHour: number;
      idleTimePercent: number;
      routeEfficiencyScore: number;
      grade: "A" | "B" | "C" | "D" | "F";
    };
    recommendations: Array<{
      category: string;
      title: string;
      description: string;
      impact: "high" | "medium" | "low";
      savings: number | null;
    }>;
    googleMapsUrl: string;
    turnByTurnSummary: string[];
  };
  confidence: number;
  error?: string;
}

function getTimeWindowStatusColor(status: string) {
  switch (status) {
    case "on-time": return "text-green-600";
    case "early": return "text-blue-600";
    case "late": return "text-red-600";
    case "at-risk": return "text-orange-600";
    default: return "text-muted-foreground";
  }
}

function getComplianceStatusBadge(status: string) {
  switch (status) {
    case "excellent": return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Excellent</Badge>;
    case "good": return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Good</Badge>;
    case "needs-attention": return <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30">Needs Attention</Badge>;
    case "critical": return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">Critical</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
}

function getGradeBadge(grade: string) {
  const colors: Record<string, string> = {
    A: "bg-green-500/20 text-green-600 border-green-500/30",
    B: "bg-blue-500/20 text-blue-600 border-blue-500/30",
    C: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
    D: "bg-orange-500/20 text-orange-600 border-orange-500/30",
    F: "bg-red-500/20 text-red-600 border-red-500/30",
  };
  return <Badge className={colors[grade] || "bg-muted text-muted-foreground"}>Grade {grade}</Badge>;
}

export default function DeliveryRouteOptimizer() {
  const { toast } = useToast();
  const [origin, setOrigin] = useState("");
  const [stops, setStops] = useState<DeliveryStop[]>([
    { id: "1", address: "", orderValue: 0, timeWindowStart: "09:00", timeWindowEnd: "12:00" },
  ]);
  const [vehicleCapacity, setVehicleCapacity] = useState(500);
  const [fuelCostPerMile, setFuelCostPerMile] = useState(0.35);
  const [averageSpeed, setAverageSpeed] = useState(25);
  const [maxDrivingHours, setMaxDrivingHours] = useState(8);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [result, setResult] = useState<RouteResult | null>(null);

  const optimizeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/optimize-delivery-route", {
        origin,
        stops,
        vehicleConstraints: {
          capacity: vehicleCapacity,
          fuelCostPerMile,
          averageSpeedMph: averageSpeed,
        },
        driverConstraints: {
          maxDrivingHours,
          breakDurationMinutes: 30,
          breakAfterHours: 4,
          startTime,
          endTime,
        },
      });
      return response.json();
    },
    onSuccess: (data: RouteResult) => {
      setResult(data);
      if (data.success) {
        toast({
          title: "Route Optimized!",
          description: `Optimized ${data.data.summary.totalStops} stops with ${data.data.efficiency.grade} efficiency grade.`,
        });
      } else {
        toast({
          title: "Optimization Issue",
          description: data.error || "Could not fully optimize route.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Optimization Failed",
        description: error.message || "Failed to optimize route. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addStop = () => {
    setStops([
      ...stops,
      {
        id: String(Date.now()),
        address: "",
        orderValue: 0,
        timeWindowStart: "09:00",
        timeWindowEnd: "17:00",
      },
    ]);
  };

  const removeStop = (id: string) => {
    if (stops.length > 1) {
      setStops(stops.filter((s) => s.id !== id));
    }
  };

  const updateStop = (id: string, field: keyof DeliveryStop, value: string | number) => {
    setStops(stops.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const canOptimize = origin.trim().length > 0 && stops.every((s) => s.address.trim().length > 0);

  return (
    <>
      <SEO
        title="Delivery Route Optimizer | AI-Powered WDF Route Planning | WashBizHub"
        description="Optimize your laundromat pickup and delivery routes with AI. Calculate optimal stop sequences, fuel costs, time windows, and revenue per mile for wash-dry-fold services."
        canonicalUrl="/delivery-route-optimizer"
        ogType="website"
        keywords={[
          "delivery route optimizer",
          "WDF route planning",
          "laundromat delivery",
          "pickup delivery optimization",
          "route efficiency",
          "fuel cost calculator",
          "time window routing",
          "laundry delivery software",
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "AI Tools", url: "/ai-tools" },
          { name: "Delivery Route Optimizer", url: "/delivery-route-optimizer" },
        ]}
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Breadcrumb
            items={[
              { name: "Home", url: "/" },
              { name: "AI Tools", url: "/ai-tools" },
              { name: "Delivery Route Optimizer", url: "/delivery-route-optimizer" },
            ]}
          />

          <div className="mb-8 mt-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-[#0A1628]">
                <Route className="w-8 h-8 text-[#C8A661]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
                  Delivery Route Optimizer
                </h1>
                <p className="text-muted-foreground">
                  AI-powered route optimization for WDF pickup & delivery services
                </p>
              </div>
              <Badge className="ml-auto bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border shadow-sm">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#C8A661]" />
                    Origin Address
                  </CardTitle>
                  <CardDescription>
                    Your laundromat or depot starting location
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="123 Main Street, City, State ZIP"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    data-testid="input-origin-address"
                  />
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-[#C8A661]" />
                      Delivery Stops
                    </CardTitle>
                    <CardDescription>
                      Add addresses, order values, and time windows for each stop
                    </CardDescription>
                  </div>
                  <Button onClick={addStop} size="sm" data-testid="button-add-stop">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Stop
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stops.map((stop, index) => (
                    <div
                      key={stop.id}
                      className="p-4 border rounded-lg bg-muted/30 space-y-3"
                      data-testid={`stop-card-${index}`}
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="font-mono">
                          Stop {index + 1}
                        </Badge>
                        {stops.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeStop(stop.id)}
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            data-testid={`button-remove-stop-${index}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2">
                          <Label className="text-xs text-muted-foreground">Address</Label>
                          <Input
                            placeholder="456 Oak Avenue, City, State ZIP"
                            value={stop.address}
                            onChange={(e) => updateStop(stop.id, "address", e.target.value)}
                            data-testid={`input-stop-address-${index}`}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Order Value ($)</Label>
                          <Input
                            type="number"
                            placeholder="45.00"
                            value={stop.orderValue || ""}
                            onChange={(e) => updateStop(stop.id, "orderValue", parseFloat(e.target.value) || 0)}
                            data-testid={`input-stop-value-${index}`}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Window Start</Label>
                            <Input
                              type="time"
                              value={stop.timeWindowStart}
                              onChange={(e) => updateStop(stop.id, "timeWindowStart", e.target.value)}
                              data-testid={`input-stop-start-${index}`}
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Window End</Label>
                            <Input
                              type="time"
                              value={stop.timeWindowEnd}
                              onChange={(e) => updateStop(stop.id, "timeWindowEnd", e.target.value)}
                              data-testid={`input-stop-end-${index}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#C8A661]" />
                    Vehicle & Driver Constraints
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Vehicle Capacity ($)</Label>
                      <Input
                        type="number"
                        value={vehicleCapacity}
                        onChange={(e) => setVehicleCapacity(parseInt(e.target.value) || 500)}
                        data-testid="input-vehicle-capacity"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Fuel Cost ($/mile)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={fuelCostPerMile}
                        onChange={(e) => setFuelCostPerMile(parseFloat(e.target.value) || 0.35)}
                        data-testid="input-fuel-cost"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Avg Speed (mph)</Label>
                      <Input
                        type="number"
                        value={averageSpeed}
                        onChange={(e) => setAverageSpeed(parseInt(e.target.value) || 25)}
                        data-testid="input-avg-speed"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Max Driving Hours</Label>
                      <Input
                        type="number"
                        value={maxDrivingHours}
                        onChange={(e) => setMaxDrivingHours(parseInt(e.target.value) || 8)}
                        data-testid="input-max-hours"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Shift Start</Label>
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        data-testid="input-shift-start"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Shift End</Label>
                      <Input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        data-testid="input-shift-end"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                className="w-full bg-[#0A1628] hover:bg-[#1a3a5c] text-white h-12"
                onClick={() => optimizeMutation.mutate()}
                disabled={!canOptimize || optimizeMutation.isPending}
                data-testid="button-optimize-route"
              >
                {optimizeMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Optimizing Route...
                  </>
                ) : (
                  <>
                    <Navigation className="w-5 h-5 mr-2" />
                    Optimize Route
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-6">
              <Card className="border shadow-sm bg-gradient-to-br from-[#0A1628]/5 to-[#C8A661]/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Info className="w-5 h-5 text-[#C8A661]" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-[#C8A661]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-[#C8A661]">1</span>
                    </div>
                    <p>Enter your laundromat address as the origin point</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-[#C8A661]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-[#C8A661]">2</span>
                    </div>
                    <p>Add delivery stops with order values and time windows</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-[#C8A661]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-[#C8A661]">3</span>
                    </div>
                    <p>Set vehicle capacity and driver constraints</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-[#C8A661]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-[#C8A661]">4</span>
                    </div>
                    <p>AI optimizes sequence for minimum distance & time</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-[#C8A661]" data-testid="text-total-stops">
                        {stops.length}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Stops</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-[#C8A661]" data-testid="text-total-value">
                        ${stops.reduce((sum, s) => sum + (s.orderValue || 0), 0).toFixed(0)}
                      </div>
                      <div className="text-xs text-muted-foreground">Order Value</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {result?.success && result.data && (
            <PremiumResults
              featureName="delivery-route-optimizer"
              analysisType="delivery-route-optimizer"
              title="Route Optimization Results"
              data={result.data}
              summary={{
                headline: `${result.data.efficiency.grade} Grade Route`,
                metrics: [
                  { label: "Total Distance", value: `${result.data.summary.totalDistance.toFixed(1)} mi` },
                  { label: "Total Time", value: `${Math.floor(result.data.summary.totalTime / 60)}h ${result.data.summary.totalTime % 60}m` },
                  { label: "Fuel Cost", value: `$${result.data.summary.fuelCost.toFixed(2)}` },
                ]
              }}
              benefits={[
                "Unlimited AI analyses",
                "Export to Google Sheets & Docs",
                "Save all results to profile"
              ]}
            >
              <div className="mt-8 space-y-6">
                <Separator />
                
                <div className="flex items-center gap-3 flex-wrap">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-foreground">Optimized Route Results</h2>
                {getGradeBadge(result.data.efficiency.grade)}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                        <Route className="h-5 w-5 text-[#C8A661]" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground" data-testid="text-total-distance">
                          {result.data.summary.totalDistance.toFixed(1)} mi
                        </div>
                        <div className="text-xs text-muted-foreground">Total Distance</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                        <Timer className="h-5 w-5 text-[#C8A661]" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground" data-testid="text-total-time">
                          {Math.floor(result.data.summary.totalTime / 60)}h {result.data.summary.totalTime % 60}m
                        </div>
                        <div className="text-xs text-muted-foreground">Total Time</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                        <Fuel className="h-5 w-5 text-[#C8A661]" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground" data-testid="text-fuel-cost">
                          ${result.data.summary.fuelCost.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">Fuel Cost</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-[#C8A661]" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600" data-testid="text-total-revenue">
                          ${result.data.summary.totalRevenue.toFixed(0)}
                        </div>
                        <div className="text-xs text-muted-foreground">Total Revenue</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border shadow-sm">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
                    <div>
                      <CardTitle>Optimized Stop Sequence</CardTitle>
                      <CardDescription>AI-optimized order for fastest, most efficient route</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(result.data.googleMapsUrl, "_blank")}
                      data-testid="button-export-google-maps"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Open in Google Maps
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-[#0A1628]/5 rounded-lg border-l-4 border-[#0A1628]">
                        <div className="h-8 w-8 rounded-full bg-[#0A1628] flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Origin</div>
                          <div className="text-sm text-muted-foreground">{origin}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Start: {result.data.summary.estimatedStartTime}
                        </div>
                      </div>

                      {result.data.optimizedRoute.map((stop, index) => (
                        <div
                          key={stop.id}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                          data-testid={`result-stop-${index}`}
                        >
                          <div className="h-8 w-8 rounded-full bg-[#C8A661] flex items-center justify-center text-[#0A1628] font-bold text-sm">
                            {stop.sequence}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{stop.address}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                              <span>${stop.orderValue.toFixed(0)}</span>
                              <span>•</span>
                              <span>{stop.timeWindowStart} - {stop.timeWindowEnd}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{stop.estimatedArrival}</div>
                            <div className={`text-xs ${getTimeWindowStatusColor(stop.timeWindowStatus)}`}>
                              {stop.timeWindowStatus.replace("-", " ")}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground text-right hidden md:block">
                            <div>+{stop.distanceFromPrevious.toFixed(1)} mi</div>
                            <div>+{stop.timeFromPrevious} min</div>
                          </div>
                        </div>
                      ))}

                      <div className="flex items-center gap-3 p-3 bg-[#0A1628]/5 rounded-lg border-l-4 border-[#0A1628]">
                        <div className="h-8 w-8 rounded-full bg-[#0A1628] flex items-center justify-center">
                          <ArrowRight className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Return to Origin</div>
                          <div className="text-sm text-muted-foreground">{origin}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          End: {result.data.summary.estimatedEndTime}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="border shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-[#C8A661]" />
                        Efficiency Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Revenue/Mile</span>
                        <span className="font-bold text-green-600" data-testid="text-revenue-per-mile">
                          ${result.data.summary.revenuePerMile.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Revenue/Hour</span>
                        <span className="font-bold" data-testid="text-revenue-per-hour">
                          ${result.data.summary.revenuePerHour.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Stops/Hour</span>
                        <span className="font-bold" data-testid="text-stops-per-hour">
                          {result.data.efficiency.stopsPerHour.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Miles/Stop</span>
                        <span className="font-bold" data-testid="text-miles-per-stop">
                          {result.data.efficiency.milesPerStop.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Profit Margin</span>
                        <span className="font-bold text-green-600" data-testid="text-profit-margin">
                          {result.data.summary.profitMargin.toFixed(1)}%
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Efficiency Score</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{result.data.efficiency.routeEfficiencyScore}</span>
                          {getGradeBadge(result.data.efficiency.grade)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-[#C8A661]" />
                        Time Window Compliance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Compliance Rate</span>
                        <span className="font-bold text-lg" data-testid="text-compliance-rate">
                          {result.data.timeWindowCompliance.complianceRate.toFixed(0)}%
                        </span>
                      </div>
                      {getComplianceStatusBadge(result.data.timeWindowCompliance.status)}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="bg-green-50 dark:bg-green-950/30 rounded p-2 text-center">
                          <div className="text-lg font-bold text-green-600">{result.data.timeWindowCompliance.onTimeStops}</div>
                          <div className="text-xs text-muted-foreground">On Time</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-950/30 rounded p-2 text-center">
                          <div className="text-lg font-bold text-blue-600">{result.data.timeWindowCompliance.earlyStops}</div>
                          <div className="text-xs text-muted-foreground">Early</div>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-950/30 rounded p-2 text-center">
                          <div className="text-lg font-bold text-orange-600">{result.data.timeWindowCompliance.atRiskStops}</div>
                          <div className="text-xs text-muted-foreground">At Risk</div>
                        </div>
                        <div className="bg-red-50 dark:bg-red-950/30 rounded p-2 text-center">
                          <div className="text-lg font-bold text-red-600">{result.data.timeWindowCompliance.lateStops}</div>
                          <div className="text-xs text-muted-foreground">Late</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-[#C8A661]" />
                        Capacity Utilization
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Utilization</span>
                          <span className="font-bold" data-testid="text-utilization">
                            {result.data.capacityUtilization.utilizationPercent.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div
                            className="bg-[#C8A661] h-3 rounded-full transition-all"
                            style={{ width: `${Math.min(100, result.data.capacityUtilization.utilizationPercent)}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${result.data.capacityUtilization.totalOrderValue.toFixed(0)} / ${result.data.capacityUtilization.vehicleCapacity} capacity
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {result.data.capacityUtilization.recommendation}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {result.data.recommendations.length > 0 && (
                <Card className="border shadow-sm">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#C8A661]" />
                      Recommendations for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.data.recommendations.map((rec, index) => (
                        <Alert
                          key={index}
                          className={
                            rec.impact === "high"
                              ? "border-green-200 bg-green-50/50 dark:bg-green-950/20"
                              : rec.impact === "medium"
                              ? "border-blue-200 bg-blue-50/50 dark:bg-blue-950/20"
                              : "border-muted"
                          }
                          data-testid={`recommendation-${index}`}
                        >
                          <AlertTriangle className={`h-4 w-4 ${
                            rec.impact === "high" ? "text-green-600" :
                            rec.impact === "medium" ? "text-blue-600" : "text-muted-foreground"
                          }`} />
                          <AlertTitle className="flex items-center gap-2 flex-wrap">
                            {rec.title}
                            <Badge variant="outline" className="text-xs capitalize">{rec.category}</Badge>
                          </AlertTitle>
                          <AlertDescription className="mt-1">
                            {rec.description}
                            {rec.savings !== null && (
                              <span className="block mt-1 font-medium text-green-600">
                                Potential savings: ${rec.savings.toFixed(2)}
                              </span>
                            )}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {result.data.turnByTurnSummary.length > 0 && (
                <Card className="border shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-[#C8A661]" />
                      Turn-by-Turn Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2">
                      {result.data.turnByTurnSummary.map((step, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm">
                          <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-muted-foreground">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}
              </div>
            </PremiumResults>
          )}
        </div>
      </div>
    </>
  );
}