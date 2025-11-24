/**
 * ADDRESS TYPE DETECTOR
 * 
 * Determines if an address is:
 * - Business (has active Google Places listing)
 * - Residential (no business listing - home/apartment/land)
 * 
 * This is the CRITICAL router that enables "ANY address" scoring
 */

export type AddressType = 'business' | 'residential';

export interface AddressTypeResult {
  type: AddressType;
  businessData?: any; // If business, includes Google Places data
  confidence: number; // 0-100%
}

/**
 * Detect if address is business or residential
 */
export async function detectAddressType(
  address: string,
  businessName?: string
): Promise<AddressTypeResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY not configured');
  }

  try {
    // Try to find a business at this address
    const searchQuery = businessName 
      ? `${businessName} ${address}`
      : address;
    
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(searchQuery)}&inputtype=textquery&fields=place_id,name,formatted_address,types,business_status&key=${apiKey}`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    // No candidates found = likely residential
    if (!searchData.candidates || searchData.candidates.length === 0) {
      console.log(`🏠 No business found at: ${address} → RESIDENTIAL`);
      return {
        type: 'residential',
        confidence: 85
      };
    }
    
    const place = searchData.candidates[0];
    const types = place.types || [];
    
    // Check if it's actually a business (not just a location)
    const businessTypes = [
      'establishment',
      'point_of_interest',
      'store',
      'restaurant',
      'cafe',
      'bar',
      'gym',
      'spa',
      'salon',
      'laundry',
      'car_wash',
      'gas_station',
      'convenience_store',
      'shopping_mall',
      'pharmacy',
      'bank',
      'atm',
      'finance',
      'insurance_agency',
      'real_estate_agency',
      'travel_agency',
      'lodging',
      'hospital',
      'doctor',
      'dentist',
      'veterinary_care',
      'pet_store',
      'hardware_store',
      'home_goods_store',
      'furniture_store',
      'electronics_store',
      'clothing_store',
      'jewelry_store',
      'shoe_store',
      'book_store',
      'library',
      'movie_theater',
      'night_club',
      'casino',
      'amusement_park',
      'aquarium',
      'art_gallery',
      'museum',
      'stadium',
      'parking',
      'car_dealer',
      'car_rental',
      'car_repair',
      'moving_company',
      'storage',
      'transit_station',
      'airport',
      'bus_station',
      'train_station',
      'subway_station',
      'taxi_stand',
      'school',
      'university',
      'primary_school',
      'secondary_school',
      'church',
      'hindu_temple',
      'mosque',
      'synagogue',
      'cemetery',
      'funeral_home',
      'post_office',
      'courthouse',
      'embassy',
      'fire_station',
      'police',
      'city_hall',
      'local_government_office',
    ];
    
    const isBusinessType = types.some((t: string) => businessTypes.includes(t));
    
    // If it's marked as a business type AND has a business name
    if (isBusinessType && place.name) {
      console.log(`💼 Business found: ${place.name} at ${address} → BUSINESS`);
      
      // Get full details
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,user_ratings_total,reviews,opening_hours,geometry,types,photos,price_level,business_status&key=${apiKey}`;
      
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();
      
      if (detailsData.status === 'OK') {
        return {
          type: 'business',
          businessData: detailsData.result,
          confidence: 95
        };
      }
    }
    
    // Found a place but it's not clearly a business (might be residential building, park, etc.)
    console.log(`🏠 Place found but not a business: ${place.name || address} → RESIDENTIAL`);
    return {
      type: 'residential',
      confidence: 75
    };
    
  } catch (error: any) {
    console.error('❌ Address type detection error:', error.message);
    
    // Default to residential on error (safer assumption)
    return {
      type: 'residential',
      confidence: 50
    };
  }
}
