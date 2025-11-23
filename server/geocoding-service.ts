/**
 * Geocoding Service
 * 
 * Handles address → lat/lng conversions using Google Geocoding API
 * with caching to minimize API calls
 * 
 * NOTE: Currently uses in-memory caching for development.
 * PRODUCTION: Migrate to Redis or persistent cache to preserve
 * quota across server restarts.
 */

interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  placeId: string;
  precision: 'rooftop' | 'range_interpolated' | 'geometric_center' | 'approximate';
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface GeocodeCache {
  [address: string]: GeocodeResult;
}

// In-memory cache (in production, use Redis)
const geocodeCache: GeocodeCache = {};

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  // Check cache first
  const cacheKey = address.toLowerCase().trim();
  if (geocodeCache[cacheKey]) {
    console.log(`📍 Geocode cache hit: ${address}`);
    return geocodeCache[cacheKey];
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('❌ GOOGLE_MAPS_API_KEY not configured');
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.warn(`⚠️ Geocoding failed for: ${address} - ${data.status}`);
      return null;
    }

    const result = data.results[0];
    const location = result.geometry.location;
    
    // Extract address components
    const components = result.address_components || [];
    let city, state, zipCode, country;
    
    for (const component of components) {
      if (component.types.includes('locality')) {
        city = component.long_name;
      }
      if (component.types.includes('administrative_area_level_1')) {
        state = component.short_name;
      }
      if (component.types.includes('postal_code')) {
        zipCode = component.long_name;
      }
      if (component.types.includes('country')) {
        country = component.short_name;
      }
    }

    const geocodeResult: GeocodeResult = {
      lat: location.lat,
      lng: location.lng,
      formattedAddress: result.formatted_address,
      placeId: result.place_id,
      precision: result.geometry.location_type === 'ROOFTOP' ? 'rooftop' :
                 result.geometry.location_type === 'RANGE_INTERPOLATED' ? 'range_interpolated' :
                 result.geometry.location_type === 'GEOMETRIC_CENTER' ? 'geometric_center' : 'approximate',
      city,
      state,
      zipCode,
      country,
    };

    // Cache result
    geocodeCache[cacheKey] = geocodeResult;
    console.log(`✅ Geocoded: ${address} → ${location.lat}, ${location.lng}`);

    return geocodeResult;
  } catch (error: any) {
    console.error('❌ Geocoding error:', error.message);
    return null;
  }
}

/**
 * Reverse geocode: lat/lng → address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('❌ GOOGLE_MAPS_API_KEY not configured');
    return null;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.warn(`⚠️ Reverse geocoding failed for: ${lat}, ${lng}`);
      return null;
    }

    const result = data.results[0];
    const location = result.geometry.location;

    return {
      lat: location.lat,
      lng: location.lng,
      formattedAddress: result.formatted_address,
      placeId: result.place_id,
      precision: 'rooftop',
    };
  } catch (error: any) {
    console.error('❌ Reverse geocoding error:', error.message);
    return null;
  }
}

/**
 * Calculate distance between two points using Google Distance Matrix API
 */
export async function calculateDistance(
  origin: { lat: number; lng: number } | string,
  destination: { lat: number; lng: number } | string
): Promise<{ distance: number; duration: number; distanceText: string; durationText: string } | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('❌ GOOGLE_MAPS_API_KEY not configured');
    return null;
  }

  try {
    const originParam = typeof origin === 'string' ? origin : `${origin.lat},${origin.lng}`;
    const destParam = typeof destination === 'string' ? destination : `${destination.lat},${destination.lng}`;
    
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(originParam)}&destinations=${encodeURIComponent(destParam)}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.rows || data.rows.length === 0) {
      console.warn(`⚠️ Distance calculation failed`);
      return null;
    }

    const element = data.rows[0].elements[0];
    if (element.status !== 'OK') {
      return null;
    }

    return {
      distance: element.distance.value, // meters
      duration: element.duration.value, // seconds
      distanceText: element.distance.text,
      durationText: element.duration.text,
    };
  } catch (error: any) {
    console.error('❌ Distance calculation error:', error.message);
    return null;
  }
}

// WashBizHub Headquarters
export const WASHBIZHUB_HQ = {
  address: '622 S River Rd, Lavaca, AR 72941',
  name: 'WashBizHub Headquarters',
  lat: 35.3362,
  lng: -94.1730,
  placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4', // Will be updated after geocoding
};
