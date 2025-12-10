import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone,
  User,
  Car,
  Loader2,
  Circle,
  AlertCircle
} from "lucide-react";

interface TimelineItem {
  status: string;
  label: string;
  completed: boolean;
  timestamp: string | null;
}

interface TrackingData {
  id: string;
  status: string;
  customerName: string;
  address: string;
  city: string;
  state: string;
  serviceType: "pickup" | "delivery" | "both";
  timeline: TimelineItem[];
  estimatedArrival: string;
  etaMinutes: number;
  timeWindowStart: string;
  timeWindowEnd: string;
  specialInstructions: string;
  driverLocation: { lat: number; lng: number; heading: number; speed: number; updatedAt: string } | null;
  locationSharingEnabled: boolean;
  lastLocationUpdate: string;
  driver: {
    name: string;
    phone: string;
    photoUrl: string;
    vehicle: string;
  } | null;
  completedAt: string | null;
  arrivedAt: string | null;
}

export default function CustomerTracking() {
  const { token } = useParams();

  const { data, isLoading, error } = useQuery<TrackingData>({
    queryKey: ["/api/driver-tracking/track", token],
    queryFn: async () => {
      const res = await fetch(`/api/driver-tracking/track/${token}`);
      if (!res.ok) {
        throw new Error("Tracking information not found");
      }
      return res.json();
    },
    refetchInterval: 30000,
    enabled: !!token,
  });

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusIcon = (status: string, completed: boolean) => {
    if (completed) {
      return <CheckCircle2 className="h-6 w-6 text-green-600" />;
    }
    switch (status) {
      case "en_route":
        return <Truck className="h-6 w-6 text-orange-500" />;
      case "arrived":
        return <MapPin className="h-6 w-6 text-blue-600" />;
      case "completed":
        return <Package className="h-6 w-6 text-green-600" />;
      default:
        return <Circle className="h-6 w-6 text-gray-300" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center" data-testid="loading-tracking">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#C8A661] mx-auto mb-4" />
          <p className="text-muted-foreground">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4" data-testid="error-tracking">
        <Card className="bg-card border shadow-sm max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Tracking Not Found</h2>
            <p className="text-muted-foreground">
              This tracking link may have expired or the order doesn't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStepIndex = data.timeline.findIndex(item => !item.completed);
  const isComplete = data.status === "completed";

  return (
    <div className="min-h-screen bg-muted/30" data-testid="customer-tracking-page">
      <div className="bg-[#0A1628] text-white p-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Order Tracking</h1>
            <Badge className={`${isComplete ? "bg-green-600" : "bg-[#C8A661]"} text-white`} data-testid="badge-order-status">
              {isComplete ? "Completed" : data.serviceType === "pickup" ? "Pickup" : "Delivery"}
            </Badge>
          </div>
          
          {!isComplete && data.etaMinutes && (
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-sm text-gray-300">Estimated Arrival</p>
              <p className="text-3xl font-bold text-[#C8A661]" data-testid="text-eta">
                {data.etaMinutes} min
              </p>
              {data.estimatedArrival && (
                <p className="text-sm text-gray-300">
                  Around {formatTime(data.estimatedArrival)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        <Card className="bg-card border shadow-sm overflow-hidden">
          <div className="h-1 bg-[#C8A661]" />
          <CardContent className="p-6">
            <h2 className="font-semibold text-foreground mb-4">Delivery Status</h2>
            
            <div className="space-y-4" data-testid="timeline-container">
              {data.timeline.map((item, index) => (
                <div key={item.status} className="flex items-start gap-4" data-testid={`timeline-item-${item.status}`}>
                  <div className="relative">
                    {getStatusIcon(item.status, item.completed)}
                    {index < data.timeline.length - 1 && (
                      <div 
                        className={`absolute left-3 top-8 w-0.5 h-8 ${
                          item.completed ? "bg-green-600" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <p className={`font-medium ${item.completed ? "text-foreground" : "text-muted-foreground"}`}>
                      {item.label}
                    </p>
                    {item.timestamp && (
                      <p className="text-sm text-muted-foreground">
                        {formatTime(item.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {data.locationSharingEnabled && data.driverLocation && (
          <Card className="bg-card border shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Live Driver Location</h3>
                <Badge variant="secondary" className="text-xs">
                  Updated {data.lastLocationUpdate ? formatTime(data.lastLocationUpdate) : "recently"}
                </Badge>
              </div>
              <div 
                className="bg-muted rounded-lg h-48 flex items-center justify-center"
                data-testid="map-container"
              >
                <a
                  href={`https://www.google.com/maps?q=${data.driverLocation.lat},${data.driverLocation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center"
                >
                  <MapPin className="h-8 w-8 text-[#C8A661] mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">View on Google Maps</p>
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-card border shadow-sm overflow-hidden">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-3">Delivery Address</h3>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-foreground" data-testid="text-delivery-address">{data.address}</p>
                <p className="text-muted-foreground">{data.city}, {data.state}</p>
              </div>
            </div>
            {data.timeWindowStart && (
              <div className="flex items-center gap-3 mt-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Time window: {data.timeWindowStart} - {data.timeWindowEnd}
                </p>
              </div>
            )}
            {data.specialInstructions && (
              <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  {data.specialInstructions}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {data.driver && (
          <Card className="bg-card border shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-3">Your Driver</h3>
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  {data.driver.photoUrl ? (
                    <AvatarImage src={data.driver.photoUrl} alt={data.driver.name} />
                  ) : null}
                  <AvatarFallback className="bg-[#0A1628] text-white text-lg">
                    {data.driver.name?.charAt(0) || "D"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-foreground" data-testid="text-driver-name">
                    {data.driver.name || "Your Driver"}
                  </p>
                  {data.driver.vehicle && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Car className="h-4 w-4" />
                      <span data-testid="text-driver-vehicle">{data.driver.vehicle}</span>
                    </div>
                  )}
                </div>
                {data.driver.phone && (
                  <Button
                    size="icon"
                    className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                    onClick={() => window.location.href = `tel:${data.driver.phone}`}
                    data-testid="button-call-driver"
                  >
                    <Phone className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            Powered by WashBizHub
          </p>
        </div>
      </div>
    </div>
  );
}
