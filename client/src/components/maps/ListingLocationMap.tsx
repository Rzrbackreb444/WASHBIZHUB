import { useState } from 'react';
import { Map, Marker, InfoWindow, APIProvider } from '@vis.gl/react-google-maps';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation, MapPin, ExternalLink } from 'lucide-react';
import { getDirectionsUrl, WASHBIZHUB_HQ } from '@/lib/location-utils';

interface ListingLocationMapProps {
  latitude: number;
  longitude: number;
  title: string;
  address: string;
  price?: string;
  showHQ?: boolean;
}

export function ListingLocationMap({
  latitude,
  longitude,
  title,
  address,
  price,
  showHQ = true,
}: ListingLocationMapProps) {
  const [selectedMarker, setSelectedMarker] = useState<'listing' | 'hq' | null>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  const center = { lat: latitude, lng: longitude };

  return (
    <APIProvider apiKey={apiKey}>
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <Map
        defaultCenter={center}
        defaultZoom={14}
        gestureHandling="cooperative"
        disableDefaultUI={false}
        zoomControl={true}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={true}
      >
        {/* Listing Marker */}
        <Marker
          position={center}
          onClick={() => setSelectedMarker('listing')}
          title={title}
        />

        {selectedMarker === 'listing' && (
          <InfoWindow
            position={center}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-semibold text-sm mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground mb-2">{address}</p>
              {price && (
                <Badge className="mb-2" variant="default">{price}</Badge>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(getDirectionsUrl(center), '_blank')}
                  data-testid="button-directions"
                >
                  <Navigation className="w-3 h-3 mr-1" />
                  Directions
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Open in Maps
                </Button>
              </div>
            </div>
          </InfoWindow>
        )}

        {/* WashBizHub HQ Marker */}
        {showHQ && (
          <>
            <Marker
              position={WASHBIZHUB_HQ}
              onClick={() => setSelectedMarker('hq')}
              title="WashBizHub Headquarters"
              icon={{
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="14" fill="#C8A661" stroke="#1e3a8a" stroke-width="2"/>
                    <text x="16" y="22" font-size="18" font-weight="bold" text-anchor="middle" fill="#1e3a8a">HQ</text>
                  </svg>
                `),
              }}
            />

            {selectedMarker === 'hq' && (
              <InfoWindow
                position={WASHBIZHUB_HQ}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="p-2 max-w-xs">
                  <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent" />
                    WashBizHub Headquarters
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    622 S River Rd, Lavaca, AR 72941
                  </p>
                  <Badge className="mb-2" variant="outline">Industry Expert</Badge>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => window.open(getDirectionsUrl(WASHBIZHUB_HQ), '_blank')}
                    className="w-full"
                  >
                    <Navigation className="w-3 h-3 mr-1" />
                    Get Directions
                  </Button>
                </div>
              </InfoWindow>
            )}
          </>
        )}
      </Map>
    </div>
    </APIProvider>
  );
}
