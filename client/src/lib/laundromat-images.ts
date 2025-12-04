// Laundromat Image Library with SEO-Optimized Alt Text
// Use these images across blog posts, pages, and features for better search ranking

// Neon & Branding
import neonLaundromatSign from "@assets/AdobeStock_111864759_1764813760837.jpeg";

// Equipment Action Shots
import clothesSpinningWasher from "@assets/AdobeStock_328444813_1764813760839.jpeg";
import colorfulClothesWashing from "@assets/AdobeStock_711286802_1764813760841.jpeg";
import washerDrumInterior from "@assets/AdobeStock_561067303_1764813760840.jpeg";

// Commercial Facilities
import modernCommercialLaundromat from "@assets/AdobeStock_507641449_1764813760840.jpeg";
import commercialWasherRow from "@assets/AdobeStock_790549884_1764813760841.jpeg";
import brightModernLaundromat from "@assets/AdobeStock_832897447_1764813760842.jpeg";

// Maintenance & Operations
import washerOverflowing from "@assets/AdobeStock_824530835_1764813760841.jpeg";

// Premium Dexter Equipment
import bigDexterLaundromat from "@assets/big_dexter_laundromat_1764813760842.jpg";
import dexterCornerColorful from "@assets/dexter_laundromat_corner_pic_1764813760843.jpeg";
import dexterCornerShot from "@assets/dexter_laundromat_corner_shot_1764813760843.jpg";
import dexterStockPhoto from "@assets/Dexter_Laundromat_Stock_photo_1764813760844.jpg";
import dexterLaundromat from "@assets/Dexter_Laundromat_1764813760844.jpg";

// Modern Design
import modernDesignLaundromat from "@assets/the_laundromat_modern_design_1764813760845.png";
import twinCitiesLaundromat from "@assets/Twin_Cities_Laundromat_1764813760845.jpg";

// WashBizHub Branded
import fundingMatcherGraphic from "@assets/WBH_FUNDING_MATCHER_SEARCH_IMAGE_1764813760846.png";

// Author/EEAT
import nickFounderPhoto from "@assets/Nick_1764813439401.jpg";

// Image categories with SEO-optimized alt text for different use cases
export const laundromatImages = {
  // Branding & Hero Images
  neonSign: {
    src: neonLaundromatSign,
    alt: "Glowing neon laundromat sign with red hanger icon and blue text - classic coin laundry signage",
    category: "branding",
    bestFor: ["blog headers", "homepage", "marketing"]
  },
  
  // Action & Operations Images
  clothesSpinning: {
    src: clothesSpinningWasher,
    alt: "Colorful clothes spinning inside commercial washer drum during wash cycle - laundromat operations",
    category: "operations",
    bestFor: ["operations blogs", "how-to guides", "equipment content"]
  },
  colorfulWash: {
    src: colorfulClothesWashing,
    alt: "Vibrant orange and blue clothes tumbling in washing machine with water droplets - professional laundry service",
    category: "operations",
    bestFor: ["homepage", "marketing", "customer-facing"]
  },
  drumInterior: {
    src: washerDrumInterior,
    alt: "Stainless steel commercial washer drum interior showing perforated metal design - laundry equipment detail",
    category: "equipment",
    bestFor: ["equipment blogs", "maintenance guides", "technical content"]
  },
  
  // Commercial Facility Images
  modernFacility: {
    src: modernCommercialLaundromat,
    alt: "Modern commercial laundromat with rows of stacked stainless steel washers and dryers - professional coin laundry facility",
    category: "facility",
    bestFor: ["buying guides", "investment content", "facility tours"]
  },
  washerRow: {
    src: commercialWasherRow,
    alt: "Row of commercial front-load washing machines in professional laundromat with warm lighting - coin laundry business",
    category: "facility",
    bestFor: ["listings", "business profiles", "investment"]
  },
  brightModern: {
    src: brightModernLaundromat,
    alt: "Bright modern laundromat with natural sunlight, wooden floors and commercial washing equipment - premium self-service laundry",
    category: "facility",
    bestFor: ["premium content", "design blogs", "aspirational"]
  },
  
  // Maintenance Content
  washerOverflow: {
    src: washerOverflowing,
    alt: "Water overflowing from commercial washing machine during malfunction - laundromat maintenance and repair",
    category: "maintenance",
    bestFor: ["maintenance blogs", "troubleshooting guides", "repair content"]
  },
  
  // Premium Dexter Equipment
  dexterPremium: {
    src: bigDexterLaundromat,
    alt: "Large Dexter laundromat with sunset mural, commercial washers and dryers in island configuration - premium coin laundry",
    category: "premium",
    bestFor: ["equipment showcases", "premium content", "success stories"]
  },
  dexterColorful: {
    src: dexterCornerColorful,
    alt: "Dexter Laundry branded commercial washers with colorful orange and blue decor - modern laundromat design",
    category: "premium",
    bestFor: ["branding content", "equipment blogs", "vendor features"]
  },
  dexterCorner: {
    src: dexterCornerShot,
    alt: "Commercial Dexter washing machines in action with clothes tumbling - industrial laundry equipment",
    category: "equipment",
    bestFor: ["equipment blogs", "operations content", "product features"]
  },
  dexterStock: {
    src: dexterStockPhoto,
    alt: "Professional Dexter laundromat interior with stacked washers, dryers and seating area - commercial laundry business",
    category: "facility",
    bestFor: ["business content", "facility planning", "layout guides"]
  },
  dexterRows: {
    src: dexterLaundromat,
    alt: "Rows of Dexter commercial washing machines in modern laundromat with blue accent trim - professional equipment",
    category: "equipment",
    bestFor: ["equipment comparisons", "facility showcases", "buying guides"]
  },
  
  // Modern Design
  modernDesign: {
    src: modernDesignLaundromat,
    alt: "Modern designer laundromat with spiral lighting, wooden accents and commercial washers - luxury self-service laundry",
    category: "premium",
    bestFor: ["design inspiration", "premium content", "renovation blogs"]
  },
  twinCities: {
    src: twinCitiesLaundromat,
    alt: "Tumble Fresh coin laundry with blue LED lighting and Giant Load machines - modern laundromat franchise",
    category: "facility",
    bestFor: ["franchise content", "branding examples", "business profiles"]
  },
  
  // WashBizHub Branded
  fundingMatcher: {
    src: fundingMatcherGraphic,
    alt: "WashBizHub Funding Matcher - Find funding for your commercial laundry business with laptop and financing icons",
    category: "washbizhub",
    bestFor: ["funding pages", "financial content", "SBA loans"]
  },
  
  // Founder/EEAT
  nickFounder: {
    src: nickFounderPhoto,
    alt: "Nick - Founder of WashBizHub, laundromat industry expert and CLEANBI creator",
    category: "eeat",
    bestFor: ["author bios", "about pages", "expert content"]
  }
};

// Get images by category for blog post featured images
export function getImagesByCategory(category: string) {
  return Object.entries(laundromatImages)
    .filter(([_, img]) => img.category === category)
    .map(([key, img]) => ({ key, ...img }));
}

// Get images best suited for a specific use case
export function getImagesForUseCase(useCase: string) {
  return Object.entries(laundromatImages)
    .filter(([_, img]) => img.bestFor.includes(useCase))
    .map(([key, img]) => ({ key, ...img }));
}

// Get a random image from a category for variety
export function getRandomImageFromCategory(category: string) {
  const images = getImagesByCategory(category);
  return images[Math.floor(Math.random() * images.length)];
}

// Default featured images by blog category
export const defaultBlogImages: Record<string, typeof laundromatImages[keyof typeof laundromatImages]> = {
  "Operations": laundromatImages.clothesSpinning,
  "Marketing": laundromatImages.neonSign,
  "Maintenance": laundromatImages.washerOverflow,
  "Finance": laundromatImages.fundingMatcher,
  "Growth": laundromatImages.dexterPremium,
  "Partners": laundromatImages.twinCities,
  "Equipment": laundromatImages.dexterRows,
  "Industry": laundromatImages.modernFacility,
  "Design": laundromatImages.modernDesign,
  "default": laundromatImages.colorfulWash
};

export default laundromatImages;
