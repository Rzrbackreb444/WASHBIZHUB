import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Navigation, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Package, 
  ArrowRight,
  Send,
  Copy,
  Loader2,
  LocateFixed,
  Share2,
  User,
  Home as HomeIcon
} from "lucide-react";

interface Stop {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  serviceType: "pickup" | "delivery" | "both";
  status: string;
  sequence: number;
  timeWindowStart: string;
  timeWindowEnd: string;
  specialInstructions: string;
  trackingToken: string;
  estimatedArrival: string;
  etaMinutes: number;
}

interface Route {
  id: string;
  routeName: string;
  routeDate: string;
  status: string;
  driverName: string;
  vehicleDescription: string;
  locationSharingActive: boolean;
  totalDistance: string;
  totalDuration: number;
  stops: Stop[];
}

export default function DriverMobile() {
  const { toast } = useToast();
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const { data: routes, isLoading } = useQuery<Route[]>({
    queryKey: ["/api/driver-tracking/my-route"],
  });

  const activeRoute = routes?.[0];

  const updateLocationMutation = useMutation({
    mutationFn: async (coords: { latitude: number; longitude: number; heading?: number; speed?: number }) => {
      if (!activeRoute) return;
      return apiRequest("POST", `/api/driver-tracking/routes/${activeRoute.id}/update-location`, coords);
    },
  });

  const toggleLocationSharingMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!activeRoute) return;
      return apiRequest("POST", `/api/driver-tracking/routes/${activeRoute.id}/toggle-location-sharing`, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver-tracking/my-route"] });
      toast({
        title: locationEnabled ? "Location sharing disabled" : "Location sharing enabled",
        description: locationEnabled ? "Customers will no longer see your live location" : "Customers can now see your live location",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ stopId, status }: { stopId: string; status: string }) => {
      return apiRequest("POST", `/api/driver-tracking/stops/${stopId}/update-status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver-tracking/my-route"] });
      toast({
        title: "Status updated",
        description: "Stop status has been updated successfully",
      });
    },
  });

  const generateTokenMutation = useMutation({
    mutationFn: async (stopId: string) => {
      const res = await apiRequest("POST", `/api/driver-tracking/stops/${stopId}/generate-token`);
      return res.json();
    },
    onSuccess: (data) => {
      navigator.clipboard.writeText(data.trackingUrl);
      toast({
        title: "Tracking link copied!",
        description: "Send this link to the customer",
      });
    },
  });

  useEffect(() => {
    if (locationEnabled && activeRoute) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          updateLocationMutation.mutate({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({
            title: "Location error",
            description: "Could not get your location. Please enable location services.",
            variant: "destructive",
          });
        },
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
      );
      setWatchId(id);
      toggleLocationSharingMutation.mutate(true);
    } else if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      if (activeRoute) {
        toggleLocationSharingMutation.mutate(false);
      }
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [locationEnabled, activeRoute?.id]);

  const openInGoogleMaps = (stop: Stop) => {
    const address = encodeURIComponent(`${stop.address}, ${stop.city}, ${stop.state} ${stop.zipCode}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, "_blank");
  };

  const callCustomer = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-600";
      case "arrived": return "bg-blue-600";
      case "en_route": return "bg-orange-500";
      case "failed": return "bg-red-600";
      case "skipped": return "bg-gray-500";
      default: return "bg-gray-400";
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending": return "en_route";
      case "en_route": return "arrived";
      case "arrived": return "completed";
      default: return null;
    }
  };

  const getStatusButtonLabel = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending": return "Start En Route";
      case "en_route": return "Mark Arrived";
      case "arrived": return "Mark Complete";
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center" data-testid="loading-driver-mobile">
        <Loader2 className="h-8 w-8 animate-spin text-[#C8A661]" />
      </div>
    );
  }

  if (!activeRoute || activeRoute.stops.length === 0) {
    return (
      <div className="min-h-screen bg-muted/30 p-4">
        <Card className="bg-card border shadow-sm">
          <CardContent className="p-8 text-center">
            <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">No Active Route</h2>
            <p className="text-muted-foreground">You don't have any scheduled routes for today.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedStops = activeRoute.stops.filter(s => s.status === "completed").length;
  const totalStops = activeRoute.stops.length;
  const currentStop = activeRoute.stops.find(s => ["pending", "en_route", "arrived"].includes(s.status));

  return (
    <div className="min-h-screen bg-muted/30 pb-24" data-testid="driver-mobile-page">
      <div className="bg-[#0A1628] text-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold" data-testid="text-route-name">{activeRoute.routeName || "Today's Route"}</h1>
            <p className="text-sm text-gray-300">{completedStops} of {totalStops} stops completed</p>
          </div>
          <Badge className="bg-[#C8A661] text-[#0A1628]" data-testid="badge-route-status">
            {activeRoute.status === "in_progress" ? "In Progress" : activeRoute.status}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <LocateFixed className="h-5 w-5 text-[#C8A661]" />
            <span className="text-sm">Share Live Location</span>
          </div>
          <Switch
            checked={locationEnabled}
            onCheckedChange={setLocationEnabled}
            data-testid="switch-location-sharing"
          />
        </div>
      </div>

      {activeRoute.totalDistance && (
        <div className="grid grid-cols-2 gap-3 p-4">
          <Card className="bg-card border shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-[#C8A661]" data-testid="text-total-distance">{activeRoute.totalDistance} mi</p>
              <p className="text-xs text-muted-foreground">Total Distance</p>
            </CardContent>
          </Card>
          <Card className="bg-card border shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-[#C8A661]" data-testid="text-total-duration">{activeRoute.totalDuration} min</p>
              <p className="text-xs text-muted-foreground">Est. Duration</p>
            </CardContent>
          </Card>
        </div>
      )}

      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="p-4 space-y-4">
          {activeRoute.stops.map((stop, index) => (
            <Card 
              key={stop.id} 
              className={`bg-card border shadow-sm overflow-hidden ${currentStop?.id === stop.id ? "ring-2 ring-[#C8A661]" : ""}`}
              data-testid={`card-stop-${stop.id}`}
            >
              <div className={`h-1 ${getStatusColor(stop.status)}`} />
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#0A1628] flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground" data-testid={`text-customer-name-${stop.id}`}>
                        {stop.customerName}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {stop.serviceType === "pickup" ? "Pickup" : stop.serviceType === "delivery" ? "Delivery" : "Both"}
                      </Badge>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(stop.status)} text-white`} data-testid={`badge-status-${stop.id}`}>
                    {stop.status.replace("_", " ")}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground" data-testid={`text-address-${stop.id}`}>
                      {stop.address}, {stop.city}, {stop.state} {stop.zipCode}
                    </span>
                  </div>
                  {stop.timeWindowStart && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {stop.timeWindowStart} - {stop.timeWindowEnd}
                      </span>
                    </div>
                  )}
                  {stop.specialInstructions && (
                    <p className="text-sm text-orange-600 bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                      {stop.specialInstructions}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white flex-1"
                    onClick={() => openInGoogleMaps(stop)}
                    data-testid={`button-navigate-${stop.id}`}
                  >
                    <Navigation className="h-4 w-4 mr-1" />
                    Navigate
                  </Button>
                  
                  {stop.customerPhone && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => callCustomer(stop.customerPhone)}
                      data-testid={`button-call-${stop.id}`}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateTokenMutation.mutate(stop.id)}
                    disabled={generateTokenMutation.isPending}
                    data-testid={`button-share-${stop.id}`}
                  >
                    {generateTokenMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Share2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {stop.status !== "completed" && stop.status !== "failed" && stop.status !== "skipped" && (
                  <>
                    <Separator className="my-3" />
                    <div className="flex gap-2">
                      {getNextStatus(stop.status) && (
                        <Button
                          className="flex-1 bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
                          onClick={() => updateStatusMutation.mutate({ 
                            stopId: stop.id, 
                            status: getNextStatus(stop.status)! 
                          })}
                          disabled={updateStatusMutation.isPending}
                          data-testid={`button-update-status-${stop.id}`}
                        >
                          {updateStatusMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <ArrowRight className="h-4 w-4 mr-2" />
                          )}
                          {getStatusButtonLabel(stop.status)}
                        </Button>
                      )}
                      {stop.status !== "pending" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ stopId: stop.id, status: "failed" })}
                          disabled={updateStatusMutation.isPending}
                          data-testid={`button-mark-failed-${stop.id}`}
                        >
                          Failed
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 flex gap-3">
        <Button
          className="flex-1 bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
          onClick={() => {
            if (currentStop) openInGoogleMaps(currentStop);
          }}
          disabled={!currentStop}
          data-testid="button-navigate-next"
        >
          <Navigation className="h-4 w-4 mr-2" />
          Navigate to Next Stop
        </Button>
      </div>
    </div>
  );
}
