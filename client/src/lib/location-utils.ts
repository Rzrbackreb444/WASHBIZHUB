/**
 * Location Utilities
 * 
 * Client-side helpers for geolocation, distance calculations, and map interactions
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Get user's current location using browser geolocation API
 */
export function getUserLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
export function calculateDistance(
  from: Coordinates,
  to: Coordinates
): number {
  const R = 3959; // Earth radius in miles
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) *
    Math.cos(toRad(to.lat)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(miles: number): string {
  if (miles < 1) {
    return `${Math.round(miles * 5280)} ft`;
  }
  return `${miles.toFixed(1)} mi`;
}

/**
 * Get Google Maps directions URL
 */
export function getDirectionsUrl(
  destination: Coordinates | string,
  origin?: Coordinates | string
): string {
  const destParam = typeof destination === 'string' 
    ? destination 
    : `${destination.lat},${destination.lng}`;
  
  if (origin) {
    const originParam = typeof origin === 'string'
      ? origin
      : `${origin.lat},${origin.lng}`;
    return `https://www.google.com/maps/dir/${encodeURIComponent(originParam)}/${encodeURIComponent(destParam)}`;
  }
  
  return `https://www.google.com/maps/dir//${encodeURIComponent(destParam)}`;
}

/**
 * Save user location to localStorage
 */
export function saveUserLocation(coords: Coordinates): void {
  try {
    localStorage.setItem('userLocation', JSON.stringify(coords));
  } catch (e) {
    console.warn('Failed to save user location');
  }
}

/**
 * Get saved user location from localStorage
 */
export function getSavedUserLocation(): Coordinates | null {
  try {
    const saved = localStorage.getItem('userLocation');
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (e) {
    return null;
  }
}

/**
 * WashBizHub HQ coordinates
 */
export const WASHBIZHUB_HQ: Coordinates = {
  lat: 35.3362,
  lng: -94.1730,
};
