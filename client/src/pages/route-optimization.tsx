import { useState, useMemo, lazy, Suspense } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { 
  MapPin, 
  Plus, 
  Truck, 
  Route,
  Navigation, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle,
  GripVertical, 
  Trash2, 
  Edit, 
  Play,
  Loader2,
  Calendar,
  Package,
  Phone,
  Mail,
  Camera,
  FileSignature,
  ArrowUpDown,
  Sparkles,
  AlertCircle
} from "lucide-react";
import type { DeliveryRoute, DeliveryStop } from "@shared/schema";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const Map = lazy(() => import("@vis.gl/react-google-maps").then(m => ({ default: m.Map })));
const Marker = lazy(() => import("@vis.gl/react-google-maps").then(m => ({ default: m.Marker })));
const APIProvider = lazy(() => import("@vis.gl/react-google-maps").then(m => ({ default: m.APIProvider })));

type RouteWithStops = DeliveryRoute & { stops: DeliveryStop[] };

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200",
  in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200",
};

const stopStatusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  en_route: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200",
  arrived: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200",
  failed: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200",
  skipped: "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200",
};

const serviceTypeLabels: Record<string, string> = {
  pickup: "Pickup",
  delivery: "Delivery",
  both: "Pickup & Delivery",
};

function SortableStopItem({ stop, onEdit, onDelete, onComplete }: { 
  stop: DeliveryStop; 
  onEdit: () => void; 
  onDelete: () => void;
  onComplete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 p-4 bg-card border rounded-lg mb-2 hover-elevate"
      data-testid={`stop-item-${stop.id}`}
    >
      <button
        className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
        data-testid={`button-drag-stop-${stop.id}`}
      >
        <GripVertical className="w-5 h-5" />
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">#{stop.sequence}</span>
          <Badge className={stopStatusColors[stop.status]}>
            {stop.status.replace("_", " ")}
          </Badge>
          <Badge variant="outline">
            {serviceTypeLabels[stop.serviceType] || stop.serviceType}
          </Badge>
        </div>
        
        <h4 className="font-medium text-foreground truncate" data-testid={`text-stop-customer-${stop.id}`}>
          {stop.customerName}
        </h4>
        
        <p className="text-sm text-muted-foreground truncate" data-testid={`text-stop-address-${stop.id}`}>
          <MapPin className="w-3 h-3 inline mr-1" />
          {stop.address}
        </p>
        
        {stop.timeWindowStart && stop.timeWindowEnd && (
          <p className="text-xs text-muted-foreground mt-1">
            <Clock className="w-3 h-3 inline mr-1" />
            {stop.timeWindowStart} - {stop.timeWindowEnd}
          </p>
        )}
        
        {stop.specialInstructions && (
          <p className="text-xs text-muted-foreground mt-1 italic truncate">
            {stop.specialInstructions}
          </p>
        )}
      </div>
      
      <div className="flex flex-col gap-1">
        {stop.status !== "completed" && (
          <Button size="icon" variant="ghost" onClick={onComplete} data-testid={`button-complete-stop-${stop.id}`}>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </Button>
        )}
        <Button size="icon" variant="ghost" onClick={onEdit} data-testid={`button-edit-stop-${stop.id}`}>
          <Edit className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={onDelete} data-testid={`button-delete-stop-${stop.id}`}>
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}

function RouteMap({ stops }: { stops: DeliveryStop[] }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  
  const validStops = stops.filter(s => s.latitude && s.longitude);
  
  const center = useMemo(() => {
    if (validStops.length === 0) {
      return { lat: 35.4676, lng: -94.2088 }; // Default center
    }
    const avgLat = validStops.reduce((sum, s) => sum + parseFloat(s.latitude!.toString()), 0) / validStops.length;
    const avgLng = validStops.reduce((sum, s) => sum + parseFloat(s.longitude!.toString()), 0) / validStops.length;
    return { lat: avgLat, lng: avgLng };
  }, [validStops]);

  if (!apiKey) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/50 rounded-lg">
        <p className="text-muted-foreground">Google Maps API key not configured</p>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center bg-muted/50 rounded-lg">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={center}
          defaultZoom={validStops.length > 0 ? 12 : 10}
          gestureHandling="cooperative"
          disableDefaultUI={false}
          zoomControl={true}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={true}
          className="w-full h-full rounded-lg"
        >
          {validStops.map((stop, index) => (
            <Marker
              key={stop.id}
              position={{
                lat: parseFloat(stop.latitude!.toString()),
                lng: parseFloat(stop.longitude!.toString()),
              }}
              title={`${index + 1}. ${stop.customerName}`}
              label={`${stop.sequence}`}
            />
          ))}
        </Map>
      </APIProvider>
    </Suspense>
  );
}

function CreateRouteDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    routeName: "",
    routeDate: format(new Date(), "yyyy-MM-dd"),
    startAddress: "",
    endAddress: "",
    notes: "",
  });
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("/api/route-optimization/routes", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          routeDate: new Date(data.routeDate),
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/route-optimization/routes"] });
      setOpen(false);
      setFormData({
        routeName: "",
        routeDate: format(new Date(), "yyyy-MM-dd"),
        startAddress: "",
        endAddress: "",
        notes: "",
      });
      toast({ title: "Route created successfully" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to create route", variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white" data-testid="button-create-route">
          <Plus className="w-4 h-4 mr-2" />
          New Route
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#0A1628] flex items-center justify-center">
              <Route className="h-4 w-4 text-[#C8A661]" />
            </div>
            Create New Route
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(formData);
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="routeName">Route Name</Label>
            <Input
              id="routeName"
              value={formData.routeName}
              onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
              placeholder="e.g., Morning Route - Downtown"
              required
              data-testid="input-route-name"
            />
          </div>
          <div>
            <Label htmlFor="routeDate">Route Date</Label>
            <Input
              id="routeDate"
              type="date"
              value={formData.routeDate}
              onChange={(e) => setFormData({ ...formData, routeDate: e.target.value })}
              required
              data-testid="input-route-date"
            />
          </div>
          <div>
            <Label htmlFor="startAddress">Start Address (optional)</Label>
            <Input
              id="startAddress"
              value={formData.startAddress}
              onChange={(e) => setFormData({ ...formData, startAddress: e.target.value })}
              placeholder="Starting location"
              data-testid="input-start-address"
            />
          </div>
          <div>
            <Label htmlFor="endAddress">End Address (optional)</Label>
            <Input
              id="endAddress"
              value={formData.endAddress}
              onChange={(e) => setFormData({ ...formData, endAddress: e.target.value })}
              placeholder="Return location"
              data-testid="input-end-address"
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Route notes..."
              data-testid="input-route-notes"
            />
          </div>
          <Button type="submit" className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" disabled={createMutation.isPending} data-testid="button-submit-route">
            {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Create Route
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddStopDialog({ routeId, onSuccess }: { routeId: string; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    serviceType: "both",
    timeWindowStart: "",
    timeWindowEnd: "",
    estimatedServiceTime: 10,
    specialInstructions: "",
    itemCount: 0,
  });
  const [isGeocoding, setIsGeocoding] = useState(false);
  const { toast } = useToast();

  const addStopMutation = useMutation({
    mutationFn: async (data: typeof formData & { latitude?: number; longitude?: number }) => {
      return apiRequest(`/api/route-optimization/routes/${routeId}/stops`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/route-optimization/routes", routeId] });
      setOpen(false);
      setFormData({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        serviceType: "both",
        timeWindowStart: "",
        timeWindowEnd: "",
        estimatedServiceTime: 10,
        specialInstructions: "",
        itemCount: 0,
      });
      toast({ title: "Stop added successfully" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to add stop", variant: "destructive" });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`;
    
    setIsGeocoding(true);
    try {
      const geocodeRes = await apiRequest("/api/route-optimization/geocode", {
        method: "POST",
        body: JSON.stringify({ address: fullAddress }),
      });
      
      addStopMutation.mutate({
        ...formData,
        address: fullAddress,
        latitude: geocodeRes.latitude,
        longitude: geocodeRes.longitude,
      });
    } catch {
      addStopMutation.mutate({
        ...formData,
        address: fullAddress,
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-add-stop">
          <Plus className="w-4 h-4 mr-2" />
          Add Stop
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#0A1628] flex items-center justify-center">
              <MapPin className="h-4 w-4 text-[#C8A661]" />
            </div>
            Add Stop
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="John Doe"
              required
              data-testid="input-stop-customer-name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerPhone">Phone</Label>
              <Input
                id="customerPhone"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="(555) 123-4567"
                data-testid="input-stop-customer-phone"
              />
            </div>
            <div>
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                placeholder="email@example.com"
                data-testid="input-stop-customer-email"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St"
              required
              data-testid="input-stop-address"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
                data-testid="input-stop-city"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="State"
                data-testid="input-stop-state"
              />
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                placeholder="12345"
                data-testid="input-stop-zip"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="serviceType">Service Type *</Label>
            <Select
              value={formData.serviceType}
              onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
            >
              <SelectTrigger data-testid="select-service-type">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pickup">Pickup Only</SelectItem>
                <SelectItem value="delivery">Delivery Only</SelectItem>
                <SelectItem value="both">Pickup & Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timeWindowStart">Time Window Start</Label>
              <Input
                id="timeWindowStart"
                type="time"
                value={formData.timeWindowStart}
                onChange={(e) => setFormData({ ...formData, timeWindowStart: e.target.value })}
                data-testid="input-time-window-start"
              />
            </div>
            <div>
              <Label htmlFor="timeWindowEnd">Time Window End</Label>
              <Input
                id="timeWindowEnd"
                type="time"
                value={formData.timeWindowEnd}
                onChange={(e) => setFormData({ ...formData, timeWindowEnd: e.target.value })}
                data-testid="input-time-window-end"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimatedServiceTime">Est. Service Time (min)</Label>
              <Input
                id="estimatedServiceTime"
                type="number"
                value={formData.estimatedServiceTime}
                onChange={(e) => setFormData({ ...formData, estimatedServiceTime: parseInt(e.target.value) || 10 })}
                min="1"
                data-testid="input-service-time"
              />
            </div>
            <div>
              <Label htmlFor="itemCount">Item Count</Label>
              <Input
                id="itemCount"
                type="number"
                value={formData.itemCount}
                onChange={(e) => setFormData({ ...formData, itemCount: parseInt(e.target.value) || 0 })}
                min="0"
                data-testid="input-item-count"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              id="specialInstructions"
              value={formData.specialInstructions}
              onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
              placeholder="Gate code, delivery notes, etc."
              data-testid="input-special-instructions"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" 
            disabled={addStopMutation.isPending || isGeocoding}
            data-testid="button-submit-stop"
          >
            {(addStopMutation.isPending || isGeocoding) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Add Stop
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RouteDetailView({ route, onBack }: { route: RouteWithStops; onBack: () => void }) {
  const [stops, setStops] = useState<DeliveryStop[]>(route.stops || []);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const reorderMutation = useMutation({
    mutationFn: async (stopOrder: { id: string; sequence: number }[]) => {
      return apiRequest(`/api/route-optimization/routes/${route.id}/reorder`, {
        method: "POST",
        body: JSON.stringify({ stopOrder }),
      });
    },
    onSuccess: (data: DeliveryStop[]) => {
      setStops(data);
      queryClient.invalidateQueries({ queryKey: ["/api/route-optimization/routes", route.id] });
      toast({ title: "Stops reordered" });
    },
    onError: () => {
      toast({ title: "Failed to reorder stops", variant: "destructive" });
    },
  });

  const optimizeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/route-optimization/routes/${route.id}/optimize`, {
        method: "POST",
      });
    },
    onSuccess: (data: { route: DeliveryRoute; stops: DeliveryStop[]; optimization: any }) => {
      setStops(data.stops);
      queryClient.invalidateQueries({ queryKey: ["/api/route-optimization/routes", route.id] });
      toast({ 
        title: "Route optimized!",
        description: `${data.optimization.totalDistance}, ${data.optimization.totalDuration}`,
      });
    },
    onError: () => {
      toast({ title: "Failed to optimize route", variant: "destructive" });
    },
  });

  const deleteStopMutation = useMutation({
    mutationFn: async (stopId: string) => {
      return apiRequest(`/api/route-optimization/stops/${stopId}`, {
        method: "DELETE",
      });
    },
    onSuccess: (_, deletedId) => {
      setStops(s => s.filter(stop => stop.id !== deletedId));
      queryClient.invalidateQueries({ queryKey: ["/api/route-optimization/routes", route.id] });
      toast({ title: "Stop deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete stop", variant: "destructive" });
    },
  });

  const completeStopMutation = useMutation({
    mutationFn: async (stopId: string) => {
      return apiRequest(`/api/route-optimization/stops/${stopId}/complete`, {
        method: "POST",
        body: JSON.stringify({}),
      });
    },
    onSuccess: (data: DeliveryStop) => {
      setStops(s => s.map(stop => stop.id === data.id ? data : stop));
      queryClient.invalidateQueries({ queryKey: ["/api/route-optimization/routes", route.id] });
      toast({ title: "Stop marked as complete" });
    },
    onError: () => {
      toast({ title: "Failed to complete stop", variant: "destructive" });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = stops.findIndex(s => s.id === active.id);
    const newIndex = stops.findIndex(s => s.id === over.id);
    
    const newStops = arrayMove(stops, oldIndex, newIndex);
    setStops(newStops);

    const stopOrder = newStops.map((stop, index) => ({
      id: stop.id,
      sequence: index + 1,
    }));
    
    reorderMutation.mutate(stopOrder);
  };

  const completedCount = stops.filter(s => s.status === "completed").length;
  const totalCount = stops.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack} data-testid="button-back-to-routes">
            <ArrowUpDown className="w-4 h-4 mr-2 rotate-90" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-route-name">
              {route.routeName || "Unnamed Route"}
            </h1>
            <p className="text-muted-foreground text-sm">
              <Calendar className="w-3 h-3 inline mr-1" />
              {format(new Date(route.routeDate), "MMMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={statusColors[route.status]}>{route.status.replace("_", " ")}</Badge>
          {route.totalDistance && (
            <Badge variant="outline">
              <Navigation className="w-3 h-3 mr-1" />
              {route.totalDistance} mi
            </Badge>
          )}
          {route.totalDuration && (
            <Badge variant="outline">
              <Clock className="w-3 h-3 mr-1" />
              {route.totalDuration} min
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <AddStopDialog 
          routeId={route.id} 
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/route-optimization/routes", route.id] });
          }} 
        />
        <Button 
          onClick={() => optimizeMutation.mutate()} 
          disabled={stops.length < 2 || optimizeMutation.isPending}
          className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
          data-testid="button-optimize-route"
        >
          {optimizeMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Optimize Route
        </Button>
        {stops.length < 2 && (
          <span className="text-xs text-muted-foreground">
            Add at least 2 stops to optimize
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-card border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#C8A661]" />
                Stops ({totalCount})
              </CardTitle>
              <Badge variant="outline">
                {completedCount}/{totalCount} complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto">
            {stops.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No stops added yet</p>
                <p className="text-sm">Add stops to plan your route</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={stops.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  {stops.map((stop) => (
                    <SortableStopItem
                      key={stop.id}
                      stop={stop}
                      onEdit={() => {
                        toast({ title: "Edit stop - coming soon" });
                      }}
                      onDelete={() => deleteStopMutation.mutate(stop.id)}
                      onComplete={() => completeStopMutation.mutate(stop.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-[#C8A661]" />
              Route Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[450px] rounded-lg overflow-hidden" data-testid="route-map-container">
              <RouteMap stops={stops} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DriverTodayView() {
  const { data: todayRoutes, isLoading } = useQuery<RouteWithStops[]>({
    queryKey: ["/api/route-optimization/today"],
  });
  const { toast } = useToast();

  const completeStopMutation = useMutation({
    mutationFn: async (stopId: string) => {
      return apiRequest(`/api/route-optimization/stops/${stopId}/complete`, {
        method: "POST",
        body: JSON.stringify({}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/route-optimization/today"] });
      toast({ title: "Stop completed!" });
    },
    onError: () => {
      toast({ title: "Failed to complete stop", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#C8A661]" />
      </div>
    );
  }

  if (!todayRoutes || todayRoutes.length === 0) {
    return (
      <Card className="bg-card border shadow-sm">
        <CardContent className="py-12 text-center">
          <Truck className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No Routes Today</h3>
          <p className="text-muted-foreground">You don't have any routes scheduled for today.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {todayRoutes.map((route) => (
        <Card key={route.id} className="bg-card border shadow-sm">
          <div className="h-1 bg-[#C8A661]" />
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                  <Truck className="h-5 w-5 text-[#C8A661]" />
                </div>
                <div>
                  <span data-testid={`text-today-route-name-${route.id}`}>{route.routeName || "Today's Route"}</span>
                  <p className="text-sm font-normal text-muted-foreground">
                    {route.stops?.length || 0} stops
                  </p>
                </div>
              </CardTitle>
              <div className="flex gap-2">
                <Badge className={statusColors[route.status]}>{route.status.replace("_", " ")}</Badge>
                {route.totalDistance && (
                  <Badge variant="outline">
                    {route.totalDistance} mi
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {route.stops?.map((stop, index) => (
                <div 
                  key={stop.id}
                  className={`p-4 rounded-lg border ${stop.status === 'completed' ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-muted/30'}`}
                  data-testid={`today-stop-${stop.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${stop.status === 'completed' ? 'bg-green-600 text-white' : 'bg-[#0A1628] text-[#C8A661]'}`}>
                        {stop.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{stop.customerName}</h4>
                        <p className="text-sm text-muted-foreground">{stop.address}</p>
                        <div className="flex gap-3 mt-2 flex-wrap">
                          {stop.customerPhone && (
                            <a href={`tel:${stop.customerPhone}`} className="text-xs text-[#C8A661] flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {stop.customerPhone}
                            </a>
                          )}
                          {stop.timeWindowStart && stop.timeWindowEnd && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {stop.timeWindowStart} - {stop.timeWindowEnd}
                            </span>
                          )}
                        </div>
                        {stop.specialInstructions && (
                          <p className="text-xs mt-2 italic text-muted-foreground bg-muted/50 p-2 rounded">
                            {stop.specialInstructions}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant="outline">
                        {serviceTypeLabels[stop.serviceType]}
                      </Badge>
                      {stop.status !== 'completed' && (
                        <Button 
                          size="sm"
                          onClick={() => completeStopMutation.mutate(stop.id)}
                          disabled={completeStopMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          data-testid={`button-complete-today-stop-${stop.id}`}
                        >
                          {completeStopMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Complete
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function RouteOptimization() {
  const [activeTab, setActiveTab] = useState("routes");
  const [selectedRoute, setSelectedRoute] = useState<RouteWithStops | null>(null);

  const { data: routes, isLoading } = useQuery<DeliveryRoute[]>({
    queryKey: ["/api/route-optimization/routes"],
  });

  const { data: routeDetail } = useQuery<RouteWithStops>({
    queryKey: ["/api/route-optimization/routes", selectedRoute?.id],
    enabled: !!selectedRoute?.id,
  });

  const currentRoute = routeDetail || selectedRoute;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Route Optimization - PUD Operations | WashBizHub</title>
        <meta name="description" content="Optimize your pickup and delivery routes with Google Maps integration. Plan efficient routes for laundromat PUD operations." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center">
              <Route className="h-6 w-6 text-[#C8A661]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
                Route Optimization
              </h1>
              <p className="text-muted-foreground">
                Plan and optimize pickup & delivery routes
              </p>
            </div>
          </div>
        </div>

        {selectedRoute && currentRoute ? (
          <RouteDetailView 
            route={currentRoute} 
            onBack={() => setSelectedRoute(null)} 
          />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <TabsList>
                <TabsTrigger value="routes" data-testid="tab-routes">
                  <Route className="w-4 h-4 mr-2" />
                  All Routes
                </TabsTrigger>
                <TabsTrigger value="today" data-testid="tab-today">
                  <Truck className="w-4 h-4 mr-2" />
                  Today's Routes
                </TabsTrigger>
              </TabsList>
              
              <CreateRouteDialog onSuccess={() => {}} />
            </div>

            <TabsContent value="routes" className="mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-[#C8A661]" />
                </div>
              ) : !routes || routes.length === 0 ? (
                <Card className="bg-card border shadow-sm">
                  <CardContent className="py-12 text-center">
                    <Route className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No Routes Yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first route to start planning deliveries.</p>
                    <CreateRouteDialog onSuccess={() => {}} />
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {routes.map((route) => (
                    <Card 
                      key={route.id} 
                      className="bg-card border shadow-sm hover-elevate cursor-pointer"
                      onClick={() => setSelectedRoute(route as RouteWithStops)}
                      data-testid={`card-route-${route.id}`}
                    >
                      <div className="h-1 bg-[#C8A661]" />
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                            <Route className="h-5 w-5 text-[#C8A661]" />
                          </div>
                          <Badge className={statusColors[route.status]}>
                            {route.status.replace("_", " ")}
                          </Badge>
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-1" data-testid={`text-route-card-name-${route.id}`}>
                          {route.routeName || "Unnamed Route"}
                        </h3>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {format(new Date(route.routeDate), "MMMM d, yyyy")}
                        </p>

                        <div className="flex items-center gap-3 text-sm">
                          {route.totalDistance && (
                            <span className="text-muted-foreground">
                              <Navigation className="w-3 h-3 inline mr-1" />
                              {route.totalDistance} mi
                            </span>
                          )}
                          {route.totalDuration && (
                            <span className="text-muted-foreground">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {route.totalDuration} min
                            </span>
                          )}
                        </div>

                        {route.driverName && (
                          <p className="text-sm text-muted-foreground mt-3">
                            <User className="w-3 h-3 inline mr-1" />
                            {route.driverName}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="today" className="mt-0">
              <DriverTodayView />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
