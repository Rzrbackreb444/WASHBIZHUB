/**
 * GOOGLE AERIAL VIEW API SERVICE
 * 
 * Provides 3D aerial imagery and video for CLEANBI Explorer locations.
 * Uses Google's Aerial View API for cinematic location previews.
 * 
 * © 2025 WashBizHub. All Rights Reserved.
 */

import { AerialPreview } from "@shared/schema";
import { cachedFetch, CACHE_TTL } from "./cleanbi-cache-layer";

const AERIAL_VIEW_BASE = "https://aerialview.googleapis.com/v1";

export interface AerialViewResult {
  success: boolean;
  preview: AerialPreview | null;
  error?: string;
}

/**
 * Get aerial view imagery for a location
 * Falls back to satellite imagery if aerial not available
 */
export async function getAerialPreview(
  lat: number,
  lng: number,
  address: string
): Promise<AerialViewResult> {
  const cacheKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  
  try {
    return await cachedFetch<AerialViewResult>(
      "aerial",
      cacheKey,
      async () => {
        const apiKey = process.env.GOOGLE_AERIAL_VIEW_API_KEY || process.env.AERIAL_VIEW_API_KEY;
        
        if (!apiKey) {
          console.warn("⚠️ Aerial View API key not configured");
          return getFallbackPreview(lat, lng, "API key not configured");
        }

        try {
          const videoResult = await lookupAerialVideo(lat, lng, apiKey);
          
          if (videoResult.available) {
            console.log(`✅ Aerial 3D video available for: ${address}`);
            return {
              success: true,
              preview: {
                imageUrl: videoResult.thumbnailUrl || getSatelliteImageUrl(lat, lng),
                videoUrl: videoResult.videoUrl,
                thumbnailUrl: videoResult.thumbnailUrl,
                viewType: "aerial_3d",
                captureDate: videoResult.captureDate,
                resolution: "high",
                available: true,
              },
            };
          }
        } catch (aerialError: any) {
          console.warn("Aerial video not available, using satellite:", aerialError.message);
        }

        return {
          success: true,
          preview: {
            imageUrl: getSatelliteImageUrl(lat, lng),
            viewType: "satellite",
            resolution: "medium",
            available: true,
          },
        };
      },
      CACHE_TTL.GEOCODE
    );
  } catch (error: any) {
    console.error("❌ Aerial view error:", error.message);
    return getFallbackPreview(lat, lng, error.message);
  }
}

async function lookupAerialVideo(
  lat: number,
  lng: number,
  apiKey: string
): Promise<{
  available: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  captureDate?: string;
}> {
  const lookupUrl = `${AERIAL_VIEW_BASE}:lookupVideo?key=${apiKey}`;
  
  const response = await fetch(lookupUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      address: {
        lat,
        lng,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Aerial View API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (data.state === "ACTIVE" && data.uris) {
    return {
      available: true,
      videoUrl: data.uris.MP4_MEDIUM || data.uris.MP4_HIGH,
      thumbnailUrl: data.uris.IMAGE,
      captureDate: data.metadata?.captureDate,
    };
  }

  if (data.state === "PROCESSING") {
    return { available: false };
  }

  return { available: false };
}

function getSatelliteImageUrl(lat: number, lng: number): string {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.MAPS_STATIC_API_KEY;
  
  if (!apiKey) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=18&size=640x400&maptype=satellite`;
  }
  
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=18&size=640x400&maptype=satellite&key=${apiKey}`;
}

function getFallbackPreview(lat: number, lng: number, error: string): AerialViewResult {
  return {
    success: true,
    preview: {
      imageUrl: getSatelliteImageUrl(lat, lng),
      viewType: "satellite",
      resolution: "medium",
      available: true,
      error,
    },
  };
}

/**
 * Check if aerial 3D video is available for a location
 * Useful for showing/hiding the aerial preview feature
 */
export async function checkAerialAvailability(
  lat: number,
  lng: number
): Promise<boolean> {
  const apiKey = process.env.GOOGLE_AERIAL_VIEW_API_KEY || process.env.AERIAL_VIEW_API_KEY;
  
  if (!apiKey) return false;

  try {
    const result = await lookupAerialVideo(lat, lng, apiKey);
    return result.available;
  } catch {
    return false;
  }
}

/**
 * Get Street View image for a location
 * Complementary to aerial view
 */
export function getStreetViewUrl(lat: number, lng: number, heading?: number): string {
  const apiKey = process.env.STREET_VIEW_STATIC_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  
  const params = new URLSearchParams({
    size: "640x400",
    location: `${lat},${lng}`,
    heading: String(heading || 0),
    pitch: "10",
    fov: "90",
  });
  
  if (apiKey) {
    params.append("key", apiKey);
  }
  
  return `https://maps.googleapis.com/maps/api/streetview?${params.toString()}`;
}
