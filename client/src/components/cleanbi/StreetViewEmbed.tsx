import { useState, useEffect } from "react";
import { Eye, Maximize2, Minimize2, MapPin, RotateCcw, Lock, Crown, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StreetViewEmbedProps {
  address: string;
  coordinates?: { lat: number; lng: number };
  isSubscriber?: boolean;
  onUpgradeClick?: () => void;
}

export function StreetViewEmbed({
  address,
  coordinates,
  isSubscriber = false,
  onUpgradeClick
}: StreetViewEmbedProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [heading, setHeading] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  const getStreetViewUrl = (width: number, height: number) => {
    if (!apiKey) return null;
    
    const location = coordinates 
      ? `${coordinates.lat},${coordinates.lng}` 
      : encodeURIComponent(address);
    
    return `https://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&location=${location}&heading=${heading}&pitch=0&fov=90&key=${apiKey}`;
  };
  
  const getEmbedUrl = () => {
    if (!apiKey) return null;
    
    const location = coordinates 
      ? `${coordinates.lat},${coordinates.lng}` 
      : encodeURIComponent(address);
    
    return `https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${location}&heading=${heading}&pitch=0&fov=90`;
  };
  
  const rotateView = (degrees: number) => {
    setHeading((prev) => (prev + degrees + 360) % 360);
  };
  
  const openInGoogleMaps = () => {
    const location = coordinates 
      ? `${coordinates.lat},${coordinates.lng}` 
      : encodeURIComponent(address);
    window.open(`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${location}`, '_blank');
  };
  
  if (!isSubscriber) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-sm bg-background/80 z-10 flex items-center justify-center">
          <div className="text-center p-6">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
            <p className="text-muted-foreground mb-4">
              Unlock Street View with a Starter subscription or higher
            </p>
            <Button onClick={onUpgradeClick} className="gap-2">
              <Crown className="h-4 w-4" />
              Upgrade Now
            </Button>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-500" />
            Street View
          </CardTitle>
        </CardHeader>
        <CardContent className="blur-sm">
          <div className="h-64 bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }
  
  if (!apiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-500" />
            Street View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2" />
              <p>Google Maps API key not configured</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const embedUrl = getEmbedUrl();
  
  return (
    <Card className={cn(isExpanded && "fixed inset-4 z-50")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-500" />
            Street View
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              {address.slice(0, 30)}...
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              data-testid="button-expand-streetview"
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className={cn(
          "relative rounded-lg overflow-hidden bg-muted",
          isExpanded ? "h-[calc(100vh-200px)]" : "h-64"
        )}>
          {embedUrl && (
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => setIsLoading(false)}
              onError={() => setError("Failed to load Street View")}
            />
          )}
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="animate-pulse text-muted-foreground">
                Loading Street View...
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-2" />
                <p>{error}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => rotateView(-90)}
              data-testid="button-rotate-left"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Rotate Left
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => rotateView(90)}
              data-testid="button-rotate-right"
            >
              Rotate Right
              <RotateCcw className="h-4 w-4 ml-1 transform scale-x-[-1]" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={openInGoogleMaps}
            data-testid="button-open-google-maps"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Open in Google Maps
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Use Street View to inspect location visibility, parking, signage, and neighborhood.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default StreetViewEmbed;
