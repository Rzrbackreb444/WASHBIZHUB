import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { 
  Truck, MapPin, Plus, Trash2, Clock, Package, Star,
  Loader2, Sparkles, Route, Fuel, AlertTriangle, CheckCircle,
  Navigation, ExternalLink, BarChart3, FileText, GripVertical
} from "lucide-react";

interface DeliveryStop {
  id: string;
  address: string;
  customerName: string;
  orderSize: "small" | "medium" | "large" | "extra-large";
  timeWindowStart: string;
  timeWindowEnd: string;
  priority: "normal" | "high" | "vip";
  notes: string;
}

interface OptimizedStop {
  sequence: number;
  stopId: string;
  address: string;
  customerName: string;
  orderSize: string;
  priority: string;
  estimatedArrival: string;
  estimatedDeparture: string;
  travelTimeFromPrevious: number;
  distanceFromPrevious: number;
  timeWindowCompliant: boolean;
  timeWindowNotes: string;
  driverInstructions: string;
}

interface RouteOptimizationResult {
  success: boolean;
  data: {
    startLocation: string;
    optimizedStops: OptimizedStop[];
    routeStatistics: {
      totalDistance: number;
      totalDuration: number;
      totalFuelCost: number;
      averageTimePerStop: number;
      numberOfStops: number;
      estimatedStartTime: string;
      estimatedEndTime: string;
    };
    timeWindowCompliance: {
      compliantStops: number;
      nonCompliantStops: number;
      complianceRate: number;
      issues: Array<{
        stopId: string;
        customerName: string;
        issue: string;
        suggestion: string;
      }>;
    };
    efficiencyScore: {
      overall: number;
      routeEfficiency: number;
      timeWindowScore: number;
      capacityUtilization: number;
      grade: "A" | "B" | "C" | "D";
      summary: string;
    };
    trafficConsiderations: {
      peakHourWarnings: string[];
      avoidAreas: string[];
      bestDepartureWindow: string;
    };
    alternativeRoutes: Array<{
      name: string;
      description: string;
      timeDifference: number;
      distanceDifference: number;
      tradeoffs: string;
    }>;
    googleMapsUrl: string;
    driverBriefing: string;
  };
  confidence: number;
  error?: string;
}

const GRADE_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  "A": { color: "#22C55E", bgColor: "rgba(34, 197, 94, 0.15)", label: "Excellent Route" },
  "B": { color: "#A3E635", bgColor: "rgba(163, 230, 53, 0.15)", label: "Good Route" },
  "C": { color: "#FBBF24", bgColor: "rgba(251, 191, 36, 0.15)", label: "Acceptable Route" },
  "D": { color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.15)", label: "Needs Optimization" }
};

function GradeBadge({ grade, score }: { grade: string; score: number }) {
  const config = GRADE_CONFIG[grade] || GRADE_CONFIG["D"];
  
  return (
    <div 
      className="flex items-center gap-3 px-4 py-3 rounded-lg"
      style={{ backgroundColor: config.bgColor }}
      data-testid="badge-efficiency-grade"
    >
      <div 
        className="text-4xl font-bold"
        style={{ color: config.color }}
        data-testid="text-grade-letter"
      >
        {grade}
      </div>
      <div>
        <div 
          className="text-lg font-semibold"
          style={{ color: config.color }}
          data-testid="text-grade-score"
        >
          {score}/100
        </div>
        <div className="text-sm text-muted-foreground" data-testid="text-grade-label">
          {config.label}
        </div>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    vip: "bg-purple-100 text-purple-700 border-purple-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    normal: "bg-gray-100 text-gray-700 border-gray-200"
  };
  
  return (
    <Badge variant="outline" className={`${colors[priority] || colors.normal} capitalize`}>
      {priority === "vip" ? "VIP" : priority}
    </Badge>
  );
}

function OrderSizeBadge({ size }: { size: string }) {
  const colors: Record<string, string> = {
    small: "bg-green-100 text-green-700",
    medium: "bg-blue-100 text-blue-700",
    large: "bg-yellow-100 text-yellow-700",
    "extra-large": "bg-red-100 text-red-700"
  };
  
  return (
    <Badge className={`${colors[size] || colors.medium} capitalize`}>
      {size.replace("-", " ")}
    </Badge>
  );
}

function createEmptyStop(): DeliveryStop {
  return {
    id: `stop-${Date.now()}`,
    address: "",
    customerName: "",
    orderSize: "medium",
    timeWindowStart: "",
    timeWindowEnd: "",
    priority: "normal",
    notes: "",
  };
}

export default function DeliveryRouteOptimizer() {
  const [startLocation, setStartLocation] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [stops, setStops] = useState<DeliveryStop[]>([createEmptyStop()]);
  const [vehicleCapacity, setVehicleCapacity] = useState(200);
  const [fuelEconomy, setFuelEconomy] = useState(25);
  const [fuelPrice, setFuelPrice] = useState(3.50);
  const [progress, setProgress] = useState(0);

  const optimizeMutation = useMutation({
    mutationFn: async (data: {
      startLocation: string;
      stops: DeliveryStop[];
      vehicleConstraints: { capacity: number; fuelEconomyMpg: number; fuelPricePerGallon: number };
      departureTime?: string;
    }) => {
      setProgress(10);
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 12, 85));
      }, 600);
      
      try {
        const response = await apiRequest("POST", "/api/ai/optimize-delivery-route", data);
        clearInterval(interval);
        setProgress(100);
        return response.json() as Promise<RouteOptimizationResult>;
      } catch (error) {
        clearInterval(interval);
        setProgress(0);
        throw error;
      }
    },
    onSettled: () => {
      setTimeout(() => setProgress(0), 1000);
    }
  });

  const handleAddStop = () => {
    setStops([...stops, createEmptyStop()]);
  };

  const handleRemoveStop = (id: string) => {
    if (stops.length > 1) {
      setStops(stops.filter(s => s.id !== id));
    }
  };

  const handleStopChange = (id: string, field: keyof DeliveryStop, value: string) => {
    setStops(stops.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleOptimize = () => {
    if (!startLocation.trim()) return;
    const validStops = stops.filter(s => s.address.trim() && s.customerName.trim());
    if (validStops.length === 0) return;

    optimizeMutation.mutate({
      startLocation,
      stops: validStops,
      vehicleConstraints: {
        capacity: vehicleCapacity,
        fuelEconomyMpg: fuelEconomy,
        fuelPricePerGallon: fuelPrice,
      },
      departureTime: departureTime || undefined,
    });
  };

  const handleExportToMaps = () => {
    if (result?.data?.googleMapsUrl) {
      window.open(result.data.googleMapsUrl, "_blank");
    }
  };

  const result = optimizeMutation.data;
  const validStopCount = stops.filter(s => s.address.trim() && s.customerName.trim()).length;

  return (
    <>
      <SEO
        title="Delivery Route Optimizer | AI-Powered Route Planning | WashBizHub"
        description="Optimize your laundromat delivery routes with AI. Minimize travel time, reduce fuel costs, and ensure time window compliance for pickup and delivery services."
        keywords={["delivery route optimizer", "laundromat delivery", "route optimization", "AI route planning", "delivery logistics", "pickup delivery laundry"]}
        canonicalUrl="https://washbizhub.com/delivery-route-optimizer"
      />
      
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { name: "Home", url: "/" },
              { name: "AI Tools", url: "/ai-tools" },
              { name: "Delivery Route Optimizer", url: "/delivery-route-optimizer" }
            ]}
          />
          
          <div className="mt-8 mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center">
                <Truck className="h-6 w-6 text-[#C8A661]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="heading-page-title">
                  Delivery Route Optimizer
                </h1>
                <p className="text-muted-foreground">
                  AI-powered route optimization for pickup & delivery
                </p>
              </div>
              <Badge className="ml-auto bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Premium AI Tool
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-3xl" data-testid="text-page-description">
              Enter your laundromat address and delivery stops to get an AI-optimized route. 
              Our system minimizes travel time, calculates fuel costs, and ensures time window compliance.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2 bg-card border shadow-sm overflow-hidden">
              <div className="h-1 bg-[#C8A661]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#C8A661]" />
                  Route Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startLocation" className="text-sm font-medium">
                      Start Location (Laundromat)
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="startLocation"
                        placeholder="123 Main St, City, State ZIP"
                        value={startLocation}
                        onChange={(e) => setStartLocation(e.target.value)}
                        className="pl-10"
                        data-testid="input-start-location"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departureTime" className="text-sm font-medium">
                      Departure Time (Optional)
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="departureTime"
                        type="time"
                        value={departureTime}
                        onChange={(e) => setDepartureTime(e.target.value)}
                        className="pl-10"
                        data-testid="input-departure-time"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-sm font-medium">
                      Delivery Stops ({validStopCount} valid)
                    </Label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAddStop}
                      data-testid="button-add-stop"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Stop
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {stops.map((stop, index) => (
                      <div 
                        key={stop.id} 
                        className="p-4 border rounded-lg bg-muted/30 space-y-3"
                        data-testid={`container-stop-${index}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">
                              Stop #{index + 1}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveStop(stop.id)}
                            disabled={stops.length === 1}
                            data-testid={`button-remove-stop-${index}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          <Input
                            placeholder="Customer Name"
                            value={stop.customerName}
                            onChange={(e) => handleStopChange(stop.id, "customerName", e.target.value)}
                            data-testid={`input-customer-name-${index}`}
                          />
                          <Input
                            placeholder="Address"
                            value={stop.address}
                            onChange={(e) => handleStopChange(stop.id, "address", e.target.value)}
                            data-testid={`input-address-${index}`}
                          />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <Select 
                            value={stop.orderSize} 
                            onValueChange={(v) => handleStopChange(stop.id, "orderSize", v)}
                          >
                            <SelectTrigger data-testid={`select-order-size-${index}`}>
                              <SelectValue placeholder="Size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                              <SelectItem value="extra-large">Extra Large</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select 
                            value={stop.priority} 
                            onValueChange={(v) => handleStopChange(stop.id, "priority", v)}
                          >
                            <SelectTrigger data-testid={`select-priority-${index}`}>
                              <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="vip">VIP</SelectItem>
                            </SelectContent>
                          </Select>

                          <Input
                            type="time"
                            placeholder="From"
                            value={stop.timeWindowStart}
                            onChange={(e) => handleStopChange(stop.id, "timeWindowStart", e.target.value)}
                            data-testid={`input-time-start-${index}`}
                          />
                          <Input
                            type="time"
                            placeholder="To"
                            value={stop.timeWindowEnd}
                            onChange={(e) => handleStopChange(stop.id, "timeWindowEnd", e.target.value)}
                            data-testid={`input-time-end-${index}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm overflow-hidden h-fit">
              <div className="h-1 bg-[#C8A661]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Fuel className="h-5 w-5 text-[#C8A661]" />
                  Vehicle Constraints
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Capacity</Label>
                    <span className="text-sm text-muted-foreground" data-testid="text-capacity-value">
                      {vehicleCapacity} lbs
                    </span>
                  </div>
                  <Slider
                    value={[vehicleCapacity]}
                    onValueChange={(v) => setVehicleCapacity(v[0])}
                    min={50}
                    max={500}
                    step={10}
                    data-testid="slider-capacity"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Fuel Economy</Label>
                    <span className="text-sm text-muted-foreground" data-testid="text-fuel-economy-value">
                      {fuelEconomy} MPG
                    </span>
                  </div>
                  <Slider
                    value={[fuelEconomy]}
                    onValueChange={(v) => setFuelEconomy(v[0])}
                    min={10}
                    max={50}
                    step={1}
                    data-testid="slider-fuel-economy"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Fuel Price</Label>
                    <span className="text-sm text-muted-foreground" data-testid="text-fuel-price-value">
                      ${fuelPrice.toFixed(2)}/gal
                    </span>
                  </div>
                  <Slider
                    value={[fuelPrice]}
                    onValueChange={(v) => setFuelPrice(v[0])}
                    min={2.50}
                    max={6.00}
                    step={0.10}
                    data-testid="slider-fuel-price"
                  />
                </div>

                {optimizeMutation.isPending && (
                  <div className="space-y-2" data-testid="container-loading">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Optimizing route...
                    </div>
                    <Progress value={progress} className="h-2" data-testid="progress-optimization" />
                  </div>
                )}

                <Button 
                  onClick={handleOptimize}
                  disabled={!startLocation.trim() || validStopCount === 0 || optimizeMutation.isPending}
                  className="w-full bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                  data-testid="button-optimize"
                >
                  {optimizeMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Optimize Route
                    </>
                  )}
                </Button>

                {optimizeMutation.isError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm" data-testid="alert-error">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Failed to optimize. Try again.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {result?.success && result.data && (
            <div className="space-y-6" data-testid="container-results">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Optimized Route</h2>
                <Button 
                  onClick={handleExportToMaps}
                  className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
                  data-testid="button-export-maps"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Google Maps
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card border shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Route className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#C8A661]" data-testid="text-total-distance">
                          {result.data.routeStatistics.totalDistance.toFixed(1)} mi
                        </p>
                        <p className="text-xs text-muted-foreground">Total Distance</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#C8A661]" data-testid="text-total-duration">
                          {result.data.routeStatistics.totalDuration} min
                        </p>
                        <p className="text-xs text-muted-foreground">Total Duration</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Fuel className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#C8A661]" data-testid="text-fuel-cost">
                          ${result.data.routeStatistics.totalFuelCost.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">Fuel Cost</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Package className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#C8A661]" data-testid="text-stop-count">
                          {result.data.routeStatistics.numberOfStops}
                        </p>
                        <p className="text-xs text-muted-foreground">Delivery Stops</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-card border shadow-sm overflow-hidden">
                  <div className="h-1 bg-[#C8A661]" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Navigation className="h-5 w-5 text-[#C8A661]" />
                      Optimized Stop Sequence
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto" data-testid="list-optimized-stops">
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                          S
                        </div>
                        <div>
                          <p className="font-medium text-sm">Start: {result.data.startLocation}</p>
                          <p className="text-xs text-muted-foreground">
                            Departure: {result.data.routeStatistics.estimatedStartTime}
                          </p>
                        </div>
                      </div>

                      {result.data.optimizedStops.map((stop, index) => (
                        <div 
                          key={stop.stopId} 
                          className={`flex items-start gap-3 p-3 rounded-lg border ${
                            stop.timeWindowCompliant 
                              ? "bg-muted/30 border-border" 
                              : "bg-orange-50 border-orange-200"
                          }`}
                          data-testid={`card-stop-${index}`}
                        >
                          <div className="h-8 w-8 rounded-full bg-[#0A1628] text-white flex items-center justify-center text-sm font-bold shrink-0">
                            {stop.sequence}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-sm truncate">{stop.customerName}</p>
                              <PriorityBadge priority={stop.priority} />
                              <OrderSizeBadge size={stop.orderSize} />
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {stop.address}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Arrive: {stop.estimatedArrival}</span>
                              <span>+{stop.travelTimeFromPrevious} min</span>
                              <span>{stop.distanceFromPrevious.toFixed(1)} mi</span>
                            </div>
                            {!stop.timeWindowCompliant && (
                              <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {stop.timeWindowNotes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}

                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                          E
                        </div>
                        <div>
                          <p className="font-medium text-sm">End Route</p>
                          <p className="text-xs text-muted-foreground">
                            Est. Completion: {result.data.routeStatistics.estimatedEndTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="bg-card border shadow-sm overflow-hidden">
                    <div className="h-1 bg-[#C8A661]" />
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-[#C8A661]" />
                        Efficiency Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-4">
                        <GradeBadge 
                          grade={result.data.efficiencyScore.grade} 
                          score={result.data.efficiencyScore.overall} 
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Route Efficiency</span>
                            <span className="font-medium">{result.data.efficiencyScore.routeEfficiency}%</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Time Windows</span>
                            <span className="font-medium">{result.data.efficiencyScore.timeWindowScore}%</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Capacity Use</span>
                            <span className="font-medium">{result.data.efficiencyScore.capacityUtilization}%</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-4" data-testid="text-efficiency-summary">
                        {result.data.efficiencyScore.summary}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border shadow-sm overflow-hidden">
                    <div className="h-1 bg-[#C8A661]" />
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-[#C8A661]" />
                        Time Window Compliance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-6 mb-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600" data-testid="text-compliant-stops">
                            {result.data.timeWindowCompliance.compliantStops}
                          </p>
                          <p className="text-xs text-muted-foreground">On Time</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600" data-testid="text-noncompliant-stops">
                            {result.data.timeWindowCompliance.nonCompliantStops}
                          </p>
                          <p className="text-xs text-muted-foreground">Issues</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Compliance Rate</span>
                            <span className="font-medium" data-testid="text-compliance-rate">
                              {result.data.timeWindowCompliance.complianceRate}%
                            </span>
                          </div>
                          <Progress 
                            value={result.data.timeWindowCompliance.complianceRate} 
                            className="h-2" 
                          />
                        </div>
                      </div>

                      {result.data.timeWindowCompliance.issues.length > 0 && (
                        <div className="space-y-2" data-testid="list-compliance-issues">
                          {result.data.timeWindowCompliance.issues.map((issue, i) => (
                            <div key={i} className="p-2 bg-orange-50 rounded-lg text-sm">
                              <p className="font-medium text-orange-700">{issue.customerName}</p>
                              <p className="text-orange-600 text-xs">{issue.issue}</p>
                              <p className="text-muted-foreground text-xs mt-1">{issue.suggestion}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Card className="bg-card border shadow-sm overflow-hidden">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#C8A661]" />
                    Driver Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-line" data-testid="text-driver-briefing">
                      {result.data.driverBriefing}
                    </p>
                  </div>

                  {result.data.trafficConsiderations.peakHourWarnings.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Traffic Alerts
                      </h4>
                      <ul className="space-y-1" data-testid="list-traffic-warnings">
                        {result.data.trafficConsiderations.peakHourWarnings.map((warning, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-orange-500 mt-1">•</span>
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.data.alternativeRoutes.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Alternative Routes</h4>
                      <div className="space-y-2" data-testid="list-alternative-routes">
                        {result.data.alternativeRoutes.map((alt, i) => (
                          <div key={i} className="p-3 bg-muted/30 rounded-lg">
                            <p className="font-medium text-sm">{alt.name}</p>
                            <p className="text-xs text-muted-foreground">{alt.description}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs">
                              <span className={alt.timeDifference < 0 ? "text-green-600" : "text-red-600"}>
                                {alt.timeDifference > 0 ? "+" : ""}{alt.timeDifference} min
                              </span>
                              <span className={alt.distanceDifference < 0 ? "text-green-600" : "text-muted-foreground"}>
                                {alt.distanceDifference > 0 ? "+" : ""}{alt.distanceDifference} mi
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-muted/30 border-dashed">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 justify-center text-center">
                    <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                      <MapPin className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Route Map Visualization</p>
                      <p className="text-sm text-muted-foreground">
                        Google Maps integration placeholder - Click "Open in Google Maps" to view full route
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>AI Confidence:</span>
                <Progress value={result.confidence * 100} className="w-24 h-2" />
                <span data-testid="text-ai-confidence">{Math.round(result.confidence * 100)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}