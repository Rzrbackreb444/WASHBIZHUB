/**
 * INDUSTRY CONFIGURATION FOR UNIVERSAL CLEANBI
 * 
 * Defines scoring weights and criteria for different business types.
 * This allows CLEANBI to work for ANY business while providing industry-specific insights.
 */

export interface IndustryConfig {
  name: string;
  displayName: string;
  googleTypes: string[]; // Google Places API types
  keywords: string[]; // Keywords to detect this industry
  scoringWeights: {
    footTraffic: number; // Max 30 points
    competition: number; // Max 20 points
    reviews: number; // Max 25 points
    location: number; // Max 15 points
    visibility: number; // Max 10 points
  };
  competitorRadius: number; // Meters
  recommendations: {
    excellent: string[];
    good: string[];
    fair: string[];
    poor: string[];
  };
}

export const INDUSTRY_CONFIGS: Record<string, IndustryConfig> = {
  // Laundromats (Original CLEANBI)
  laundromat: {
    name: 'laundromat',
    displayName: 'Laundromat',
    googleTypes: ['laundry', 'laundromat'],
    keywords: ['laundromat', 'laundry', 'coin laundry', 'wash & fold', 'launderette', 'washeria'],
    scoringWeights: {
      footTraffic: 30,
      competition: 20,
      reviews: 25,
      location: 15,
      visibility: 10,
    },
    competitorRadius: 8000, // 5 miles
    recommendations: {
      excellent: [
        'Prime location with high foot traffic',
        'Strong market position with limited competition',
        'Excellent customer reviews indicate quality service',
        'High visibility ensures consistent customer flow',
      ],
      good: [
        'Solid location with good customer base',
        'Moderate competition - opportunity to differentiate',
        'Positive reviews show customer satisfaction',
        'Consider marketing to increase visibility',
      ],
      fair: [
        'Location has potential but needs improvement',
        'High competition requires strong differentiation',
        'Reviews indicate service quality issues to address',
        'Marketing investment needed for visibility',
      ],
      poor: [
        'Location challenges may limit customer acquisition',
        'Saturated market requires significant differentiation',
        'Review issues need immediate attention',
        'Low visibility requires major marketing overhaul',
      ],
    },
  },

  // Car Washes (WASHBI)
  car_wash: {
    name: 'car_wash',
    displayName: 'Car Wash',
    googleTypes: ['car_wash'],
    keywords: ['car wash', 'auto wash', 'detailing', 'hand wash', 'touchless'],
    scoringWeights: {
      footTraffic: 25, // Less important - cars drive by
      competition: 25, // Very important - market saturation
      reviews: 20,
      location: 20, // Critical - visibility from main roads
      visibility: 10,
    },
    competitorRadius: 5000, // 3 miles
    recommendations: {
      excellent: [
        'High-traffic location with excellent road visibility',
        'Limited competition in immediate area',
        'Strong reviews indicate quality service',
        'Prime location for drive-by customers',
      ],
      good: [
        'Good traffic flow and visibility',
        'Manageable competition level',
        'Positive customer feedback',
        'Consider membership programs to build loyalty',
      ],
      fair: [
        'Moderate traffic - marketing needed',
        'Competitive market requires differentiation',
        'Service quality improvements needed',
        'Visibility enhancements recommended',
      ],
      poor: [
        'Low traffic location limits potential',
        'Market saturation is significant challenge',
        'Customer satisfaction issues need addressing',
        'Major visibility and marketing investment required',
      ],
    },
  },

  // Restaurants
  restaurant: {
    name: 'restaurant',
    displayName: 'Restaurant',
    googleTypes: ['restaurant', 'food', 'meal_takeaway', 'cafe'],
    keywords: ['restaurant', 'cafe', 'bistro', 'diner', 'eatery', 'grill'],
    scoringWeights: {
      footTraffic: 25,
      competition: 15, // Less critical - customers seek variety
      reviews: 35, // Critical for restaurants
      location: 15,
      visibility: 10,
    },
    competitorRadius: 3000, // 2 miles
    recommendations: {
      excellent: [
        'High foot traffic location ideal for restaurant',
        'Outstanding reviews drive customer acquisition',
        'Excellent visibility from street',
        'Strong market position with loyal customer base',
      ],
      good: [
        'Good location with steady customer flow',
        'Positive reviews indicate quality food/service',
        'Visible location helps attract walk-ins',
        'Consider social media marketing for growth',
      ],
      fair: [
        'Location has potential with marketing',
        'Reviews show room for improvement',
        'Visibility could be enhanced',
        'Focus on menu quality and service',
      ],
      poor: [
        'Foot traffic challenges limit growth',
        'Review issues require immediate attention',
        'Low visibility needs major improvement',
        'Consider repositioning or concept change',
      ],
    },
  },

  // Gas Stations / Convenience Stores
  gas_station: {
    name: 'gas_station',
    displayName: 'Gas Station',
    googleTypes: ['gas_station', 'convenience_store'],
    keywords: ['gas station', 'fuel', 'petrol', 'convenience store'],
    scoringWeights: {
      footTraffic: 20,
      competition: 25, // Critical - price competition
      reviews: 15,
      location: 30, // Most critical - highway access
      visibility: 10,
    },
    competitorRadius: 5000,
    recommendations: {
      excellent: [
        'Prime highway location with easy access',
        'Limited direct competition in area',
        'High traffic volume ensures strong sales',
        'Excellent visibility from major roads',
      ],
      good: [
        'Good location with steady traffic',
        'Manageable competition level',
        'Positive customer reviews',
        'Consider adding services to increase margin',
      ],
      fair: [
        'Location has potential with improvements',
        'Price competition requires focus on service',
        'Traffic flow could be optimized',
        'Consider loyalty programs',
      ],
      poor: [
        'Location challenges limit customer base',
        'High competition pressure on margins',
        'Low traffic requires major intervention',
        'Visibility improvements critical',
      ],
    },
  },

  // Retail Stores
  retail: {
    name: 'retail',
    displayName: 'Retail Store',
    googleTypes: ['store', 'shopping_mall', 'clothing_store', 'shoe_store'],
    keywords: ['retail', 'store', 'shop', 'boutique'],
    scoringWeights: {
      footTraffic: 30,
      competition: 20,
      reviews: 20,
      location: 20,
      visibility: 10,
    },
    competitorRadius: 3000,
    recommendations: {
      excellent: [
        'High-traffic retail location',
        'Strong customer reviews drive repeat business',
        'Excellent visibility and accessibility',
        'Good market position',
      ],
      good: [
        'Solid retail location with potential',
        'Positive reviews indicate customer satisfaction',
        'Good visibility from main streets',
        'Consider e-commerce integration',
      ],
      fair: [
        'Location needs traffic improvement',
        'Competition requires unique positioning',
        'Reviews show service improvement needed',
        'Marketing and promotion recommended',
      ],
      poor: [
        'Low foot traffic is major challenge',
        'Market saturation limits growth',
        'Customer experience needs overhaul',
        'Consider relocation or pivot',
      ],
    },
  },

  // Gyms / Fitness Centers
  gym: {
    name: 'gym',
    displayName: 'Gym / Fitness Center',
    googleTypes: ['gym', 'health'],
    keywords: ['gym', 'fitness', 'health club', 'workout'],
    scoringWeights: {
      footTraffic: 25,
      competition: 25,
      reviews: 25,
      location: 15,
      visibility: 10,
    },
    competitorRadius: 5000,
    recommendations: {
      excellent: [
        'Great location with strong membership potential',
        'Excellent reviews indicate member satisfaction',
        'Limited direct competition',
        'High visibility drives walk-in inquiries',
      ],
      good: [
        'Good location for fitness center',
        'Positive member feedback',
        'Manageable competition',
        'Consider specialty classes for differentiation',
      ],
      fair: [
        'Location has potential with marketing',
        'Competition requires unique value proposition',
        'Member experience needs improvement',
        'Consider personal training services',
      ],
      poor: [
        'Location challenges limit membership growth',
        'Market saturation is significant',
        'Member satisfaction issues critical',
        'Major repositioning needed',
      ],
    },
  },

  // Default/Generic Business
  default: {
    name: 'default',
    displayName: 'Business',
    googleTypes: ['establishment', 'point_of_interest'],
    keywords: [],
    scoringWeights: {
      footTraffic: 25,
      competition: 20,
      reviews: 25,
      location: 20,
      visibility: 10,
    },
    competitorRadius: 5000,
    recommendations: {
      excellent: [
        'Strong location with high visibility',
        'Excellent customer reviews',
        'Good market position',
        'High traffic area',
      ],
      good: [
        'Solid location with potential',
        'Positive customer feedback',
        'Manageable competition',
        'Good visibility',
      ],
      fair: [
        'Location has improvement potential',
        'Competition requires differentiation',
        'Service quality needs attention',
        'Marketing investment recommended',
      ],
      poor: [
        'Location presents challenges',
        'Market conditions difficult',
        'Customer satisfaction needs work',
        'Major improvements required',
      ],
    },
  },
};

/**
 * Detect industry from business types or name
 */
export function detectIndustry(googleTypes: string[], businessName: string = ''): string {
  const nameLower = businessName.toLowerCase();
  
  // Check each industry config
  for (const [industryKey, config] of Object.entries(INDUSTRY_CONFIGS)) {
    if (industryKey === 'default') continue;
    
    // Check Google types
    if (googleTypes.some(type => config.googleTypes.includes(type))) {
      return industryKey;
    }
    
    // Check keywords in business name
    if (config.keywords.some(keyword => nameLower.includes(keyword))) {
      return industryKey;
    }
  }
  
  return 'default';
}

/**
 * Get industry config (with fallback to default)
 */
export function getIndustryConfig(industry: string): IndustryConfig {
  return INDUSTRY_CONFIGS[industry] || INDUSTRY_CONFIGS.default;
}
