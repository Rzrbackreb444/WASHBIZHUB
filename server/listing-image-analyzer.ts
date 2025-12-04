import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing required GEMINI_API_KEY");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export interface ExtractedListingData {
  businessType: "laundromat" | "car_wash" | "restaurant" | "dry_cleaner" | "other";
  businessTypeOther?: string;
  title: string;
  tagline: string;
  
  city: string | null;
  region: string | null;
  country: string;
  
  askingPrice: string | null;
  currency: string;
  netIncome: string | null;
  grossRevenue: string | null;
  
  includesRealEstate: boolean;
  ownerFinancing: boolean;
  absenteeRun: boolean;
  
  features: string[];
  equipmentBrands: string[];
  
  brokerName: string | null;
  brokerCompany: string | null;
  brokerPhone: string | null;
  brokerEmail: string | null;
  
  externalListingId: string | null;
  
  confidence: number;
  rawNotes: string;
}

export async function analyzeListingImage(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<ExtractedListingData> {
  const prompt = `You are an expert business listing analyzer. Analyze this broker flyer/advertisement image and extract all relevant business listing information.

This could be a listing for ANY type of business including: laundromat, car wash, restaurant, dry cleaner, retail store, gas station, convenience store, franchise, etc.

Extract the following data:

1. Business Type: What type of business is this? (laundromat, car_wash, restaurant, dry_cleaner, or other)
2. Title: Create a compelling listing title based on the content
3. Tagline: Write a 50-100 character summary highlighting key selling points

LOCATION:
4. City: The city name
5. Region/State: The state, province, or region
6. Country: Default to "US" if appears to be United States

FINANCIALS:
7. Asking Price: The listed price (numbers only)
8. Currency: USD, CAD, EUR, etc.
9. Net Income: Annual net income/profit if mentioned
10. Gross Revenue: Annual gross revenue if mentioned

FEATURES:
11. Includes Real Estate: Does the sale include real estate/property?
12. Owner Financing: Is owner financing available?
13. Absentee Run: Is this described as absentee-run or semi-absentee?
14. Features: List of business features/highlights mentioned
15. Equipment Brands: Any equipment brands mentioned (Speed Queen, Dexter, etc.)

BROKER INFO:
16. Broker Name: Full name of the broker/agent
17. Broker Company: Company or brokerage name
18. Broker Phone: Phone number
19. Broker Email: Email address

OTHER:
20. External Listing ID: Any listing ID or reference number shown

Return ONLY valid JSON in this exact format:
{
  "businessType": "laundromat" | "car_wash" | "restaurant" | "dry_cleaner" | "other",
  "businessTypeOther": "string if businessType is other, null otherwise",
  "title": "string",
  "tagline": "string (50-100 chars)",
  
  "city": "string" or null,
  "region": "string" or null,
  "country": "US",
  
  "askingPrice": "numeric string without $ or commas" or null,
  "currency": "USD",
  "netIncome": "numeric string" or null,
  "grossRevenue": "numeric string" or null,
  
  "includesRealEstate": boolean,
  "ownerFinancing": boolean,
  "absenteeRun": boolean,
  
  "features": ["array", "of", "features"],
  "equipmentBrands": ["Speed Queen", "etc"],
  
  "brokerName": "string" or null,
  "brokerCompany": "string" or null,
  "brokerPhone": "string" or null,
  "brokerEmail": "string" or null,
  
  "externalListingId": "string" or null,
  
  "confidence": 0.0 to 1.0,
  "rawNotes": "Any additional details or notes from the image"
}

Important:
- Extract ALL visible text and data from the image
- For prices, remove $ signs and commas (e.g., "785000" not "$785,000")
- If a value cannot be determined, use null
- The confidence score should reflect clarity of the image and completeness of data
- For tagline, focus on the most compelling selling points (net income, location, equipment)`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType,
          data: imageBase64
        }
      }
    ]);
    
    const response = result.response;
    const text = response.text() || "";
    
    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                        text.match(/```\n([\s\S]*?)\n```/) || 
                        [null, text];
      const jsonText = jsonMatch[1] || text;
      const parsed = JSON.parse(jsonText.trim());
      
      return {
        businessType: parsed.businessType || "laundromat",
        businessTypeOther: parsed.businessTypeOther || undefined,
        title: parsed.title || "Business For Sale",
        tagline: parsed.tagline || "",
        
        city: parsed.city || null,
        region: parsed.region || null,
        country: parsed.country || "US",
        
        askingPrice: parsed.askingPrice || null,
        currency: parsed.currency || "USD",
        netIncome: parsed.netIncome || null,
        grossRevenue: parsed.grossRevenue || null,
        
        includesRealEstate: parsed.includesRealEstate || false,
        ownerFinancing: parsed.ownerFinancing || false,
        absenteeRun: parsed.absenteeRun || false,
        
        features: parsed.features || [],
        equipmentBrands: parsed.equipmentBrands || [],
        
        brokerName: parsed.brokerName || null,
        brokerCompany: parsed.brokerCompany || null,
        brokerPhone: parsed.brokerPhone || null,
        brokerEmail: parsed.brokerEmail || null,
        
        externalListingId: parsed.externalListingId || null,
        
        confidence: parsed.confidence || 0.5,
        rawNotes: parsed.rawNotes || ""
      };
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      console.error("Raw response:", text);
      throw new Error("Failed to parse listing data from image. Please try a clearer image.");
    }
  } catch (error: any) {
    console.error("Gemini API error:", error);
    throw new Error(error.message || "Failed to analyze image");
  }
}
