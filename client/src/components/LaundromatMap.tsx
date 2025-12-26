import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Clock } from "lucide-react";
import { Star } from "@/lib/icon-registry";

interface Laundromat {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  rating: number;
  distance: string;
  hours: string;
  machines: number;
  price: string;
  open: boolean;
}

interface LaundromatMapProps {
  laundromats: Laundromat[];
  onSelectLaundromat: (laundromat: Laundromat) => void;
  userLat?: number;
  userLng?: number;
}

declare global {
  interface Window {
    google: any;
  }
}

export function LaundromatMap({
  laundromats,
  onSelectLaundromat,
  userLat = 40.7128,
  userLng = -74.006,
}: LaundromatMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<Laundromat | null>(null);

  // Initialize map on mount
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: { lat: userLat, lng: userLng },
      styles: [
        {
          featureType: "all",
          elementType: "labels.text.fill",
          stylers: [{ color: "#ffffff" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#1a1a1a" }],
        },
      ],
    });

    // Add user location marker
    new window.google.maps.Marker({
      position: { lat: userLat, lng: userLng },
      map: mapInstance.current,
      icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      title: "Your Location",
    });
  }, [userLat, userLng]);

  // Add laundromat markers
  useEffect(() => {
    if (!mapInstance.current || !window.google) return;

    markers.forEach((marker) => marker.setMap(null));

    const newMarkers = laundromats.map((laundromat) => {
      const marker = new window.google.maps.Marker({
        position: { lat: laundromat.lat, lng: laundromat.lng },
        map: mapInstance.current,
        title: laundromat.name,
        icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
      });

      marker.addListener("click", () => {
        setSelectedMarker(laundromat);
        onSelectLaundromat(laundromat);
        mapInstance.current.setCenter({ lat: laundromat.lat, lng: laundromat.lng });
        mapInstance.current.setZoom(15);
      });

      return marker;
    });

    setMarkers(newMarkers);

    if (newMarkers.length > 0 && mapInstance.current) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend({ lat: userLat, lng: userLng });
      newMarkers.forEach((marker) => {
        const pos = marker.getPosition();
        if (pos) bounds.extend(pos);
      });
      mapInstance.current.fitBounds(bounds);
    }
  }, [laundromats, userLat, userLng, onSelectLaundromat, markers.length]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Map */}
      <div className="lg:col-span-2">
        <Card className="overflow-hidden">
          <div
            ref={mapRef}
            className="w-full h-[600px] bg-slate-800"
            data-testid="laundromat-map"
          />
        </Card>
      </div>

      {/* Selected Laundromat Details */}
      <div className="lg:col-span-1">
        <Card className="sticky top-6">
          {selectedMarker ? (
            <>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedMarker.name}</CardTitle>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold">{selectedMarker.rating}</span>
                    </div>
                  </div>
                  <Badge variant={selectedMarker.open ? "default" : "secondary"}>
                    {selectedMarker.open ? "Open" : "Closed"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Address */}
                <div className="flex gap-2">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">{selectedMarker.address}</p>
                    <p className="text-sm text-muted-foreground">{selectedMarker.distance}</p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex gap-2">
                  <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Hours</p>
                    <p className="text-sm text-muted-foreground">{selectedMarker.hours}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-2">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">{selectedMarker.phone}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{selectedMarker.machines}</p>
                    <p className="text-xs text-muted-foreground">Machines</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">{selectedMarker.price}</p>
                    <p className="text-xs text-muted-foreground">Per Pound</p>
                  </div>
                </div>

                {/* CTAs */}
                <div className="grid grid-cols-2 gap-2 pt-4">
                  <Button size="sm" variant="outline" data-testid="button-directions">
                    Directions
                  </Button>
                  <Button size="sm" data-testid="button-contact">
                    Contact
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="pt-6 text-center text-muted-foreground">
              Click a marker on the map to see details
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
