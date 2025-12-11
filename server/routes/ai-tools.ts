import { Router } from "express";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY not configured - AI tools disabled");
}

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, PNG, GIF, WebP) are allowed"));
    }
  },
});

export interface UtilityBillScanResult {
  success: boolean;
  data: {
    provider: string | null;
    accountNumber: string | null;
    serviceAddress: string | null;
    billingPeriod: {
      start: string | null;
      end: string | null;
    };
    dueDate: string | null;
    totalAmountDue: number | null;
    previousBalance: number | null;
    payments: number | null;
    currentCharges: number | null;
    usage: {
      amount: number | null;
      unit: string | null;
      type: "electric" | "gas" | "water" | "unknown";
    };
    rate: {
      perUnit: number | null;
      unit: string | null;
    };
    additionalFees: Array<{
      name: string;
      amount: number;
    }>;
    rawExtractedText: string;
  };
  confidence: number;
  error?: string;
}

async function analyzeUtilityBillImage(imageBase64: string, mimeType: string): Promise<UtilityBillScanResult> {
  if (!genAI) {
    throw new Error("Gemini AI is not configured");
  }

  const prompt = `You are an expert at extracting data from utility bills. Analyze this utility bill image and extract all relevant information.

Extract the following details:
1. **Provider/Company Name**: The utility company name
2. **Account Number**: The customer account or service number
3. **Service Address**: The address where service is provided
4. **Billing Period**: Start and end dates of the billing cycle
5. **Due Date**: When payment is due
6. **Total Amount Due**: The total payment required
7. **Previous Balance**: Any balance carried over from prior bills
8. **Payments Received**: Payments applied since last bill
9. **Current Charges**: New charges for this billing period
10. **Usage**: How much was used (kWh for electric, therms/CCF for gas, gallons/cubic feet for water)
11. **Rate**: The rate per unit charged
12. **Utility Type**: Is this electric, gas, water, or combination
13. **Additional Fees**: Any taxes, surcharges, or fees listed separately

Return ONLY valid JSON in this exact format:
{
  "provider": "Company Name" or null,
  "accountNumber": "12345-67890" or null,
  "serviceAddress": "123 Main St, City, ST 12345" or null,
  "billingPeriod": {
    "start": "2024-11-01" or null,
    "end": "2024-11-30" or null
  },
  "dueDate": "2024-12-15" or null,
  "totalAmountDue": 185.47 or null,
  "previousBalance": 0 or null,
  "payments": 0 or null,
  "currentCharges": 185.47 or null,
  "usage": {
    "amount": 850 or null,
    "unit": "kWh" or "therms" or "gallons" or "CCF" or null,
    "type": "electric" or "gas" or "water" or "unknown"
  },
  "rate": {
    "perUnit": 0.12 or null,
    "unit": "$/kWh" or "$/therm" or "$/gallon" or null
  },
  "additionalFees": [
    {"name": "State Tax", "amount": 5.23},
    {"name": "Delivery Charge", "amount": 12.50}
  ],
  "rawExtractedText": "All text you can read from the bill",
  "confidence": 0.85
}

Be precise with numbers - extract exact values shown on the bill.
If you cannot read or find certain values, use null.
Always include confidence score (0-1) based on image quality and data clarity.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType,
          data: imageBase64,
        },
      },
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
        success: true,
        data: {
          provider: parsed.provider || null,
          accountNumber: parsed.accountNumber || null,
          serviceAddress: parsed.serviceAddress || null,
          billingPeriod: {
            start: parsed.billingPeriod?.start || null,
            end: parsed.billingPeriod?.end || null,
          },
          dueDate: parsed.dueDate || null,
          totalAmountDue: typeof parsed.totalAmountDue === "number" ? parsed.totalAmountDue : null,
          previousBalance: typeof parsed.previousBalance === "number" ? parsed.previousBalance : null,
          payments: typeof parsed.payments === "number" ? parsed.payments : null,
          currentCharges: typeof parsed.currentCharges === "number" ? parsed.currentCharges : null,
          usage: {
            amount: typeof parsed.usage?.amount === "number" ? parsed.usage.amount : null,
            unit: parsed.usage?.unit || null,
            type: parsed.usage?.type || "unknown",
          },
          rate: {
            perUnit: typeof parsed.rate?.perUnit === "number" ? parsed.rate.perUnit : null,
            unit: parsed.rate?.unit || null,
          },
          additionalFees: Array.isArray(parsed.additionalFees) ? parsed.additionalFees : [],
          rawExtractedText: parsed.rawExtractedText || text,
        },
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
      };
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      return {
        success: true,
        data: {
          provider: null,
          accountNumber: null,
          serviceAddress: null,
          billingPeriod: { start: null, end: null },
          dueDate: null,
          totalAmountDue: null,
          previousBalance: null,
          payments: null,
          currentCharges: null,
          usage: { amount: null, unit: null, type: "unknown" },
          rate: { perUnit: null, unit: null },
          additionalFees: [],
          rawExtractedText: text,
        },
        confidence: 0.3,
        error: "Could not parse structured data from image",
      };
    }
  } catch (error) {
    console.error("Gemini Vision API error:", error);
    throw error;
  }
}

router.post("/scan-utility-bill", upload.single("image"), async (req, res) => {
  try {
    if (!genAI) {
      return res.status(503).json({
        success: false,
        error: "AI service is not configured. Please contact support.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No image file provided. Please upload a utility bill image.",
      });
    }

    const imageBase64 = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;

    const result = await analyzeUtilityBillImage(imageBase64, mimeType);

    return res.json(result);
  } catch (error: any) {
    console.error("Utility bill scan error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze utility bill. Please try again.",
    });
  }
});

export interface LocationScoutResult {
  success: boolean;
  data: {
    address: string;
    coordinates: { lat: number; lng: number } | null;
    radius: number;
    analysisType: string;
    locationProfile: {
      neighborhood: string;
      areaType: "urban" | "suburban" | "rural";
      walkabilityEstimate: "high" | "medium" | "low";
      parkingAvailability: "abundant" | "adequate" | "limited";
      visibility: "high" | "medium" | "low";
      accessibilityScore: number;
    };
    demographics: {
      populationDensity: {
        estimate: "high" | "medium" | "low";
        description: string;
      };
      renterRatio: {
        estimate: number;
        assessment: string;
      };
      medianIncome: {
        bracket: "low" | "moderate" | "middle" | "upper-middle" | "high";
        idealForLaundromat: boolean;
        rationale: string;
      };
      householdSize: {
        average: number;
        implication: string;
      };
    };
    competition: {
      estimatedCompetitors: number;
      competitionLevel: "low" | "moderate" | "high" | "saturated";
      nearbyLaundromats: Array<{
        type: string;
        distance: string;
        threat: "low" | "medium" | "high";
      }>;
      marketGap: string;
    };
    traffic: {
      pattern: "heavy" | "moderate" | "light";
      peakTimes: string[];
      footTraffic: "high" | "medium" | "low";
      vehicleAccess: "excellent" | "good" | "fair" | "poor";
    };
    opportunity: {
      score: number;
      grade: "A" | "B" | "C" | "Needs Work";
      strengths: string[];
      weaknesses: string[];
      verdict: string;
    };
    recommendations: Array<{
      category: string;
      action: string;
      priority: "high" | "medium" | "low";
      estimatedImpact: string;
    }>;
  };
  confidence: number;
  error?: string;
}

function getGrade(score: number): "A" | "B" | "C" | "Needs Work" {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  return "Needs Work";
}

async function analyzeLocationPotential(
  address: string,
  radius: number,
  analysisType: string,
  coordinates?: { lat: number; lng: number }
): Promise<LocationScoutResult> {
  if (!genAI) {
    throw new Error("Gemini AI is not configured");
  }

  const prompt = `You are an expert laundromat site selection analyst with 20+ years of experience in commercial real estate and laundromat operations. Analyze this location for laundromat potential.

LOCATION TO ANALYZE:
Address: ${address}
Analysis Radius: ${radius} miles
Analysis Type: ${analysisType}
${coordinates ? `Coordinates: ${coordinates.lat}, ${coordinates.lng}` : ""}

Based on your knowledge of this area and general demographics, provide a comprehensive analysis:

1. **Location Profile**: Describe the neighborhood type, walkability, parking, visibility, and accessibility (0-100 score)

2. **Demographics**: 
   - Population density estimate (high/medium/low)
   - Renter vs owner ratio estimate (% renters, typical laundromat wants 40%+ renters)
   - Median income bracket (ideal is $35K-$65K for laundromat customers)
   - Average household size

3. **Competition Analysis**:
   - Estimate number of laundromats within radius
   - Competition level assessment
   - Market gaps/opportunities

4. **Traffic Patterns**:
   - Vehicle and foot traffic assessment
   - Peak times for the area
   - Access quality

5. **Opportunity Score**: 0-100 score with grade (A=85+, B=70-84, C=55-69, Needs Work=<55)
   - List 3-5 strengths
   - List 2-3 weaknesses
   - Overall verdict

6. **Recommendations**: 3-5 actionable recommendations with priority level

Return ONLY valid JSON in this exact format:
{
  "address": "${address}",
  "coordinates": ${coordinates ? `{"lat": ${coordinates.lat}, "lng": ${coordinates.lng}}` : "null"},
  "radius": ${radius},
  "analysisType": "${analysisType}",
  "locationProfile": {
    "neighborhood": "Description of the area",
    "areaType": "urban" | "suburban" | "rural",
    "walkabilityEstimate": "high" | "medium" | "low",
    "parkingAvailability": "abundant" | "adequate" | "limited",
    "visibility": "high" | "medium" | "low",
    "accessibilityScore": 75
  },
  "demographics": {
    "populationDensity": {
      "estimate": "high" | "medium" | "low",
      "description": "Detailed description"
    },
    "renterRatio": {
      "estimate": 55,
      "assessment": "Assessment of renter population"
    },
    "medianIncome": {
      "bracket": "moderate" | "middle" | "upper-middle",
      "idealForLaundromat": true,
      "rationale": "Why this income level is good/bad"
    },
    "householdSize": {
      "average": 2.8,
      "implication": "What this means for laundry demand"
    }
  },
  "competition": {
    "estimatedCompetitors": 3,
    "competitionLevel": "moderate",
    "nearbyLaundromats": [
      {"type": "Self-service", "distance": "0.5 miles", "threat": "medium"}
    ],
    "marketGap": "Description of opportunity"
  },
  "traffic": {
    "pattern": "heavy" | "moderate" | "light",
    "peakTimes": ["Weekday evenings", "Saturday mornings"],
    "footTraffic": "high" | "medium" | "low",
    "vehicleAccess": "excellent" | "good" | "fair" | "poor"
  },
  "opportunity": {
    "score": 78,
    "grade": "B",
    "strengths": ["High renter population", "Good visibility"],
    "weaknesses": ["Limited parking", "Moderate competition"],
    "verdict": "Overall assessment of the opportunity"
  },
  "recommendations": [
    {
      "category": "Marketing",
      "action": "Specific recommendation",
      "priority": "high" | "medium" | "low",
      "estimatedImpact": "Expected outcome"
    }
  ],
  "confidence": 0.85
}

Be realistic and data-driven in your analysis. Use your knowledge of the area to provide accurate estimates.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text() || "";

    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                        text.match(/```\n([\s\S]*?)\n```/) || 
                        [null, text];
      const jsonText = jsonMatch[1] || text;
      const parsed = JSON.parse(jsonText.trim());

      const score = parsed.opportunity?.score || 50;
      const grade = getGrade(score);

      return {
        success: true,
        data: {
          address: parsed.address || address,
          coordinates: parsed.coordinates || coordinates || null,
          radius: parsed.radius || radius,
          analysisType: parsed.analysisType || analysisType,
          locationProfile: {
            neighborhood: parsed.locationProfile?.neighborhood || "Analysis pending",
            areaType: parsed.locationProfile?.areaType || "suburban",
            walkabilityEstimate: parsed.locationProfile?.walkabilityEstimate || "medium",
            parkingAvailability: parsed.locationProfile?.parkingAvailability || "adequate",
            visibility: parsed.locationProfile?.visibility || "medium",
            accessibilityScore: parsed.locationProfile?.accessibilityScore || 70,
          },
          demographics: {
            populationDensity: {
              estimate: parsed.demographics?.populationDensity?.estimate || "medium",
              description: parsed.demographics?.populationDensity?.description || "Moderate population density",
            },
            renterRatio: {
              estimate: parsed.demographics?.renterRatio?.estimate || 45,
              assessment: parsed.demographics?.renterRatio?.assessment || "Moderate renter population",
            },
            medianIncome: {
              bracket: parsed.demographics?.medianIncome?.bracket || "middle",
              idealForLaundromat: parsed.demographics?.medianIncome?.idealForLaundromat ?? true,
              rationale: parsed.demographics?.medianIncome?.rationale || "Income level analysis",
            },
            householdSize: {
              average: parsed.demographics?.householdSize?.average || 2.5,
              implication: parsed.demographics?.householdSize?.implication || "Standard household size",
            },
          },
          competition: {
            estimatedCompetitors: parsed.competition?.estimatedCompetitors || 2,
            competitionLevel: parsed.competition?.competitionLevel || "moderate",
            nearbyLaundromats: Array.isArray(parsed.competition?.nearbyLaundromats) 
              ? parsed.competition.nearbyLaundromats 
              : [],
            marketGap: parsed.competition?.marketGap || "Market opportunity exists",
          },
          traffic: {
            pattern: parsed.traffic?.pattern || "moderate",
            peakTimes: Array.isArray(parsed.traffic?.peakTimes) 
              ? parsed.traffic.peakTimes 
              : ["Weekday evenings", "Weekends"],
            footTraffic: parsed.traffic?.footTraffic || "medium",
            vehicleAccess: parsed.traffic?.vehicleAccess || "good",
          },
          opportunity: {
            score,
            grade,
            strengths: Array.isArray(parsed.opportunity?.strengths) 
              ? parsed.opportunity.strengths 
              : ["Location potential identified"],
            weaknesses: Array.isArray(parsed.opportunity?.weaknesses) 
              ? parsed.opportunity.weaknesses 
              : ["Further analysis recommended"],
            verdict: parsed.opportunity?.verdict || "Location shows potential for laundromat business",
          },
          recommendations: Array.isArray(parsed.recommendations) 
            ? parsed.recommendations 
            : [{
                category: "Due Diligence",
                action: "Conduct on-site visit to verify analysis",
                priority: "high" as const,
                estimatedImpact: "Confirm location viability"
              }],
        },
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.7,
      };
    } catch (parseError) {
      console.error("Failed to parse Gemini location analysis response:", parseError);
      return {
        success: true,
        data: {
          address,
          coordinates: coordinates || null,
          radius,
          analysisType,
          locationProfile: {
            neighborhood: "Unable to fully analyze - partial data available",
            areaType: "suburban",
            walkabilityEstimate: "medium",
            parkingAvailability: "adequate",
            visibility: "medium",
            accessibilityScore: 65,
          },
          demographics: {
            populationDensity: { estimate: "medium", description: "Moderate population density" },
            renterRatio: { estimate: 45, assessment: "Average renter population" },
            medianIncome: { bracket: "middle", idealForLaundromat: true, rationale: "Standard income demographics" },
            householdSize: { average: 2.5, implication: "Typical household size" },
          },
          competition: {
            estimatedCompetitors: 2,
            competitionLevel: "moderate",
            nearbyLaundromats: [],
            marketGap: "Further analysis recommended",
          },
          traffic: {
            pattern: "moderate",
            peakTimes: ["Weekday evenings", "Weekends"],
            footTraffic: "medium",
            vehicleAccess: "good",
          },
          opportunity: {
            score: 60,
            grade: "C",
            strengths: ["Location under analysis"],
            weaknesses: ["Incomplete data - verify on site"],
            verdict: "Preliminary analysis suggests potential - on-site verification recommended",
          },
          recommendations: [{
            category: "Verification",
            action: "Visit location in person to complete analysis",
            priority: "high",
            estimatedImpact: "Accurate assessment of opportunity"
          }],
        },
        confidence: 0.4,
        error: "Partial analysis completed - some data could not be parsed",
      };
    }
  } catch (error) {
    console.error("Gemini location analysis error:", error);
    throw error;
  }
}

router.post("/scout-location", async (req, res) => {
  try {
    if (!genAI) {
      return res.status(503).json({
        success: false,
        error: "AI service is not configured. Please contact support.",
      });
    }

    const { address, coordinates, radius = 1, analysisType = "comprehensive" } = req.body;

    if (!address && !coordinates) {
      return res.status(400).json({
        success: false,
        error: "Please provide an address or coordinates to analyze.",
      });
    }

    const radiusNum = Math.min(Math.max(parseFloat(radius) || 1, 0.5), 5);
    
    const result = await analyzeLocationPotential(
      address || `${coordinates.lat}, ${coordinates.lng}`,
      radiusNum,
      analysisType,
      coordinates
    );

    return res.json(result);
  } catch (error: any) {
    console.error("Location scout error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze location. Please try again.",
    });
  }
});

// ============================================================================
// EQUIPMENT PHOTO APPRAISER - AI-powered equipment valuation and analysis
// ============================================================================

export interface EquipmentAppraisalResult {
  success: boolean;
  data: {
    equipment: {
      type: "washer" | "dryer" | "washer-extractor" | "stack" | "ironer" | "folder" | "payment-system" | "unknown";
      brand: string | null;
      model: string | null;
      serialNumber: string | null;
      capacity: string | null;
      fuelType: "electric" | "gas" | "steam" | "unknown";
    };
    condition: {
      rating: "Excellent" | "Good" | "Fair" | "Poor";
      score: number;
      overallNotes: string;
      cosmetic: {
        rating: "Excellent" | "Good" | "Fair" | "Poor";
        notes: string;
      };
      mechanical: {
        rating: "Excellent" | "Good" | "Fair" | "Poor";
        notes: string;
      };
      wearIndicators: string[];
    };
    valuation: {
      estimatedMarketValue: {
        low: number;
        mid: number;
        high: number;
      };
      originalMSRP: number | null;
      depreciationPercent: number;
      pricePerPound: number | null;
      comparableListings: string;
    };
    age: {
      estimatedYears: number;
      estimatedManufactureYear: number | null;
      ageCategory: "New" | "Like New" | "Mid-Life" | "Mature" | "End of Life";
      ageNotes: string;
    };
    lifespan: {
      expectedTotalYears: number;
      remainingYears: number;
      endOfLifeYear: number | null;
      lifespanNotes: string;
    };
    maintenance: {
      urgentItems: string[];
      recommendedItems: string[];
      preventiveSchedule: string[];
      estimatedMaintenanceCost: number | null;
    };
    recommendations: {
      keepOrReplace: "Keep" | "Consider Replacing" | "Replace Soon" | "Replace Immediately";
      reasoning: string;
      upgradeOptions: Array<{
        option: string;
        estimatedCost: number;
        benefit: string;
      }>;
      replacementSuggestions: Array<{
        brand: string;
        model: string;
        estimatedCost: number;
        features: string;
      }>;
    };
  };
  confidence: number;
  error?: string;
}

async function appraiseEquipmentImage(
  imageBase64: string,
  mimeType: string
): Promise<EquipmentAppraisalResult> {
  if (!genAI) {
    throw new Error("Gemini AI is not configured");
  }

  const currentYear = new Date().getFullYear();

  const prompt = `You are an expert commercial laundry equipment appraiser with 25+ years of experience. Analyze this image of laundry equipment and provide a comprehensive appraisal.

Your expertise includes:
- All major brands: Speed Queen, Dexter, Continental/Girbau, Huebsch, Maytag Commercial, Wascomat, Milnor, UniMac, ADC, IPSO
- Equipment types: Front-load washers, top-load washers, tumble dryers, stack units, washer-extractors, flatwork ironers, folders
- Market valuations based on age, condition, brand, and features

Analyze the equipment in the image and provide:

1. **Equipment Identification**
   - Type (washer, dryer, washer-extractor, stack, ironer, folder, payment-system)
   - Brand and model (identify from nameplate, control panel design, distinctive features)
   - Capacity (lb or kg if identifiable)
   - Fuel type (electric, gas, steam)
   - Serial number if visible

2. **Condition Assessment** (Excellent/Good/Fair/Poor with 0-100 score)
   - Overall condition with detailed notes
   - Cosmetic condition (paint, chrome, decals, panel integrity)
   - Mechanical indicators (door seals, drum condition, control panel, coin slides)
   - Visible wear indicators (rust, dents, worn components, stains)

3. **Age Estimation**
   - Estimated age in years based on model style, control type, design cues
   - Manufacture year estimate
   - Age category (New 0-2yr, Like New 2-5yr, Mid-Life 5-10yr, Mature 10-15yr, End of Life 15+yr)

4. **Valuation**
   - Estimated current market value (low/mid/high range in USD)
   - Original MSRP estimate
   - Depreciation percentage from new
   - Price per pound of capacity (industry metric)

5. **Lifespan Analysis**
   - Expected total lifespan for this equipment type
   - Estimated remaining useful years
   - Projected end-of-life year

6. **Maintenance Recommendations**
   - Urgent items needing immediate attention
   - Recommended maintenance items
   - Preventive maintenance schedule suggestions
   - Estimated annual maintenance cost

7. **Keep/Replace Recommendations**
   - Verdict: Keep, Consider Replacing, Replace Soon, Replace Immediately
   - Reasoning for the recommendation
   - Upgrade options with costs and benefits
   - Replacement suggestions with modern alternatives

Return ONLY valid JSON in this exact format:
{
  "equipment": {
    "type": "washer" | "dryer" | "washer-extractor" | "stack" | "ironer" | "folder" | "payment-system" | "unknown",
    "brand": "Speed Queen" or null,
    "model": "SC40NC2" or null,
    "serialNumber": "ABC123" or null,
    "capacity": "40 lb" or null,
    "fuelType": "gas" | "electric" | "steam" | "unknown"
  },
  "condition": {
    "rating": "Good",
    "score": 72,
    "overallNotes": "Equipment shows normal wear for its age with good mechanical function",
    "cosmetic": {
      "rating": "Good",
      "notes": "Minor scratches and some paint wear on high-contact areas"
    },
    "mechanical": {
      "rating": "Good",
      "notes": "Door seal appears intact, control panel functional"
    },
    "wearIndicators": ["Light rust on base", "Worn coin slide chrome"]
  },
  "valuation": {
    "estimatedMarketValue": {
      "low": 2500,
      "mid": 3200,
      "high": 4000
    },
    "originalMSRP": 12000,
    "depreciationPercent": 73,
    "pricePerPound": 80,
    "comparableListings": "Similar units listed at $2,800-$3,500 on industry marketplaces"
  },
  "age": {
    "estimatedYears": 8,
    "estimatedManufactureYear": ${currentYear - 8},
    "ageCategory": "Mid-Life",
    "ageNotes": "Control panel style and design elements consistent with 2015-2018 production"
  },
  "lifespan": {
    "expectedTotalYears": 15,
    "remainingYears": 7,
    "endOfLifeYear": ${currentYear + 7},
    "lifespanNotes": "Well-maintained units of this brand typically last 15-18 years"
  },
  "maintenance": {
    "urgentItems": ["Inspect door seal for leaks"],
    "recommendedItems": ["Replace bearings within 12 months", "Service coin mechanism"],
    "preventiveSchedule": ["Quarterly bearing inspection", "Annual belt replacement", "Monthly lint system cleaning"],
    "estimatedMaintenanceCost": 450
  },
  "recommendations": {
    "keepOrReplace": "Keep",
    "reasoning": "Equipment is mid-life with good condition. ROI favors continued operation for 5-7 more years with proper maintenance.",
    "upgradeOptions": [
      {
        "option": "Add card payment system",
        "estimatedCost": 800,
        "benefit": "Increase revenue 15-20% with cashless payments"
      }
    ],
    "replacementSuggestions": [
      {
        "brand": "Speed Queen",
        "model": "SC40BC2",
        "estimatedCost": 14500,
        "features": "Updated controls, better efficiency, 5-year warranty"
      }
    ]
  },
  "confidence": 0.85
}

Be specific and realistic with valuations based on current market conditions.
If you cannot identify certain details, use null values but still provide analysis based on what is visible.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType,
          data: imageBase64,
        },
      },
    ]);

    const response = result.response;
    const text = response.text() || "";

    try {
      const jsonMatch =
        text.match(/```json\n([\s\S]*?)\n```/) ||
        text.match(/```\n([\s\S]*?)\n```/) ||
        [null, text];
      const jsonText = jsonMatch[1] || text;
      const parsed = JSON.parse(jsonText.trim());

      return {
        success: true,
        data: {
          equipment: {
            type: parsed.equipment?.type || "unknown",
            brand: parsed.equipment?.brand || null,
            model: parsed.equipment?.model || null,
            serialNumber: parsed.equipment?.serialNumber || null,
            capacity: parsed.equipment?.capacity || null,
            fuelType: parsed.equipment?.fuelType || "unknown",
          },
          condition: {
            rating: parsed.condition?.rating || "Fair",
            score: typeof parsed.condition?.score === "number" ? parsed.condition.score : 50,
            overallNotes: parsed.condition?.overallNotes || "Unable to fully assess condition",
            cosmetic: {
              rating: parsed.condition?.cosmetic?.rating || "Fair",
              notes: parsed.condition?.cosmetic?.notes || "Visual assessment pending",
            },
            mechanical: {
              rating: parsed.condition?.mechanical?.rating || "Fair",
              notes: parsed.condition?.mechanical?.notes || "Mechanical assessment requires closer inspection",
            },
            wearIndicators: Array.isArray(parsed.condition?.wearIndicators)
              ? parsed.condition.wearIndicators
              : [],
          },
          valuation: {
            estimatedMarketValue: {
              low: parsed.valuation?.estimatedMarketValue?.low || 0,
              mid: parsed.valuation?.estimatedMarketValue?.mid || 0,
              high: parsed.valuation?.estimatedMarketValue?.high || 0,
            },
            originalMSRP: parsed.valuation?.originalMSRP || null,
            depreciationPercent:
              typeof parsed.valuation?.depreciationPercent === "number"
                ? parsed.valuation.depreciationPercent
                : 50,
            pricePerPound: parsed.valuation?.pricePerPound || null,
            comparableListings: parsed.valuation?.comparableListings || "Market data unavailable",
          },
          age: {
            estimatedYears:
              typeof parsed.age?.estimatedYears === "number" ? parsed.age.estimatedYears : 10,
            estimatedManufactureYear: parsed.age?.estimatedManufactureYear || null,
            ageCategory: parsed.age?.ageCategory || "Mid-Life",
            ageNotes: parsed.age?.ageNotes || "Age estimation based on visual cues",
          },
          lifespan: {
            expectedTotalYears:
              typeof parsed.lifespan?.expectedTotalYears === "number"
                ? parsed.lifespan.expectedTotalYears
                : 15,
            remainingYears:
              typeof parsed.lifespan?.remainingYears === "number"
                ? parsed.lifespan.remainingYears
                : 5,
            endOfLifeYear: parsed.lifespan?.endOfLifeYear || null,
            lifespanNotes: parsed.lifespan?.lifespanNotes || "Lifespan varies with maintenance",
          },
          maintenance: {
            urgentItems: Array.isArray(parsed.maintenance?.urgentItems)
              ? parsed.maintenance.urgentItems
              : [],
            recommendedItems: Array.isArray(parsed.maintenance?.recommendedItems)
              ? parsed.maintenance.recommendedItems
              : [],
            preventiveSchedule: Array.isArray(parsed.maintenance?.preventiveSchedule)
              ? parsed.maintenance.preventiveSchedule
              : [],
            estimatedMaintenanceCost: parsed.maintenance?.estimatedMaintenanceCost || null,
          },
          recommendations: {
            keepOrReplace: parsed.recommendations?.keepOrReplace || "Keep",
            reasoning:
              parsed.recommendations?.reasoning ||
              "Insufficient data for definitive recommendation",
            upgradeOptions: Array.isArray(parsed.recommendations?.upgradeOptions)
              ? parsed.recommendations.upgradeOptions
              : [],
            replacementSuggestions: Array.isArray(parsed.recommendations?.replacementSuggestions)
              ? parsed.recommendations.replacementSuggestions
              : [],
          },
        },
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
      };
    } catch (parseError) {
      console.error("Failed to parse Gemini equipment appraisal response:", parseError);
      return {
        success: true,
        data: {
          equipment: {
            type: "unknown",
            brand: null,
            model: null,
            serialNumber: null,
            capacity: null,
            fuelType: "unknown",
          },
          condition: {
            rating: "Fair",
            score: 50,
            overallNotes: "Unable to parse detailed analysis. Please try with a clearer image.",
            cosmetic: { rating: "Fair", notes: "Assessment pending" },
            mechanical: { rating: "Fair", notes: "Assessment pending" },
            wearIndicators: [],
          },
          valuation: {
            estimatedMarketValue: { low: 0, mid: 0, high: 0 },
            originalMSRP: null,
            depreciationPercent: 50,
            pricePerPound: null,
            comparableListings: "Unable to determine",
          },
          age: {
            estimatedYears: 10,
            estimatedManufactureYear: null,
            ageCategory: "Mid-Life",
            ageNotes: "Unable to determine age",
          },
          lifespan: {
            expectedTotalYears: 15,
            remainingYears: 5,
            endOfLifeYear: null,
            lifespanNotes: "Unable to estimate lifespan",
          },
          maintenance: {
            urgentItems: [],
            recommendedItems: ["On-site inspection recommended"],
            preventiveSchedule: [],
            estimatedMaintenanceCost: null,
          },
          recommendations: {
            keepOrReplace: "Keep",
            reasoning: "Insufficient image data for detailed analysis",
            upgradeOptions: [],
            replacementSuggestions: [],
          },
        },
        confidence: 0.3,
        error: "Could not parse detailed analysis from image",
      };
    }
  } catch (error) {
    console.error("Gemini equipment appraisal error:", error);
    throw error;
  }
}

router.post("/appraise-equipment", upload.single("image"), async (req, res) => {
  try {
    if (!genAI) {
      return res.status(503).json({
        success: false,
        error: "AI service is not configured. Please contact support.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No image file provided. Please upload an equipment photo.",
      });
    }

    const imageBase64 = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;

    const result = await appraiseEquipmentImage(imageBase64, mimeType);

    return res.json(result);
  } catch (error: any) {
    console.error("Equipment appraisal error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze equipment. Please try again.",
    });
  }
});

// ============================================================================
// COMPETITOR INTELLIGENCE RADAR - AI-powered competitive market analysis
// ============================================================================

export interface CompetitorAnalysisResult {
  success: boolean;
  data: {
    address: string;
    radius: number;
    analysisDepth: string;
    marketOverview: {
      estimatedCompetitors: number;
      marketSaturation: "low" | "moderate" | "high" | "saturated";
      estimatedMarketSize: string;
      growthPotential: "high" | "moderate" | "low";
      marketMaturity: "emerging" | "growing" | "mature" | "declining";
    };
    competitorLandscape: {
      traditionalLaundromats: number;
      modernFacilities: number;
      pickupDeliveryServices: number;
      dryCleaners: number;
      laundryApps: number;
      dominantPlayerType: string;
      competitorProfiles: Array<{
        type: string;
        marketShare: string;
        strengths: string[];
        weaknesses: string[];
      }>;
    };
    swotAnalysis: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    positioningStrategy: {
      recommendedPosition: string;
      targetSegment: string;
      uniqueValueProposition: string;
      brandingAdvice: string;
      keyDifferentiators: string[];
    };
    pricingStrategy: {
      marketPricingLevel: "below-market" | "market-rate" | "premium";
      recommendedApproach: string;
      washPricing: { low: number; recommended: number; premium: number };
      dryPricing: { low: number; recommended: number; premium: number };
      pricingTips: string[];
    };
    serviceGaps: Array<{
      gap: string;
      opportunity: string;
      priority: "high" | "medium" | "low";
      estimatedDemand: string;
    }>;
    differentiationOpportunities: Array<{
      opportunity: string;
      implementation: string;
      investmentLevel: "low" | "medium" | "high";
      impactPotential: "high" | "medium" | "low";
    }>;
    competitiveDimensions: {
      priceCompetitiveness: number;
      serviceQuality: number;
      convenience: number;
      technologyAdoption: number;
      customerExperience: number;
      marketPresence: number;
    };
    opportunityScore: {
      score: number;
      grade: "A" | "B" | "C" | "Needs Work";
      marketSharePotential: string;
      verdict: string;
    };
    recommendations: Array<{
      action: string;
      priority: "high" | "medium" | "low";
      timeframe: string;
      expectedImpact: string;
    }>;
  };
  confidence: number;
  error?: string;
}

async function analyzeCompetitors(
  address: string,
  radius: number,
  analysisDepth: string
): Promise<CompetitorAnalysisResult> {
  if (!genAI) {
    throw new Error("Gemini AI is not configured");
  }

  const prompt = `You are an expert laundromat market analyst and competitive intelligence specialist with 25+ years of experience in the laundry industry. Analyze the competitive landscape for a laundromat business at this location.

LOCATION TO ANALYZE:
Address: ${address}
Analysis Radius: ${radius} miles
Analysis Depth: ${analysisDepth}

Based on your knowledge of this area and general market dynamics, provide a comprehensive competitive analysis:

1. **Market Overview**:
   - Estimated number of competitors within radius
   - Market saturation level (low/moderate/high/saturated)
   - Estimated market size (annual revenue potential)
   - Growth potential (high/moderate/low)
   - Market maturity stage (emerging/growing/mature/declining)

2. **Competitor Landscape**:
   - Count of traditional laundromats, modern facilities, pickup/delivery services, dry cleaners, and laundry apps
   - Dominant player type in the area
   - 2-3 competitor profiles with type, market share estimate, strengths, and weaknesses

3. **SWOT Analysis** (for a NEW entrant):
   - 3-4 Strengths to leverage
   - 3-4 Weaknesses to address
   - 3-4 Opportunities to pursue
   - 3-4 Threats to monitor

4. **Positioning Strategy**:
   - Recommended market position
   - Target customer segment
   - Unique value proposition
   - Branding advice
   - 3-5 key differentiators

5. **Pricing Strategy**:
   - Current market pricing level (below-market/market-rate/premium)
   - Recommended pricing approach
   - Wash pricing range (low/recommended/premium per load)
   - Dry pricing range (low/recommended/premium per load)
   - 3-4 pricing tips

6. **Service Gaps** (3-4 gaps):
   - Underserved needs in the market
   - Opportunity to fill each gap
   - Priority level (high/medium/low)
   - Estimated demand

7. **Differentiation Opportunities** (4-5 opportunities):
   - Specific opportunity
   - How to implement
   - Investment level (low/medium/high)
   - Impact potential (high/medium/low)

8. **Competitive Dimensions** (scores 0-100):
   - Price competitiveness of market
   - Service quality in market
   - Convenience offerings
   - Technology adoption
   - Customer experience focus
   - Market presence/visibility

9. **Opportunity Score**:
   - Overall score (0-100)
   - Grade (A=85+, B=70-84, C=55-69, Needs Work=<55)
   - Market share potential estimate
   - Overall verdict

10. **Priority Recommendations** (5 recommendations):
    - Specific action
    - Priority (high/medium/low)
    - Timeframe
    - Expected impact

Return ONLY valid JSON in this exact format:
{
  "address": "${address}",
  "radius": ${radius},
  "analysisDepth": "${analysisDepth}",
  "marketOverview": {
    "estimatedCompetitors": 5,
    "marketSaturation": "moderate",
    "estimatedMarketSize": "$2.5M annually",
    "growthPotential": "moderate",
    "marketMaturity": "growing"
  },
  "competitorLandscape": {
    "traditionalLaundromats": 3,
    "modernFacilities": 1,
    "pickupDeliveryServices": 2,
    "dryCleaners": 4,
    "laundryApps": 1,
    "dominantPlayerType": "Traditional self-service laundromats",
    "competitorProfiles": [
      {
        "type": "Traditional Laundromat",
        "marketShare": "40%",
        "strengths": ["Established", "Low prices"],
        "weaknesses": ["Outdated equipment", "Poor experience"]
      }
    ]
  },
  "swotAnalysis": {
    "strengths": ["New equipment advantage", "Fresh branding opportunity"],
    "weaknesses": ["No existing customer base", "Brand awareness needed"],
    "opportunities": ["Underserved WDF market", "Tech-savvy customers"],
    "threats": ["Established competition", "Economic sensitivity"]
  },
  "positioningStrategy": {
    "recommendedPosition": "Premium convenience-focused laundromat",
    "targetSegment": "Busy professionals and families",
    "uniqueValueProposition": "Time-saving laundry experience with modern amenities",
    "brandingAdvice": "Focus on cleanliness, speed, and modern experience",
    "keyDifferentiators": ["Free WiFi", "Mobile payments", "Wash-dry-fold service"]
  },
  "pricingStrategy": {
    "marketPricingLevel": "market-rate",
    "recommendedApproach": "Value-based pricing with premium options",
    "washPricing": { "low": 3.50, "recommended": 4.50, "premium": 6.00 },
    "dryPricing": { "low": 2.50, "recommended": 3.50, "premium": 4.50 },
    "pricingTips": ["Bundle wash-dry-fold for value", "Offer loyalty discounts"]
  },
  "serviceGaps": [
    {
      "gap": "24-hour operation",
      "opportunity": "Capture night shift workers and late-night demand",
      "priority": "high",
      "estimatedDemand": "15-20% of market"
    }
  ],
  "differentiationOpportunities": [
    {
      "opportunity": "Premium WDF service",
      "implementation": "Add staffed drop-off with 24hr turnaround",
      "investmentLevel": "medium",
      "impactPotential": "high"
    }
  ],
  "competitiveDimensions": {
    "priceCompetitiveness": 65,
    "serviceQuality": 55,
    "convenience": 50,
    "technologyAdoption": 40,
    "customerExperience": 45,
    "marketPresence": 60
  },
  "opportunityScore": {
    "score": 72,
    "grade": "B",
    "marketSharePotential": "15-25% within 2 years",
    "verdict": "Good opportunity with room for differentiation"
  },
  "recommendations": [
    {
      "action": "Focus on WDF service as primary differentiator",
      "priority": "high",
      "timeframe": "Launch with opening",
      "expectedImpact": "Capture underserved segment worth 20% revenue"
    }
  ],
  "confidence": 0.78
}

Be realistic and data-driven. Use your knowledge of the area and laundry industry dynamics.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text() || "";

    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                        text.match(/```\n([\s\S]*?)\n```/) || 
                        [null, text];
      const jsonText = jsonMatch[1] || text;
      const parsed = JSON.parse(jsonText.trim());

      const score = parsed.opportunityScore?.score || 50;
      const gradeFromScore = score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : "Needs Work";

      return {
        success: true,
        data: {
          address: parsed.address || address,
          radius: parsed.radius || radius,
          analysisDepth: parsed.analysisDepth || analysisDepth,
          marketOverview: {
            estimatedCompetitors: parsed.marketOverview?.estimatedCompetitors || 3,
            marketSaturation: parsed.marketOverview?.marketSaturation || "moderate",
            estimatedMarketSize: parsed.marketOverview?.estimatedMarketSize || "$1-2M annually",
            growthPotential: parsed.marketOverview?.growthPotential || "moderate",
            marketMaturity: parsed.marketOverview?.marketMaturity || "mature",
          },
          competitorLandscape: {
            traditionalLaundromats: parsed.competitorLandscape?.traditionalLaundromats || 2,
            modernFacilities: parsed.competitorLandscape?.modernFacilities || 1,
            pickupDeliveryServices: parsed.competitorLandscape?.pickupDeliveryServices || 1,
            dryCleaners: parsed.competitorLandscape?.dryCleaners || 3,
            laundryApps: parsed.competitorLandscape?.laundryApps || 1,
            dominantPlayerType: parsed.competitorLandscape?.dominantPlayerType || "Traditional laundromats",
            competitorProfiles: Array.isArray(parsed.competitorLandscape?.competitorProfiles)
              ? parsed.competitorLandscape.competitorProfiles
              : [],
          },
          swotAnalysis: {
            strengths: Array.isArray(parsed.swotAnalysis?.strengths) 
              ? parsed.swotAnalysis.strengths 
              : ["New equipment advantage", "Fresh market approach"],
            weaknesses: Array.isArray(parsed.swotAnalysis?.weaknesses)
              ? parsed.swotAnalysis.weaknesses
              : ["No existing customer base", "Brand awareness needed"],
            opportunities: Array.isArray(parsed.swotAnalysis?.opportunities)
              ? parsed.swotAnalysis.opportunities
              : ["Underserved market segments", "Technology adoption"],
            threats: Array.isArray(parsed.swotAnalysis?.threats)
              ? parsed.swotAnalysis.threats
              : ["Established competition", "Economic uncertainty"],
          },
          positioningStrategy: {
            recommendedPosition: parsed.positioningStrategy?.recommendedPosition || "Quality-focused neighborhood laundromat",
            targetSegment: parsed.positioningStrategy?.targetSegment || "Local residents and families",
            uniqueValueProposition: parsed.positioningStrategy?.uniqueValueProposition || "Clean, modern, and convenient laundry experience",
            brandingAdvice: parsed.positioningStrategy?.brandingAdvice || "Emphasize cleanliness and customer service",
            keyDifferentiators: Array.isArray(parsed.positioningStrategy?.keyDifferentiators)
              ? parsed.positioningStrategy.keyDifferentiators
              : ["Modern equipment", "Clean facility", "Friendly service"],
          },
          pricingStrategy: {
            marketPricingLevel: parsed.pricingStrategy?.marketPricingLevel || "market-rate",
            recommendedApproach: parsed.pricingStrategy?.recommendedApproach || "Competitive pricing with premium service",
            washPricing: {
              low: parsed.pricingStrategy?.washPricing?.low || 3.50,
              recommended: parsed.pricingStrategy?.washPricing?.recommended || 4.50,
              premium: parsed.pricingStrategy?.washPricing?.premium || 6.00,
            },
            dryPricing: {
              low: parsed.pricingStrategy?.dryPricing?.low || 2.50,
              recommended: parsed.pricingStrategy?.dryPricing?.recommended || 3.50,
              premium: parsed.pricingStrategy?.dryPricing?.premium || 4.50,
            },
            pricingTips: Array.isArray(parsed.pricingStrategy?.pricingTips)
              ? parsed.pricingStrategy.pricingTips
              : ["Match or slightly exceed local pricing", "Offer loyalty programs"],
          },
          serviceGaps: Array.isArray(parsed.serviceGaps)
            ? parsed.serviceGaps
            : [{
                gap: "Extended hours",
                opportunity: "Serve customers with non-traditional schedules",
                priority: "medium" as const,
                estimatedDemand: "10-15% of market"
              }],
          differentiationOpportunities: Array.isArray(parsed.differentiationOpportunities)
            ? parsed.differentiationOpportunities
            : [{
                opportunity: "Wash-dry-fold service",
                implementation: "Add staffed service area",
                investmentLevel: "medium" as const,
                impactPotential: "high" as const
              }],
          competitiveDimensions: {
            priceCompetitiveness: parsed.competitiveDimensions?.priceCompetitiveness || 60,
            serviceQuality: parsed.competitiveDimensions?.serviceQuality || 55,
            convenience: parsed.competitiveDimensions?.convenience || 50,
            technologyAdoption: parsed.competitiveDimensions?.technologyAdoption || 45,
            customerExperience: parsed.competitiveDimensions?.customerExperience || 50,
            marketPresence: parsed.competitiveDimensions?.marketPresence || 55,
          },
          opportunityScore: {
            score,
            grade: gradeFromScore,
            marketSharePotential: parsed.opportunityScore?.marketSharePotential || "10-20% achievable",
            verdict: parsed.opportunityScore?.verdict || "Market shows opportunity for well-positioned entrant",
          },
          recommendations: Array.isArray(parsed.recommendations)
            ? parsed.recommendations
            : [{
                action: "Conduct on-site competitive reconnaissance",
                priority: "high" as const,
                timeframe: "Before launch",
                expectedImpact: "Inform final positioning decisions"
              }],
        },
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.7,
      };
    } catch (parseError) {
      console.error("Failed to parse Gemini competitor analysis response:", parseError);
      return {
        success: true,
        data: {
          address,
          radius,
          analysisDepth,
          marketOverview: {
            estimatedCompetitors: 3,
            marketSaturation: "moderate",
            estimatedMarketSize: "$1-2M annually",
            growthPotential: "moderate",
            marketMaturity: "mature",
          },
          competitorLandscape: {
            traditionalLaundromats: 2,
            modernFacilities: 1,
            pickupDeliveryServices: 1,
            dryCleaners: 2,
            laundryApps: 0,
            dominantPlayerType: "Traditional laundromats",
            competitorProfiles: [],
          },
          swotAnalysis: {
            strengths: ["New equipment opportunity", "Fresh branding"],
            weaknesses: ["No existing customer base"],
            opportunities: ["Market differentiation"],
            threats: ["Established competition"],
          },
          positioningStrategy: {
            recommendedPosition: "Quality neighborhood laundromat",
            targetSegment: "Local residents",
            uniqueValueProposition: "Clean and convenient",
            brandingAdvice: "Emphasize cleanliness and service",
            keyDifferentiators: ["Modern equipment", "Clean facility"],
          },
          pricingStrategy: {
            marketPricingLevel: "market-rate",
            recommendedApproach: "Competitive pricing",
            washPricing: { low: 3.50, recommended: 4.50, premium: 6.00 },
            dryPricing: { low: 2.50, recommended: 3.50, premium: 4.50 },
            pricingTips: ["Match local pricing"],
          },
          serviceGaps: [{
            gap: "Analysis in progress",
            opportunity: "On-site visit recommended",
            priority: "high",
            estimatedDemand: "TBD"
          }],
          differentiationOpportunities: [{
            opportunity: "On-site analysis needed",
            implementation: "Visit competitors in person",
            investmentLevel: "low",
            impactPotential: "high"
          }],
          competitiveDimensions: {
            priceCompetitiveness: 50,
            serviceQuality: 50,
            convenience: 50,
            technologyAdoption: 50,
            customerExperience: 50,
            marketPresence: 50,
          },
          opportunityScore: {
            score: 60,
            grade: "C",
            marketSharePotential: "Requires further analysis",
            verdict: "Preliminary analysis - on-site verification recommended",
          },
          recommendations: [{
            action: "Visit location and competitors in person",
            priority: "high",
            timeframe: "Immediately",
            expectedImpact: "Complete competitive picture"
          }],
        },
        confidence: 0.4,
        error: "Partial analysis completed - some data could not be parsed",
      };
    }
  } catch (error) {
    console.error("Gemini competitor analysis error:", error);
    throw error;
  }
}

router.post("/analyze-competitors", async (req, res) => {
  try {
    if (!genAI) {
      return res.status(503).json({
        success: false,
        error: "AI service is not configured. Please contact support.",
      });
    }

    const { address, radius = 3, analysisDepth = "comprehensive" } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: "Please provide an address to analyze.",
      });
    }

    const radiusNum = Math.min(Math.max(parseFloat(radius) || 3, 1), 10);
    
    const result = await analyzeCompetitors(address, radiusNum, analysisDepth);

    return res.json(result);
  } catch (error: any) {
    console.error("Competitor analysis error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze competition. Please try again.",
    });
  }
});

// ============================================================================
// DEMOGRAPHIC MICRO-CLUSTERER - AI-powered demographic analysis
// ============================================================================

export interface DemographicAnalysisResult {
  success: boolean;
  data: {
    address: string;
    radius: number;
    analysisFocus: string;
    populationOverview: {
      totalEstimate: number;
      density: "high" | "medium" | "low";
      densityDescription: string;
      growthTrend: "growing" | "stable" | "declining";
      medianAge: number;
    };
    customerSegments: {
      families: { percentage: number; count: number; description: string };
      singles: { percentage: number; count: number; description: string };
      elderly: { percentage: number; count: number; description: string };
      students: { percentage: number; count: number; description: string };
      professionals: { percentage: number; count: number; description: string };
    };
    incomeDistribution: {
      lowIncome: { percentage: number; range: string };
      moderateIncome: { percentage: number; range: string };
      middleIncome: { percentage: number; range: string };
      upperMiddleIncome: { percentage: number; range: string };
      highIncome: { percentage: number; range: string };
      medianHouseholdIncome: number;
      incomeAssessment: string;
    };
    housingAnalysis: {
      apartments: { percentage: number; description: string };
      singleFamily: { percentage: number; description: string };
      condos: { percentage: number; description: string };
      multiFamily: { percentage: number; description: string };
      renterPercentage: number;
      ownerPercentage: number;
      averageHouseholdSize: number;
      housingAssessment: string;
    };
    lifestyleIndicators: {
      carOwnership: { percentage: number; avgVehiclesPerHousehold: number; assessment: string };
      transitUsage: { percentage: number; transitScore: number; assessment: string };
      walkability: { score: number; assessment: string };
      commutePatterns: string;
      shoppingPreferences: string;
    };
    laundryBehavior: {
      selfServiceLikelihood: number;
      dropOffLikelihood: number;
      pickupDeliveryLikelihood: number;
      washerOwnership: number;
      averageLoadsPerWeek: number;
      peakDays: string[];
      peakHours: string[];
      pricesSensitivity: "high" | "medium" | "low";
      conveniencePreference: "high" | "medium" | "low";
      behaviorAssessment: string;
    };
    spendingPower: {
      discretionaryIncomeLevel: "high" | "medium" | "low";
      monthlyLaundryBudget: { low: number; average: number; high: number };
      pricePointRecommendation: string;
      spendingAssessment: string;
    };
    customerPersonas: Array<{
      name: string;
      age: string;
      occupation: string;
      householdType: string;
      income: string;
      laundryNeeds: string;
      visitFrequency: string;
      preferredServices: string[];
      painPoints: string[];
      marketingApproach: string;
      estimatedPercentage: number;
    }>;
    marketOpportunity: {
      score: number;
      grade: "A" | "B" | "C" | "D";
      primaryTarget: string;
      secondaryTarget: string;
      verdict: string;
    };
  };
  confidence: number;
  error?: string;
}

async function analyzeDemographics(
  address: string,
  radius: number,
  analysisFocus: string
): Promise<DemographicAnalysisResult> {
  if (!genAI) {
    throw new Error("Gemini AI is not configured");
  }

  const prompt = `You are an expert demographic analyst and market researcher specializing in laundromat location analysis. Analyze the demographics around this location for laundromat business potential.

LOCATION TO ANALYZE:
Address/ZIP: ${address}
Analysis Radius: ${radius} miles
Focus Area: ${analysisFocus}

Provide comprehensive demographic micro-cluster analysis including:

1. **Population Overview**: Total population estimate, density level, growth trend, median age

2. **Customer Segments** (percentages must total 100%):
   - Families (with children)
   - Singles/Young Adults
   - Elderly/Seniors (65+)
   - Students
   - Working Professionals

3. **Income Distribution** (percentages must total 100%):
   - Low Income (<$30K)
   - Moderate Income ($30K-$50K)
   - Middle Income ($50K-$75K)
   - Upper-Middle Income ($75K-$100K)
   - High Income (>$100K)
   - Include median household income

4. **Housing Analysis** (percentages must total 100%):
   - Apartments/Rentals
   - Single Family Homes
   - Condos/Townhouses
   - Multi-Family Units
   - Renter vs Owner percentages
   - Average household size

5. **Lifestyle Indicators**:
   - Car ownership rates
   - Public transit usage
   - Walkability assessment
   - Commute patterns
   - Shopping preferences

6. **Laundry Behavior Predictions**:
   - Self-service likelihood (0-100)
   - Drop-off service likelihood (0-100)
   - Pickup/delivery likelihood (0-100)
   - Washer ownership percentage
   - Average loads per week
   - Peak days and hours
   - Price sensitivity
   - Convenience preference

7. **Spending Power Assessment**:
   - Discretionary income level
   - Monthly laundry budget range
   - Price point recommendations

8. **Customer Personas** (Generate 3-5 detailed personas):
   - Name (demographic archetype)
   - Age range
   - Occupation
   - Household type
   - Income bracket
   - Laundry needs
   - Visit frequency
   - Preferred services
   - Pain points
   - Marketing approach
   - Estimated % of customer base

9. **Market Opportunity Score** (0-100):
   - Primary target segment
   - Secondary target segment
   - Overall verdict

Return ONLY valid JSON in this exact format:
{
  "address": "${address}",
  "radius": ${radius},
  "analysisFocus": "${analysisFocus}",
  "populationOverview": {
    "totalEstimate": 45000,
    "density": "high" | "medium" | "low",
    "densityDescription": "Description of population density",
    "growthTrend": "growing" | "stable" | "declining",
    "medianAge": 34
  },
  "customerSegments": {
    "families": { "percentage": 25, "count": 11250, "description": "Families with young children" },
    "singles": { "percentage": 30, "count": 13500, "description": "Young professionals and singles" },
    "elderly": { "percentage": 15, "count": 6750, "description": "Retired seniors" },
    "students": { "percentage": 10, "count": 4500, "description": "College students" },
    "professionals": { "percentage": 20, "count": 9000, "description": "Working professionals" }
  },
  "incomeDistribution": {
    "lowIncome": { "percentage": 15, "range": "<$30K" },
    "moderateIncome": { "percentage": 25, "range": "$30K-$50K" },
    "middleIncome": { "percentage": 30, "range": "$50K-$75K" },
    "upperMiddleIncome": { "percentage": 20, "range": "$75K-$100K" },
    "highIncome": { "percentage": 10, "range": ">$100K" },
    "medianHouseholdIncome": 58000,
    "incomeAssessment": "Assessment of income levels for laundromat"
  },
  "housingAnalysis": {
    "apartments": { "percentage": 45, "description": "High-density apartment complexes" },
    "singleFamily": { "percentage": 30, "description": "Traditional single-family homes" },
    "condos": { "percentage": 15, "description": "Condos and townhouses" },
    "multiFamily": { "percentage": 10, "description": "Duplexes and multi-family" },
    "renterPercentage": 55,
    "ownerPercentage": 45,
    "averageHouseholdSize": 2.4,
    "housingAssessment": "Assessment of housing market"
  },
  "lifestyleIndicators": {
    "carOwnership": { "percentage": 75, "avgVehiclesPerHousehold": 1.5, "assessment": "Car-dependent area" },
    "transitUsage": { "percentage": 20, "transitScore": 45, "assessment": "Limited transit options" },
    "walkability": { "score": 55, "assessment": "Moderately walkable" },
    "commutePatterns": "Most commute by car, 20-30 minute average",
    "shoppingPreferences": "Mix of online and in-store shopping"
  },
  "laundryBehavior": {
    "selfServiceLikelihood": 65,
    "dropOffLikelihood": 45,
    "pickupDeliveryLikelihood": 25,
    "washerOwnership": 40,
    "averageLoadsPerWeek": 3.5,
    "peakDays": ["Saturday", "Sunday"],
    "peakHours": ["9AM-12PM", "5PM-8PM"],
    "pricesSensitivity": "medium",
    "conveniencePreference": "high",
    "behaviorAssessment": "Strong self-service demand with growing drop-off interest"
  },
  "spendingPower": {
    "discretionaryIncomeLevel": "medium",
    "monthlyLaundryBudget": { "low": 40, "average": 75, "high": 120 },
    "pricePointRecommendation": "Mid-range pricing with premium options",
    "spendingAssessment": "Moderate spending power with value consciousness"
  },
  "customerPersonas": [
    {
      "name": "Busy Professional Paula",
      "age": "28-40",
      "occupation": "Office professional",
      "householdType": "Single or couple, no kids",
      "income": "$60K-$90K",
      "laundryNeeds": "Convenience-focused, time-constrained",
      "visitFrequency": "Weekly",
      "preferredServices": ["Drop-off", "Express wash"],
      "painPoints": ["Limited time", "Needs evening/weekend hours"],
      "marketingApproach": "Emphasize convenience and time savings",
      "estimatedPercentage": 25
    }
  ],
  "marketOpportunity": {
    "score": 78,
    "grade": "B",
    "primaryTarget": "Young professionals in apartments",
    "secondaryTarget": "Families with limited in-unit laundry",
    "verdict": "Strong market with diverse customer base"
  },
  "confidence": 0.85
}

Be realistic and data-driven. Use your knowledge of the area to provide accurate demographic estimates.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text() || "";

    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                        text.match(/```\n([\s\S]*?)\n```/) || 
                        [null, text];
      const jsonText = jsonMatch[1] || text;
      const parsed = JSON.parse(jsonText.trim());

      const score = parsed.marketOpportunity?.score || 60;
      let grade: "A" | "B" | "C" | "D" = "C";
      if (score >= 85) grade = "A";
      else if (score >= 70) grade = "B";
      else if (score >= 55) grade = "C";
      else grade = "D";

      return {
        success: true,
        data: {
          address: parsed.address || address,
          radius: parsed.radius || radius,
          analysisFocus: parsed.analysisFocus || analysisFocus,
          populationOverview: {
            totalEstimate: parsed.populationOverview?.totalEstimate || 25000,
            density: parsed.populationOverview?.density || "medium",
            densityDescription: parsed.populationOverview?.densityDescription || "Moderate population density",
            growthTrend: parsed.populationOverview?.growthTrend || "stable",
            medianAge: parsed.populationOverview?.medianAge || 35,
          },
          customerSegments: {
            families: parsed.customerSegments?.families || { percentage: 25, count: 6250, description: "Families with children" },
            singles: parsed.customerSegments?.singles || { percentage: 30, count: 7500, description: "Singles and young adults" },
            elderly: parsed.customerSegments?.elderly || { percentage: 15, count: 3750, description: "Seniors 65+" },
            students: parsed.customerSegments?.students || { percentage: 10, count: 2500, description: "College students" },
            professionals: parsed.customerSegments?.professionals || { percentage: 20, count: 5000, description: "Working professionals" },
          },
          incomeDistribution: {
            lowIncome: parsed.incomeDistribution?.lowIncome || { percentage: 20, range: "<$30K" },
            moderateIncome: parsed.incomeDistribution?.moderateIncome || { percentage: 25, range: "$30K-$50K" },
            middleIncome: parsed.incomeDistribution?.middleIncome || { percentage: 30, range: "$50K-$75K" },
            upperMiddleIncome: parsed.incomeDistribution?.upperMiddleIncome || { percentage: 15, range: "$75K-$100K" },
            highIncome: parsed.incomeDistribution?.highIncome || { percentage: 10, range: ">$100K" },
            medianHouseholdIncome: parsed.incomeDistribution?.medianHouseholdIncome || 55000,
            incomeAssessment: parsed.incomeDistribution?.incomeAssessment || "Mixed income demographics",
          },
          housingAnalysis: {
            apartments: parsed.housingAnalysis?.apartments || { percentage: 40, description: "Apartment complexes" },
            singleFamily: parsed.housingAnalysis?.singleFamily || { percentage: 35, description: "Single family homes" },
            condos: parsed.housingAnalysis?.condos || { percentage: 15, description: "Condos and townhouses" },
            multiFamily: parsed.housingAnalysis?.multiFamily || { percentage: 10, description: "Multi-family units" },
            renterPercentage: parsed.housingAnalysis?.renterPercentage || 50,
            ownerPercentage: parsed.housingAnalysis?.ownerPercentage || 50,
            averageHouseholdSize: parsed.housingAnalysis?.averageHouseholdSize || 2.5,
            housingAssessment: parsed.housingAnalysis?.housingAssessment || "Mixed housing types",
          },
          lifestyleIndicators: {
            carOwnership: parsed.lifestyleIndicators?.carOwnership || { percentage: 80, avgVehiclesPerHousehold: 1.5, assessment: "Car-dependent" },
            transitUsage: parsed.lifestyleIndicators?.transitUsage || { percentage: 15, transitScore: 40, assessment: "Limited transit" },
            walkability: parsed.lifestyleIndicators?.walkability || { score: 50, assessment: "Moderately walkable" },
            commutePatterns: parsed.lifestyleIndicators?.commutePatterns || "Primarily car commuters",
            shoppingPreferences: parsed.lifestyleIndicators?.shoppingPreferences || "Mix of online and in-store",
          },
          laundryBehavior: {
            selfServiceLikelihood: parsed.laundryBehavior?.selfServiceLikelihood || 60,
            dropOffLikelihood: parsed.laundryBehavior?.dropOffLikelihood || 40,
            pickupDeliveryLikelihood: parsed.laundryBehavior?.pickupDeliveryLikelihood || 20,
            washerOwnership: parsed.laundryBehavior?.washerOwnership || 45,
            averageLoadsPerWeek: parsed.laundryBehavior?.averageLoadsPerWeek || 3,
            peakDays: Array.isArray(parsed.laundryBehavior?.peakDays) ? parsed.laundryBehavior.peakDays : ["Saturday", "Sunday"],
            peakHours: Array.isArray(parsed.laundryBehavior?.peakHours) ? parsed.laundryBehavior.peakHours : ["10AM-2PM", "5PM-8PM"],
            pricesSensitivity: parsed.laundryBehavior?.pricesSensitivity || "medium",
            conveniencePreference: parsed.laundryBehavior?.conveniencePreference || "medium",
            behaviorAssessment: parsed.laundryBehavior?.behaviorAssessment || "Standard laundry usage patterns",
          },
          spendingPower: {
            discretionaryIncomeLevel: parsed.spendingPower?.discretionaryIncomeLevel || "medium",
            monthlyLaundryBudget: parsed.spendingPower?.monthlyLaundryBudget || { low: 35, average: 65, high: 100 },
            pricePointRecommendation: parsed.spendingPower?.pricePointRecommendation || "Competitive mid-range pricing",
            spendingAssessment: parsed.spendingPower?.spendingAssessment || "Moderate spending capacity",
          },
          customerPersonas: Array.isArray(parsed.customerPersonas) && parsed.customerPersonas.length > 0
            ? parsed.customerPersonas
            : [{
                name: "Value-Conscious Victor",
                age: "25-45",
                occupation: "Service industry worker",
                householdType: "Single or small family",
                income: "$35K-$55K",
                laundryNeeds: "Regular weekly washing",
                visitFrequency: "Weekly",
                preferredServices: ["Self-service", "Large capacity machines"],
                painPoints: ["Price sensitivity", "Wait times"],
                marketingApproach: "Value pricing and loyalty programs",
                estimatedPercentage: 35,
              }],
          marketOpportunity: {
            score,
            grade,
            primaryTarget: parsed.marketOpportunity?.primaryTarget || "Apartment renters",
            secondaryTarget: parsed.marketOpportunity?.secondaryTarget || "Busy professionals",
            verdict: parsed.marketOpportunity?.verdict || "Market shows potential for laundromat business",
          },
        },
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.7,
      };
    } catch (parseError) {
      console.error("Failed to parse Gemini demographic analysis response:", parseError);
      return {
        success: true,
        data: {
          address,
          radius,
          analysisFocus,
          populationOverview: {
            totalEstimate: 25000,
            density: "medium",
            densityDescription: "Moderate population density - analysis in progress",
            growthTrend: "stable",
            medianAge: 35,
          },
          customerSegments: {
            families: { percentage: 25, count: 6250, description: "Families with children" },
            singles: { percentage: 30, count: 7500, description: "Singles and young adults" },
            elderly: { percentage: 15, count: 3750, description: "Seniors 65+" },
            students: { percentage: 10, count: 2500, description: "Students" },
            professionals: { percentage: 20, count: 5000, description: "Working professionals" },
          },
          incomeDistribution: {
            lowIncome: { percentage: 20, range: "<$30K" },
            moderateIncome: { percentage: 25, range: "$30K-$50K" },
            middleIncome: { percentage: 30, range: "$50K-$75K" },
            upperMiddleIncome: { percentage: 15, range: "$75K-$100K" },
            highIncome: { percentage: 10, range: ">$100K" },
            medianHouseholdIncome: 55000,
            incomeAssessment: "Analysis pending - on-site verification recommended",
          },
          housingAnalysis: {
            apartments: { percentage: 40, description: "Apartments" },
            singleFamily: { percentage: 35, description: "Single family homes" },
            condos: { percentage: 15, description: "Condos" },
            multiFamily: { percentage: 10, description: "Multi-family" },
            renterPercentage: 50,
            ownerPercentage: 50,
            averageHouseholdSize: 2.5,
            housingAssessment: "Mixed housing - further analysis needed",
          },
          lifestyleIndicators: {
            carOwnership: { percentage: 75, avgVehiclesPerHousehold: 1.5, assessment: "Car-dependent area" },
            transitUsage: { percentage: 20, transitScore: 40, assessment: "Limited transit" },
            walkability: { score: 50, assessment: "Moderately walkable" },
            commutePatterns: "Analysis in progress",
            shoppingPreferences: "Analysis in progress",
          },
          laundryBehavior: {
            selfServiceLikelihood: 60,
            dropOffLikelihood: 35,
            pickupDeliveryLikelihood: 20,
            washerOwnership: 45,
            averageLoadsPerWeek: 3,
            peakDays: ["Saturday", "Sunday"],
            peakHours: ["10AM-2PM", "5PM-8PM"],
            pricesSensitivity: "medium",
            conveniencePreference: "medium",
            behaviorAssessment: "Preliminary analysis - verify on site",
          },
          spendingPower: {
            discretionaryIncomeLevel: "medium",
            monthlyLaundryBudget: { low: 35, average: 65, high: 100 },
            pricePointRecommendation: "Mid-range pricing recommended",
            spendingAssessment: "Moderate spending power",
          },
          customerPersonas: [{
            name: "General Customer",
            age: "25-55",
            occupation: "Various",
            householdType: "Mixed",
            income: "$40K-$70K",
            laundryNeeds: "Regular laundry needs",
            visitFrequency: "Weekly",
            preferredServices: ["Self-service"],
            painPoints: ["Convenience", "Pricing"],
            marketingApproach: "Value and convenience messaging",
            estimatedPercentage: 100,
          }],
          marketOpportunity: {
            score: 60,
            grade: "C",
            primaryTarget: "General population",
            secondaryTarget: "Apartment renters",
            verdict: "Preliminary analysis - on-site verification recommended",
          },
        },
        confidence: 0.4,
        error: "Partial analysis completed - some data could not be parsed",
      };
    }
  } catch (error) {
    console.error("Gemini demographic analysis error:", error);
    throw error;
  }
}

router.post("/analyze-demographics", async (req, res) => {
  try {
    if (!genAI) {
      return res.status(503).json({
        success: false,
        error: "AI service is not configured. Please contact support.",
      });
    }

    const { address, radius = 3, analysisFocus = "comprehensive" } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: "Please provide an address or ZIP code to analyze.",
      });
    }

    const radiusNum = Math.min(Math.max(parseFloat(radius) || 3, 1), 10);
    
    const result = await analyzeDemographics(address, radiusNum, analysisFocus);

    return res.json(result);
  } catch (error: any) {
    console.error("Demographic analysis error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze demographics. Please try again.",
    });
  }
});

// Alias endpoint for demographic clustering (same functionality, different route name)
router.post("/cluster-demographics", async (req, res) => {
  try {
    if (!genAI) {
      return res.status(503).json({
        success: false,
        error: "AI service is not configured. Please contact support.",
      });
    }

    const { address, radius = 3, analysisFocus = "comprehensive" } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: "Please provide an address or ZIP code to analyze.",
      });
    }

    const radiusNum = Math.min(Math.max(parseFloat(radius) || 3, 1), 10);
    
    const result = await analyzeDemographics(address, radiusNum, analysisFocus);

    return res.json(result);
  } catch (error: any) {
    console.error("Demographic clustering error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to cluster demographics. Please try again.",
    });
  }
});

// ============================================================================
// UTILITY LOAD FORECASTER - AI-powered utility usage prediction
// ============================================================================

export interface UtilityHistoryEntry {
  month: string;
  electric: number;
  gas: number;
  water: number;
}

export interface UtilityLoadForecastResult {
  success: boolean;
  data: {
    forecast: Array<{
      month: string;
      electric: { predicted: number; low: number; high: number };
      gas: { predicted: number; low: number; high: number };
      water: { predicted: number; low: number; high: number };
      totalCost: { predicted: number; low: number; high: number };
    }>;
    peakDemand: {
      electric: { month: string; value: number; reason: string };
      gas: { month: string; value: number; reason: string };
      water: { month: string; value: number; reason: string };
    };
    seasonalFactors: {
      electric: Array<{ season: string; factor: number; explanation: string }>;
      gas: Array<{ season: string; factor: number; explanation: string }>;
      water: Array<{ season: string; factor: number; explanation: string }>;
    };
    anomalies: Array<{
      type: "spike" | "drop" | "trend" | "pattern";
      utility: "electric" | "gas" | "water";
      description: string;
      severity: "low" | "medium" | "high";
      recommendation: string;
    }>;
    efficiencyOpportunities: Array<{
      category: string;
      opportunity: string;
      estimatedSavings: number;
      estimatedSavingsPercent: number;
      implementation: string;
      priority: "high" | "medium" | "low";
      paybackMonths: number;
    }>;
    costOptimization: Array<{
      strategy: string;
      description: string;
      potentialSavings: number;
      difficulty: "easy" | "moderate" | "complex";
    }>;
    budgetSummary: {
      monthlyAverage: { predicted: number; low: number; high: number };
      annualTotal: { predicted: number; low: number; high: number };
      quarterlyBreakdown: Array<{
        quarter: string;
        total: number;
        percentOfAnnual: number;
      }>;
      yearOverYearChange: number;
      budgetRecommendation: string;
    };
  };
  confidence: number;
  error?: string;
}

async function forecastUtilityLoad(
  historicalData: UtilityHistoryEntry[],
  machineCount: number,
  operatingHours: number,
  rates: { electric: number; gas: number; water: number }
): Promise<UtilityLoadForecastResult> {
  if (!genAI) {
    throw new Error("Gemini AI is not configured");
  }

  const historyText = historicalData
    .map(h => `${h.month}: Electric $${h.electric}, Gas $${h.gas}, Water $${h.water}`)
    .join("\n");

  const prompt = `You are an expert utility cost analyst for laundromats with 15+ years of experience in commercial utility management and energy efficiency.

LAUNDROMAT UTILITY DATA:
Historical Monthly Bills:
${historyText}

Operation Details:
- Number of Machines: ${machineCount}
- Operating Hours per Day: ${operatingHours}
- Current Rates: Electric $${rates.electric}/kWh, Gas $${rates.gas}/therm, Water $${rates.water}/gallon

Based on this data, provide a comprehensive 12-month utility forecast with the following:

1. **12-Month Forecast**: Project costs for the next 12 months with confidence intervals (low/predicted/high)
2. **Peak Demand Predictions**: Identify which months will have highest usage for each utility and why
3. **Seasonal Adjustment Factors**: Calculate seasonal multipliers for each utility type
4. **Anomaly Detection**: Identify any unusual patterns in the historical data
5. **Energy Efficiency Opportunities**: Recommend specific improvements with ROI estimates
6. **Cost Optimization Strategies**: Suggest ways to reduce costs
7. **Budget Planning**: Provide quarterly and annual budget recommendations

Consider:
- Seasonal variations (summer AC, winter heating, holiday patterns)
- Machine count impact on baseline consumption
- Operating hours correlation
- Industry benchmarks for laundromats
- Rate increase trends (typically 3-5% annually)

Return ONLY valid JSON in this exact format:
{
  "forecast": [
    {
      "month": "January 2025",
      "electric": { "predicted": 850, "low": 780, "high": 920 },
      "gas": { "predicted": 520, "low": 480, "high": 560 },
      "water": { "predicted": 380, "low": 350, "high": 410 },
      "totalCost": { "predicted": 1750, "low": 1610, "high": 1890 }
    }
  ],
  "peakDemand": {
    "electric": { "month": "July", "value": 1200, "reason": "Summer cooling loads" },
    "gas": { "month": "January", "value": 680, "reason": "Winter heating" },
    "water": { "month": "July", "value": 450, "reason": "Higher customer traffic" }
  },
  "seasonalFactors": {
    "electric": [
      { "season": "Winter", "factor": 0.9, "explanation": "Lower AC usage" },
      { "season": "Spring", "factor": 1.0, "explanation": "Baseline usage" },
      { "season": "Summer", "factor": 1.3, "explanation": "AC and dehumidification" },
      { "season": "Fall", "factor": 1.0, "explanation": "Return to baseline" }
    ],
    "gas": [
      { "season": "Winter", "factor": 1.4, "explanation": "Space heating needs" },
      { "season": "Spring", "factor": 0.9, "explanation": "Mild weather" },
      { "season": "Summer", "factor": 0.6, "explanation": "Dryers only" },
      { "season": "Fall", "factor": 1.1, "explanation": "Early heating" }
    ],
    "water": [
      { "season": "Winter", "factor": 0.95, "explanation": "Lower traffic" },
      { "season": "Spring", "factor": 1.0, "explanation": "Normal usage" },
      { "season": "Summer", "factor": 1.1, "explanation": "Higher customer volume" },
      { "season": "Fall", "factor": 0.95, "explanation": "Back to school slowdown" }
    ]
  },
  "anomalies": [
    {
      "type": "spike",
      "utility": "electric",
      "description": "Unusual spike detected in month X",
      "severity": "medium",
      "recommendation": "Check equipment efficiency"
    }
  ],
  "efficiencyOpportunities": [
    {
      "category": "Equipment",
      "opportunity": "Upgrade to Energy Star dryers",
      "estimatedSavings": 150,
      "estimatedSavingsPercent": 12,
      "implementation": "Replace 2-3 oldest units annually",
      "priority": "high",
      "paybackMonths": 24
    }
  ],
  "costOptimization": [
    {
      "strategy": "Off-peak operation",
      "description": "Shift heavy use to off-peak hours",
      "potentialSavings": 80,
      "difficulty": "easy"
    }
  ],
  "budgetSummary": {
    "monthlyAverage": { "predicted": 1650, "low": 1500, "high": 1800 },
    "annualTotal": { "predicted": 19800, "low": 18000, "high": 21600 },
    "quarterlyBreakdown": [
      { "quarter": "Q1", "total": 5200, "percentOfAnnual": 26 },
      { "quarter": "Q2", "total": 4600, "percentOfAnnual": 23 },
      { "quarter": "Q3", "total": 5400, "percentOfAnnual": 27 },
      { "quarter": "Q4", "total": 4600, "percentOfAnnual": 24 }
    ],
    "yearOverYearChange": 4.5,
    "budgetRecommendation": "Budget planning advice based on analysis"
  },
  "confidence": 0.85
}

Use realistic values based on the historical data provided. Project 12 months starting from the current month.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text() || "";

    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                        text.match(/```\n([\s\S]*?)\n```/) || 
                        [null, text];
      const jsonText = jsonMatch[1] || text;
      const parsed = JSON.parse(jsonText.trim());

      return {
        success: true,
        data: {
          forecast: Array.isArray(parsed.forecast) ? parsed.forecast : [],
          peakDemand: parsed.peakDemand || {
            electric: { month: "July", value: 0, reason: "Peak analysis pending" },
            gas: { month: "January", value: 0, reason: "Peak analysis pending" },
            water: { month: "July", value: 0, reason: "Peak analysis pending" },
          },
          seasonalFactors: parsed.seasonalFactors || {
            electric: [],
            gas: [],
            water: [],
          },
          anomalies: Array.isArray(parsed.anomalies) ? parsed.anomalies : [],
          efficiencyOpportunities: Array.isArray(parsed.efficiencyOpportunities) 
            ? parsed.efficiencyOpportunities 
            : [],
          costOptimization: Array.isArray(parsed.costOptimization) 
            ? parsed.costOptimization 
            : [],
          budgetSummary: parsed.budgetSummary || {
            monthlyAverage: { predicted: 0, low: 0, high: 0 },
            annualTotal: { predicted: 0, low: 0, high: 0 },
            quarterlyBreakdown: [],
            yearOverYearChange: 0,
            budgetRecommendation: "Analysis pending",
          },
        },
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.7,
      };
    } catch (parseError) {
      console.error("Failed to parse utility forecast response:", parseError);
      return {
        success: true,
        data: {
          forecast: [],
          peakDemand: {
            electric: { month: "July", value: 0, reason: "Analysis incomplete" },
            gas: { month: "January", value: 0, reason: "Analysis incomplete" },
            water: { month: "July", value: 0, reason: "Analysis incomplete" },
          },
          seasonalFactors: { electric: [], gas: [], water: [] },
          anomalies: [],
          efficiencyOpportunities: [],
          costOptimization: [],
          budgetSummary: {
            monthlyAverage: { predicted: 0, low: 0, high: 0 },
            annualTotal: { predicted: 0, low: 0, high: 0 },
            quarterlyBreakdown: [],
            yearOverYearChange: 0,
            budgetRecommendation: "Unable to generate forecast - please try again",
          },
        },
        confidence: 0.3,
        error: "Could not parse forecast data",
      };
    }
  } catch (error) {
    console.error("Gemini utility forecast error:", error);
    throw error;
  }
}

router.post("/forecast-utility-load", async (req, res) => {
  try {
    if (!genAI) {
      return res.status(503).json({
        success: false,
        error: "AI service is not configured. Please contact support.",
      });
    }

    const { 
      historicalData, 
      machineCount = 20, 
      operatingHours = 14,
      rates = { electric: 0.12, gas: 1.50, water: 0.005 }
    } = req.body;

    if (!historicalData || !Array.isArray(historicalData) || historicalData.length < 3) {
      return res.status(400).json({
        success: false,
        error: "Please provide at least 3 months of historical utility data.",
      });
    }

    const result = await forecastUtilityLoad(
      historicalData,
      Number(machineCount) || 20,
      Number(operatingHours) || 14,
      rates
    );

    return res.json(result);
  } catch (error: any) {
    console.error("Utility forecast error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate utility forecast. Please try again.",
    });
  }
});

export interface FaultClassificationResult {
  success: boolean;
  data: {
    equipmentType: string;
    symptomDescription: string;
    classification: {
      faultType: "mechanical" | "electrical" | "water" | "drainage" | "control" | "heating" | "motor" | "belt" | "sensor" | "other";
      specificProblem: string;
      severity: "Critical" | "Major" | "Minor" | "Routine";
      severityReason: string;
    };
    diagnosis: {
      rootCause: string;
      affectedComponents: string[];
      secondaryIssues: string[];
    };
    repairSteps: Array<{
      step: number;
      action: string;
      details: string;
      safetyNote?: string;
    }>;
    partsNeeded: Array<{
      partName: string;
      partNumber?: string;
      estimatedCost: string;
      priority: "required" | "recommended" | "optional";
    }>;
    timeEstimate: {
      minHours: number;
      maxHours: number;
      averageHours: number;
      factors: string[];
    };
    recommendation: {
      diyFeasibility: "DIY-Friendly" | "DIY-Possible" | "Professional-Recommended" | "Professional-Required";
      reason: string;
      skillLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
      toolsRequired: string[];
    };
    safetyWarnings: string[];
    additionalNotes: string[];
  };
  confidence: number;
  error?: string;
}

async function classifyMaintenanceFault(
  equipmentType: string,
  symptomDescription: string,
  imageBase64?: string,
  mimeType?: string
): Promise<FaultClassificationResult> {
  if (!genAI) {
    throw new Error("Gemini AI is not configured");
  }

  const prompt = `You are an expert commercial laundry equipment technician with 25+ years of experience diagnosing and repairing washers, dryers, washer-extractors, and related equipment from all major manufacturers (Speed Queen, Dexter, Continental/Girbau, Huebsch, Maytag, Whirlpool, Alliance, UniMac, etc.).

EQUIPMENT TO DIAGNOSE:
Equipment Type: ${equipmentType}
Symptom Description: ${symptomDescription}
${imageBase64 ? "A photo of the equipment/issue has been provided for visual analysis." : "No photo provided."}

Provide a comprehensive diagnostic analysis:

1. **Fault Classification**: 
   - Type: mechanical, electrical, water, drainage, control, heating, motor, belt, sensor, or other
   - Specific problem identification (e.g., "Worn drum bearing", "Clogged drain pump", "Faulty door latch switch")
   - Severity: Critical (machine unsafe/unusable), Major (significantly impaired), Minor (partially functional), Routine (maintenance issue)

2. **Root Cause Analysis**:
   - Most likely root cause
   - Affected components
   - Potential secondary issues to check

3. **Step-by-Step Repair Instructions**:
   - Numbered steps with clear actions
   - Include safety notes where applicable
   - Be specific to commercial laundry equipment

4. **Parts Needed**:
   - List specific parts with generic part descriptions
   - Include estimated costs (US dollars)
   - Mark as required, recommended, or optional

5. **Time Estimate**:
   - Minimum, maximum, and average repair time in hours
   - Factors that could affect timing

6. **DIY vs Professional Recommendation**:
   - DIY-Friendly (basic skills), DIY-Possible (intermediate), Professional-Recommended, or Professional-Required
   - Required skill level
   - Tools needed

7. **Safety Warnings**: List any relevant safety concerns

Return ONLY valid JSON in this exact format:
{
  "equipmentType": "${equipmentType}",
  "symptomDescription": "${symptomDescription}",
  "classification": {
    "faultType": "mechanical" | "electrical" | "water" | "drainage" | "control" | "heating" | "motor" | "belt" | "sensor" | "other",
    "specificProblem": "Specific problem description",
    "severity": "Critical" | "Major" | "Minor" | "Routine",
    "severityReason": "Why this severity level"
  },
  "diagnosis": {
    "rootCause": "Most likely root cause explanation",
    "affectedComponents": ["Component 1", "Component 2"],
    "secondaryIssues": ["Potential secondary issue to check"]
  },
  "repairSteps": [
    {
      "step": 1,
      "action": "Action title",
      "details": "Detailed instructions",
      "safetyNote": "Optional safety note"
    }
  ],
  "partsNeeded": [
    {
      "partName": "Part name",
      "partNumber": "Generic part number if known",
      "estimatedCost": "$XX-$XX",
      "priority": "required" | "recommended" | "optional"
    }
  ],
  "timeEstimate": {
    "minHours": 0.5,
    "maxHours": 2,
    "averageHours": 1,
    "factors": ["Factor 1", "Factor 2"]
  },
  "recommendation": {
    "diyFeasibility": "DIY-Friendly" | "DIY-Possible" | "Professional-Recommended" | "Professional-Required",
    "reason": "Why this recommendation",
    "skillLevel": "Beginner" | "Intermediate" | "Advanced" | "Expert",
    "toolsRequired": ["Tool 1", "Tool 2"]
  },
  "safetyWarnings": ["Warning 1", "Warning 2"],
  "additionalNotes": ["Additional helpful note"],
  "confidence": 0.85
}

Be practical and accurate. Base your diagnosis on common commercial laundry equipment issues. Include manufacturer-specific tips when relevant.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const contentParts: any[] = [prompt];
    
    if (imageBase64 && mimeType) {
      contentParts.push({
        inlineData: {
          mimeType: mimeType,
          data: imageBase64,
        },
      });
    }

    const result = await model.generateContent(contentParts);
    const response = result.response;
    const text = response.text() || "";

    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                        text.match(/```\n([\s\S]*?)\n```/) || 
                        [null, text];
      const jsonText = jsonMatch[1] || text;
      const parsed = JSON.parse(jsonText.trim());

      return {
        success: true,
        data: {
          equipmentType: parsed.equipmentType || equipmentType,
          symptomDescription: parsed.symptomDescription || symptomDescription,
          classification: {
            faultType: parsed.classification?.faultType || "other",
            specificProblem: parsed.classification?.specificProblem || "Unable to determine specific problem",
            severity: parsed.classification?.severity || "Minor",
            severityReason: parsed.classification?.severityReason || "Severity assessment pending",
          },
          diagnosis: {
            rootCause: parsed.diagnosis?.rootCause || "Further inspection needed",
            affectedComponents: Array.isArray(parsed.diagnosis?.affectedComponents) 
              ? parsed.diagnosis.affectedComponents 
              : [],
            secondaryIssues: Array.isArray(parsed.diagnosis?.secondaryIssues) 
              ? parsed.diagnosis.secondaryIssues 
              : [],
          },
          repairSteps: Array.isArray(parsed.repairSteps) 
            ? parsed.repairSteps.map((step: any, idx: number) => ({
                step: step.step || idx + 1,
                action: step.action || "Step action",
                details: step.details || "",
                safetyNote: step.safetyNote,
              }))
            : [],
          partsNeeded: Array.isArray(parsed.partsNeeded) 
            ? parsed.partsNeeded.map((part: any) => ({
                partName: part.partName || "Unknown part",
                partNumber: part.partNumber,
                estimatedCost: part.estimatedCost || "Contact supplier",
                priority: part.priority || "recommended",
              }))
            : [],
          timeEstimate: {
            minHours: typeof parsed.timeEstimate?.minHours === "number" ? parsed.timeEstimate.minHours : 0.5,
            maxHours: typeof parsed.timeEstimate?.maxHours === "number" ? parsed.timeEstimate.maxHours : 4,
            averageHours: typeof parsed.timeEstimate?.averageHours === "number" ? parsed.timeEstimate.averageHours : 2,
            factors: Array.isArray(parsed.timeEstimate?.factors) ? parsed.timeEstimate.factors : [],
          },
          recommendation: {
            diyFeasibility: parsed.recommendation?.diyFeasibility || "Professional-Recommended",
            reason: parsed.recommendation?.reason || "Consult a professional for accurate diagnosis",
            skillLevel: parsed.recommendation?.skillLevel || "Intermediate",
            toolsRequired: Array.isArray(parsed.recommendation?.toolsRequired) 
              ? parsed.recommendation.toolsRequired 
              : [],
          },
          safetyWarnings: Array.isArray(parsed.safetyWarnings) ? parsed.safetyWarnings : [],
          additionalNotes: Array.isArray(parsed.additionalNotes) ? parsed.additionalNotes : [],
        },
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.7,
      };
    } catch (parseError) {
      console.error("Failed to parse fault classification response:", parseError);
      return {
        success: true,
        data: {
          equipmentType,
          symptomDescription,
          classification: {
            faultType: "other",
            specificProblem: "Unable to parse diagnosis - manual inspection recommended",
            severity: "Minor",
            severityReason: "Could not determine severity",
          },
          diagnosis: {
            rootCause: "Analysis incomplete - please try again or consult a technician",
            affectedComponents: [],
            secondaryIssues: [],
          },
          repairSteps: [],
          partsNeeded: [],
          timeEstimate: {
            minHours: 1,
            maxHours: 4,
            averageHours: 2,
            factors: ["Requires on-site inspection"],
          },
          recommendation: {
            diyFeasibility: "Professional-Recommended",
            reason: "Unable to complete remote diagnosis",
            skillLevel: "Intermediate",
            toolsRequired: [],
          },
          safetyWarnings: ["Always disconnect power before inspecting electrical components"],
          additionalNotes: ["Please try again with more details or clearer photo"],
        },
        confidence: 0.3,
        error: "Could not parse diagnostic data from AI response",
      };
    }
  } catch (error) {
    console.error("Gemini fault classification error:", error);
    throw error;
  }
}

router.post("/classify-fault", upload.single("image"), async (req, res) => {
  try {
    if (!genAI) {
      return res.status(503).json({
        success: false,
        error: "AI service is not configured. Please contact support.",
      });
    }

    const { equipmentType, symptomDescription } = req.body;

    if (!equipmentType || !symptomDescription) {
      return res.status(400).json({
        success: false,
        error: "Please provide equipment type and symptom description.",
      });
    }

    let imageBase64: string | undefined;
    let mimeType: string | undefined;

    if (req.file) {
      imageBase64 = req.file.buffer.toString("base64");
      mimeType = req.file.mimetype;
    }

    const result = await classifyMaintenanceFault(
      equipmentType,
      symptomDescription,
      imageBase64,
      mimeType
    );

    return res.json(result);
  } catch (error: any) {
    console.error("Fault classification error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to classify fault. Please try again.",
    });
  }
});

// ============================================================================
// PRICING ELASTICITY MODELER - AI-powered price optimization analysis
// ============================================================================

export interface PricingElasticityResult {
  success: boolean;
  data: {
    currentPricing: {
      washPrice: number;
      dryPrice: number;
      wdfPricePerLb: number;
    };
    elasticityAnalysis: {
      washElasticity: {
        coefficient: number;
        classification: "inelastic" | "unit-elastic" | "elastic";
        interpretation: string;
      };
      dryElasticity: {
        coefficient: number;
        classification: "inelastic" | "unit-elastic" | "elastic";
        interpretation: string;
      };
      wdfElasticity: {
        coefficient: number;
        classification: "inelastic" | "unit-elastic" | "elastic";
        interpretation: string;
      };
      overallSensitivity: "low" | "moderate" | "high";
      marketConditions: string;
    };
    revenueImpact: Array<{
      priceChange: number;
      washRevenue: number;
      dryRevenue: number;
      wdfRevenue: number;
      totalRevenue: number;
      changePercent: number;
    }>;
    optimalPricing: {
      maxRevenue: {
        washPrice: number;
        dryPrice: number;
        wdfPricePerLb: number;
        estimatedRevenue: number;
        revenueIncrease: number;
      };
      maxProfit: {
        washPrice: number;
        dryPrice: number;
        wdfPricePerLb: number;
        estimatedProfit: number;
        profitIncrease: number;
        assumptions: string;
      };
    };
    competitorAnalysis: {
      yourPosition: "below-market" | "at-market" | "above-market";
      pricingGap: {
        wash: number;
        dry: number;
        wdf: number;
      };
      marketAverage: {
        wash: number;
        dry: number;
        wdf: number;
      };
      recommendation: string;
    };
    customerSensitivity: {
      priceConscious: number;
      qualityFocused: number;
      convenienceDriven: number;
      loyalCustomers: number;
      segments: Array<{
        segment: string;
        sensitivity: "low" | "medium" | "high";
        recommendation: string;
      }>;
    };
    recommendations: Array<{
      action: string;
      priority: "high" | "medium" | "low";
      expectedImpact: string;
      implementation: string;
    }>;
  };
  confidence: number;
  error?: string;
}

async function analyzePricingElasticity(
  washPrice: number,
  dryPrice: number,
  wdfPricePerLb: number,
  monthlyWashCycles: number,
  monthlyDryCycles: number,
  monthlyWdfLbs: number,
  competitorWashPrice?: number,
  competitorDryPrice?: number,
  competitorWdfPrice?: number,
  areaType?: string,
  customerDemographics?: string
): Promise<PricingElasticityResult> {
  if (!genAI) {
    throw new Error("Gemini AI is not configured");
  }

  const currentMonthlyRevenue = 
    (washPrice * monthlyWashCycles) + 
    (dryPrice * monthlyDryCycles) + 
    (wdfPricePerLb * monthlyWdfLbs);

  const prompt = `You are an expert pricing economist specializing in laundromat and laundry service businesses. Analyze the following pricing data and provide a comprehensive price elasticity analysis.

CURRENT PRICING:
- Wash Cycle Price: $${washPrice.toFixed(2)}
- Dry Cycle Price: $${dryPrice.toFixed(2)}  
- WDF (Wash-Dry-Fold) per lb: $${wdfPricePerLb.toFixed(2)}

CURRENT VOLUME (Monthly):
- Wash Cycles: ${monthlyWashCycles}
- Dry Cycles: ${monthlyDryCycles}
- WDF Pounds: ${monthlyWdfLbs}

CURRENT MONTHLY REVENUE: $${currentMonthlyRevenue.toFixed(2)}

${competitorWashPrice ? `COMPETITOR PRICING:
- Competitor Wash: $${competitorWashPrice.toFixed(2)}
- Competitor Dry: $${competitorDryPrice?.toFixed(2) || 'Unknown'}
- Competitor WDF/lb: $${competitorWdfPrice?.toFixed(2) || 'Unknown'}` : ''}

${areaType ? `AREA TYPE: ${areaType}` : ''}
${customerDemographics ? `CUSTOMER DEMOGRAPHICS: ${customerDemographics}` : ''}

Provide a comprehensive price elasticity analysis including:

1. **Elasticity Coefficients**: For each service (wash, dry, WDF), estimate the price elasticity coefficient. Use standard economic interpretation:
   - |E| < 1: Inelastic (quantity changes less than price)
   - |E| = 1: Unit elastic
   - |E| > 1: Elastic (quantity changes more than price)

2. **Revenue Impact Table**: Show estimated revenue at price changes from -20% to +20% (in 5% increments)

3. **Optimal Pricing**: 
   - Price points that maximize REVENUE
   - Price points that maximize PROFIT (assume 70% gross margin on WDF, 80% on self-service)

4. **Competitor Positioning**: How does current pricing compare to market averages and competitors?

5. **Customer Sensitivity Analysis**: Break down customer segments by price sensitivity

6. **Recommendations**: Actionable pricing recommendations with expected impact

Return ONLY valid JSON in this exact format:
{
  "currentPricing": {
    "washPrice": ${washPrice},
    "dryPrice": ${dryPrice},
    "wdfPricePerLb": ${wdfPricePerLb}
  },
  "elasticityAnalysis": {
    "washElasticity": {
      "coefficient": -0.6,
      "classification": "inelastic",
      "interpretation": "Description of what this means for pricing"
    },
    "dryElasticity": {
      "coefficient": -0.5,
      "classification": "inelastic",
      "interpretation": "Description"
    },
    "wdfElasticity": {
      "coefficient": -1.2,
      "classification": "elastic",
      "interpretation": "Description"
    },
    "overallSensitivity": "moderate",
    "marketConditions": "Analysis of current market conditions"
  },
  "revenueImpact": [
    {"priceChange": -20, "washRevenue": 0, "dryRevenue": 0, "wdfRevenue": 0, "totalRevenue": 0, "changePercent": 0},
    {"priceChange": -15, "washRevenue": 0, "dryRevenue": 0, "wdfRevenue": 0, "totalRevenue": 0, "changePercent": 0},
    {"priceChange": -10, "washRevenue": 0, "dryRevenue": 0, "wdfRevenue": 0, "totalRevenue": 0, "changePercent": 0},
    {"priceChange": -5, "washRevenue": 0, "dryRevenue": 0, "wdfRevenue": 0, "totalRevenue": 0, "changePercent": 0},
    {"priceChange": 0, "washRevenue": ${(washPrice * monthlyWashCycles).toFixed(0)}, "dryRevenue": ${(dryPrice * monthlyDryCycles).toFixed(0)}, "wdfRevenue": ${(wdfPricePerLb * monthlyWdfLbs).toFixed(0)}, "totalRevenue": ${currentMonthlyRevenue.toFixed(0)}, "changePercent": 0},
    {"priceChange": 5, "washRevenue": 0, "dryRevenue": 0, "wdfRevenue": 0, "totalRevenue": 0, "changePercent": 0},
    {"priceChange": 10, "washRevenue": 0, "dryRevenue": 0, "wdfRevenue": 0, "totalRevenue": 0, "changePercent": 0},
    {"priceChange": 15, "washRevenue": 0, "dryRevenue": 0, "wdfRevenue": 0, "totalRevenue": 0, "changePercent": 0},
    {"priceChange": 20, "washRevenue": 0, "dryRevenue": 0, "wdfRevenue": 0, "totalRevenue": 0, "changePercent": 0}
  ],
  "optimalPricing": {
    "maxRevenue": {
      "washPrice": 0,
      "dryPrice": 0,
      "wdfPricePerLb": 0,
      "estimatedRevenue": 0,
      "revenueIncrease": 0
    },
    "maxProfit": {
      "washPrice": 0,
      "dryPrice": 0,
      "wdfPricePerLb": 0,
      "estimatedProfit": 0,
      "profitIncrease": 0,
      "assumptions": "Based on 80% margin for self-service, 70% for WDF"
    }
  },
  "competitorAnalysis": {
    "yourPosition": "at-market",
    "pricingGap": {
      "wash": 0,
      "dry": 0,
      "wdf": 0
    },
    "marketAverage": {
      "wash": 3.50,
      "dry": 2.50,
      "wdf": 1.75
    },
    "recommendation": "Specific recommendation about competitive positioning"
  },
  "customerSensitivity": {
    "priceConscious": 35,
    "qualityFocused": 25,
    "convenienceDriven": 25,
    "loyalCustomers": 15,
    "segments": [
      {
        "segment": "Budget Seekers",
        "sensitivity": "high",
        "recommendation": "Action for this segment"
      },
      {
        "segment": "Premium Customers",
        "sensitivity": "low",
        "recommendation": "Action for this segment"
      }
    ]
  },
  "recommendations": [
    {
      "action": "Specific pricing action",
      "priority": "high",
      "expectedImpact": "Expected outcome",
      "implementation": "How to implement"
    }
  ],
  "confidence": 0.8
}

Be realistic with elasticity coefficients - laundry services are typically inelastic as they are necessity services. 
Use industry knowledge to estimate realistic values.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text() || "";

    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                        text.match(/```\n([\s\S]*?)\n```/) || 
                        [null, text];
      const jsonText = jsonMatch[1] || text;
      const parsed = JSON.parse(jsonText.trim());

      return {
        success: true,
        data: {
          currentPricing: {
            washPrice: parsed.currentPricing?.washPrice || washPrice,
            dryPrice: parsed.currentPricing?.dryPrice || dryPrice,
            wdfPricePerLb: parsed.currentPricing?.wdfPricePerLb || wdfPricePerLb,
          },
          elasticityAnalysis: {
            washElasticity: {
              coefficient: parsed.elasticityAnalysis?.washElasticity?.coefficient || -0.6,
              classification: parsed.elasticityAnalysis?.washElasticity?.classification || "inelastic",
              interpretation: parsed.elasticityAnalysis?.washElasticity?.interpretation || "Self-service wash is typically inelastic",
            },
            dryElasticity: {
              coefficient: parsed.elasticityAnalysis?.dryElasticity?.coefficient || -0.5,
              classification: parsed.elasticityAnalysis?.dryElasticity?.classification || "inelastic",
              interpretation: parsed.elasticityAnalysis?.dryElasticity?.interpretation || "Dryer service shows low price sensitivity",
            },
            wdfElasticity: {
              coefficient: parsed.elasticityAnalysis?.wdfElasticity?.coefficient || -1.1,
              classification: parsed.elasticityAnalysis?.wdfElasticity?.classification || "elastic",
              interpretation: parsed.elasticityAnalysis?.wdfElasticity?.interpretation || "WDF service is more price sensitive",
            },
            overallSensitivity: parsed.elasticityAnalysis?.overallSensitivity || "moderate",
            marketConditions: parsed.elasticityAnalysis?.marketConditions || "Standard market conditions",
          },
          revenueImpact: Array.isArray(parsed.revenueImpact) ? parsed.revenueImpact : [],
          optimalPricing: {
            maxRevenue: {
              washPrice: parsed.optimalPricing?.maxRevenue?.washPrice || washPrice * 1.05,
              dryPrice: parsed.optimalPricing?.maxRevenue?.dryPrice || dryPrice * 1.05,
              wdfPricePerLb: parsed.optimalPricing?.maxRevenue?.wdfPricePerLb || wdfPricePerLb,
              estimatedRevenue: parsed.optimalPricing?.maxRevenue?.estimatedRevenue || currentMonthlyRevenue * 1.08,
              revenueIncrease: parsed.optimalPricing?.maxRevenue?.revenueIncrease || 8,
            },
            maxProfit: {
              washPrice: parsed.optimalPricing?.maxProfit?.washPrice || washPrice * 1.1,
              dryPrice: parsed.optimalPricing?.maxProfit?.dryPrice || dryPrice * 1.1,
              wdfPricePerLb: parsed.optimalPricing?.maxProfit?.wdfPricePerLb || wdfPricePerLb * 1.05,
              estimatedProfit: parsed.optimalPricing?.maxProfit?.estimatedProfit || currentMonthlyRevenue * 0.85,
              profitIncrease: parsed.optimalPricing?.maxProfit?.profitIncrease || 12,
              assumptions: parsed.optimalPricing?.maxProfit?.assumptions || "Based on 80% margin for self-service, 70% for WDF",
            },
          },
          competitorAnalysis: {
            yourPosition: parsed.competitorAnalysis?.yourPosition || "at-market",
            pricingGap: {
              wash: parsed.competitorAnalysis?.pricingGap?.wash || 0,
              dry: parsed.competitorAnalysis?.pricingGap?.dry || 0,
              wdf: parsed.competitorAnalysis?.pricingGap?.wdf || 0,
            },
            marketAverage: {
              wash: parsed.competitorAnalysis?.marketAverage?.wash || 3.50,
              dry: parsed.competitorAnalysis?.marketAverage?.dry || 2.50,
              wdf: parsed.competitorAnalysis?.marketAverage?.wdf || 1.75,
            },
            recommendation: parsed.competitorAnalysis?.recommendation || "Monitor competitor pricing and adjust accordingly",
          },
          customerSensitivity: {
            priceConscious: parsed.customerSensitivity?.priceConscious || 35,
            qualityFocused: parsed.customerSensitivity?.qualityFocused || 25,
            convenienceDriven: parsed.customerSensitivity?.convenienceDriven || 25,
            loyalCustomers: parsed.customerSensitivity?.loyalCustomers || 15,
            segments: Array.isArray(parsed.customerSensitivity?.segments) 
              ? parsed.customerSensitivity.segments 
              : [],
          },
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        },
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.75,
      };
    } catch (parseError) {
      console.error("Failed to parse pricing elasticity response:", parseError);
      return {
        success: true,
        data: {
          currentPricing: { washPrice, dryPrice, wdfPricePerLb },
          elasticityAnalysis: {
            washElasticity: { coefficient: -0.6, classification: "inelastic", interpretation: "Self-service wash is typically inelastic due to necessity" },
            dryElasticity: { coefficient: -0.5, classification: "inelastic", interpretation: "Dryer service shows low price sensitivity" },
            wdfElasticity: { coefficient: -1.1, classification: "elastic", interpretation: "WDF competes with home washing and is more price sensitive" },
            overallSensitivity: "moderate",
            marketConditions: "Unable to fully analyze - using industry averages",
          },
          revenueImpact: [],
          optimalPricing: {
            maxRevenue: {
              washPrice: washPrice * 1.05,
              dryPrice: dryPrice * 1.05,
              wdfPricePerLb: wdfPricePerLb,
              estimatedRevenue: currentMonthlyRevenue * 1.08,
              revenueIncrease: 8,
            },
            maxProfit: {
              washPrice: washPrice * 1.1,
              dryPrice: dryPrice * 1.1,
              wdfPricePerLb: wdfPricePerLb * 1.05,
              estimatedProfit: currentMonthlyRevenue * 0.85,
              profitIncrease: 12,
              assumptions: "Based on industry standard margins",
            },
          },
          competitorAnalysis: {
            yourPosition: "at-market",
            pricingGap: { wash: 0, dry: 0, wdf: 0 },
            marketAverage: { wash: 3.50, dry: 2.50, wdf: 1.75 },
            recommendation: "Further analysis needed - please try again",
          },
          customerSensitivity: {
            priceConscious: 35,
            qualityFocused: 25,
            convenienceDriven: 25,
            loyalCustomers: 15,
            segments: [],
          },
          recommendations: [
            {
              action: "Rerun analysis with complete data",
              priority: "high" as const,
              expectedImpact: "More accurate elasticity estimates",
              implementation: "Provide competitor pricing and demographic data",
            },
          ],
        },
        confidence: 0.4,
        error: "Partial analysis completed - some data could not be parsed",
      };
    }
  } catch (error) {
    console.error("Gemini pricing elasticity error:", error);
    throw error;
  }
}

router.post("/model-pricing-elasticity", async (req, res) => {
  try {
    if (!genAI) {
      return res.status(503).json({
        success: false,
        error: "AI service is not configured. Please contact support.",
      });
    }

    const {
      washPrice,
      dryPrice,
      wdfPricePerLb,
      monthlyWashCycles,
      monthlyDryCycles,
      monthlyWdfLbs,
      competitorWashPrice,
      competitorDryPrice,
      competitorWdfPrice,
      areaType,
      customerDemographics,
    } = req.body;

    if (!washPrice || !dryPrice || !wdfPricePerLb) {
      return res.status(400).json({
        success: false,
        error: "Please provide current prices for wash, dry, and WDF services.",
      });
    }

    if (!monthlyWashCycles || !monthlyDryCycles || !monthlyWdfLbs) {
      return res.status(400).json({
        success: false,
        error: "Please provide current monthly volume for all services.",
      });
    }

    const result = await analyzePricingElasticity(
      parseFloat(washPrice),
      parseFloat(dryPrice),
      parseFloat(wdfPricePerLb),
      parseInt(monthlyWashCycles),
      parseInt(monthlyDryCycles),
      parseInt(monthlyWdfLbs),
      competitorWashPrice ? parseFloat(competitorWashPrice) : undefined,
      competitorDryPrice ? parseFloat(competitorDryPrice) : undefined,
      competitorWdfPrice ? parseFloat(competitorWdfPrice) : undefined,
      areaType,
      customerDemographics
    );

    return res.json(result);
  } catch (error: any) {
    console.error("Pricing elasticity analysis error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze pricing elasticity. Please try again.",
    });
  }
});

// ============================================================================
// MARKETING CAMPAIGN ATTRIBUTION ENGINE - AI-powered marketing ROI analysis
// ============================================================================

export interface CampaignData {
  id: string;
  name: string;
  channel: "social" | "email" | "flyers" | "referral" | "google_ads" | "direct_mail" | "local_seo" | "partnerships" | "other";
  spend: number;
  startDate: string;
  endDate: string;
  revenue: number;
  newCustomers: number;
}

export interface AttributionResult {
  success: boolean;
  data: {
    summary: {
      totalSpend: number;
      totalRevenue: number;
      totalNewCustomers: number;
      overallROI: number;
      overallCPA: number;
      bestPerformingChannel: string;
      worstPerformingChannel: string;
    };
    attributionModels: {
      firstTouch: Array<{
        campaignId: string;
        campaignName: string;
        attributedRevenue: number;
        attributedCustomers: number;
        attributionPercent: number;
      }>;
      lastTouch: Array<{
        campaignId: string;
        campaignName: string;
        attributedRevenue: number;
        attributedCustomers: number;
        attributionPercent: number;
      }>;
      linear: Array<{
        campaignId: string;
        campaignName: string;
        attributedRevenue: number;
        attributedCustomers: number;
        attributionPercent: number;
      }>;
      timeDecay: Array<{
        campaignId: string;
        campaignName: string;
        attributedRevenue: number;
        attributedCustomers: number;
        attributionPercent: number;
      }>;
    };
    channelPerformance: Array<{
      channel: string;
      totalSpend: number;
      totalRevenue: number;
      roi: number;
      cpa: number;
      newCustomers: number;
      efficiency: "excellent" | "good" | "average" | "poor";
    }>;
    campaignPerformance: Array<{
      id: string;
      name: string;
      channel: string;
      spend: number;
      revenue: number;
      roi: number;
      cpa: number;
      newCustomers: number;
      ltv: number;
      status: "scale" | "maintain" | "optimize" | "cut";
      recommendation: string;
    }>;
    budgetRecommendations: {
      currentAllocation: Array<{ channel: string; percent: number; amount: number }>;
      recommendedAllocation: Array<{ channel: string; percent: number; amount: number; change: string }>;
      projectedImpact: {
        revenueIncrease: number;
        roiImprovement: number;
        cpaReduction: number;
      };
    };
    cutScaleRecommendations: {
      scale: Array<{ campaign: string; reason: string; suggestedIncrease: string }>;
      maintain: Array<{ campaign: string; reason: string }>;
      optimize: Array<{ campaign: string; reason: string; suggestion: string }>;
      cut: Array<{ campaign: string; reason: string; potentialSavings: number }>;
    };
    insights: Array<{
      type: "success" | "warning" | "opportunity" | "insight";
      title: string;
      description: string;
      actionable: string;
    }>;
  };
  confidence: number;
  error?: string;
}

async function analyzeMarketingAttribution(
  campaigns: CampaignData[],
  attributionModel: string
): Promise<AttributionResult> {
  if (!genAI) {
    throw new Error("Gemini AI is not configured");
  }

  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const totalCustomers = campaigns.reduce((sum, c) => sum + c.newCustomers, 0);

  const prompt = `You are an expert marketing analytics consultant specializing in laundromat and local service business marketing. Analyze these marketing campaigns and provide comprehensive attribution analysis.

CAMPAIGN DATA:
${JSON.stringify(campaigns, null, 2)}

ANALYSIS PARAMETERS:
- Primary Attribution Model: ${attributionModel}
- Total Marketing Spend: $${totalSpend.toLocaleString()}
- Total Revenue During Period: $${totalRevenue.toLocaleString()}
- Total New Customers Acquired: ${totalCustomers}

INDUSTRY CONTEXT (Laundromat Marketing Benchmarks):
- Average CPA for laundromats: $15-35 per new customer
- Good marketing ROI: 300-500%
- Excellent marketing ROI: 500%+
- Average customer LTV: $1,152 (24 months × $12/visit × 4 visits/month)

Provide a comprehensive analysis including:

1. **Attribution Models**: Calculate revenue/customer attribution using:
   - First-touch: Credit to first campaign touchpoint
   - Last-touch: Credit to final campaign before conversion
   - Linear: Equal credit across all campaigns
   - Time-decay: More credit to recent campaigns

2. **Channel Performance**: Aggregate performance by channel type with ROI, CPA, efficiency rating

3. **Campaign Performance**: Individual campaign analysis with clear status recommendations

4. **Budget Recommendations**: Current vs optimal allocation with projected impact

5. **Cut/Scale Recommendations**: Clear action items for each campaign

6. **AI Insights**: 4-6 actionable insights about the marketing strategy

Return ONLY valid JSON in this exact format:
{
  "summary": {
    "totalSpend": ${totalSpend},
    "totalRevenue": ${totalRevenue},
    "totalNewCustomers": ${totalCustomers},
    "overallROI": 0,
    "overallCPA": 0,
    "bestPerformingChannel": "channel_name",
    "worstPerformingChannel": "channel_name"
  },
  "attributionModels": {
    "firstTouch": [
      {"campaignId": "id", "campaignName": "name", "attributedRevenue": 0, "attributedCustomers": 0, "attributionPercent": 0}
    ],
    "lastTouch": [...],
    "linear": [...],
    "timeDecay": [...]
  },
  "channelPerformance": [
    {"channel": "social", "totalSpend": 0, "totalRevenue": 0, "roi": 0, "cpa": 0, "newCustomers": 0, "efficiency": "good"}
  ],
  "campaignPerformance": [
    {"id": "id", "name": "name", "channel": "social", "spend": 0, "revenue": 0, "roi": 0, "cpa": 0, "newCustomers": 0, "ltv": 1152, "status": "scale", "recommendation": "text"}
  ],
  "budgetRecommendations": {
    "currentAllocation": [{"channel": "social", "percent": 25, "amount": 1000}],
    "recommendedAllocation": [{"channel": "social", "percent": 35, "amount": 1400, "change": "+10%"}],
    "projectedImpact": {"revenueIncrease": 0, "roiImprovement": 0, "cpaReduction": 0}
  },
  "cutScaleRecommendations": {
    "scale": [{"campaign": "name", "reason": "High ROI", "suggestedIncrease": "25%"}],
    "maintain": [{"campaign": "name", "reason": "Steady performance"}],
    "optimize": [{"campaign": "name", "reason": "Below target", "suggestion": "Improve targeting"}],
    "cut": [{"campaign": "name", "reason": "Negative ROI", "potentialSavings": 500}]
  },
  "insights": [
    {"type": "success", "title": "Title", "description": "Description", "actionable": "Action to take"}
  ],
  "confidence": 0.85
}

Be data-driven and provide specific, actionable recommendations based on the actual campaign data.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text() || "";

    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                        text.match(/```\n([\s\S]*?)\n```/) || 
                        [null, text];
      const jsonText = jsonMatch[1] || text;
      const parsed = JSON.parse(jsonText.trim());

      return {
        success: true,
        data: {
          summary: {
            totalSpend: parsed.summary?.totalSpend || totalSpend,
            totalRevenue: parsed.summary?.totalRevenue || totalRevenue,
            totalNewCustomers: parsed.summary?.totalNewCustomers || totalCustomers,
            overallROI: parsed.summary?.overallROI || ((totalRevenue - totalSpend) / totalSpend * 100),
            overallCPA: parsed.summary?.overallCPA || (totalCustomers > 0 ? totalSpend / totalCustomers : 0),
            bestPerformingChannel: parsed.summary?.bestPerformingChannel || "Unknown",
            worstPerformingChannel: parsed.summary?.worstPerformingChannel || "Unknown",
          },
          attributionModels: {
            firstTouch: Array.isArray(parsed.attributionModels?.firstTouch) ? parsed.attributionModels.firstTouch : [],
            lastTouch: Array.isArray(parsed.attributionModels?.lastTouch) ? parsed.attributionModels.lastTouch : [],
            linear: Array.isArray(parsed.attributionModels?.linear) ? parsed.attributionModels.linear : [],
            timeDecay: Array.isArray(parsed.attributionModels?.timeDecay) ? parsed.attributionModels.timeDecay : [],
          },
          channelPerformance: Array.isArray(parsed.channelPerformance) ? parsed.channelPerformance : [],
          campaignPerformance: Array.isArray(parsed.campaignPerformance) ? parsed.campaignPerformance : [],
          budgetRecommendations: {
            currentAllocation: Array.isArray(parsed.budgetRecommendations?.currentAllocation) ? parsed.budgetRecommendations.currentAllocation : [],
            recommendedAllocation: Array.isArray(parsed.budgetRecommendations?.recommendedAllocation) ? parsed.budgetRecommendations.recommendedAllocation : [],
            projectedImpact: {
              revenueIncrease: parsed.budgetRecommendations?.projectedImpact?.revenueIncrease || 0,
              roiImprovement: parsed.budgetRecommendations?.projectedImpact?.roiImprovement || 0,
              cpaReduction: parsed.budgetRecommendations?.projectedImpact?.cpaReduction || 0,
            },
          },
          cutScaleRecommendations: {
            scale: Array.isArray(parsed.cutScaleRecommendations?.scale) ? parsed.cutScaleRecommendations.scale : [],
            maintain: Array.isArray(parsed.cutScaleRecommendations?.maintain) ? parsed.cutScaleRecommendations.maintain : [],
            optimize: Array.isArray(parsed.cutScaleRecommendations?.optimize) ? parsed.cutScaleRecommendations.optimize : [],
            cut: Array.isArray(parsed.cutScaleRecommendations?.cut) ? parsed.cutScaleRecommendations.cut : [],
          },
          insights: Array.isArray(parsed.insights) ? parsed.insights : [],
        },
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.75,
      };
    } catch (parseError) {
      console.error("Failed to parse Gemini attribution response:", parseError);
      const overallROI = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend * 100) : 0;
      const overallCPA = totalCustomers > 0 ? totalSpend / totalCustomers : 0;
      
      return {
        success: true,
        data: {
          summary: {
            totalSpend,
            totalRevenue,
            totalNewCustomers: totalCustomers,
            overallROI,
            overallCPA,
            bestPerformingChannel: "Analysis incomplete",
            worstPerformingChannel: "Analysis incomplete",
          },
          attributionModels: { firstTouch: [], lastTouch: [], linear: [], timeDecay: [] },
          channelPerformance: [],
          campaignPerformance: campaigns.map(c => ({
            id: c.id,
            name: c.name,
            channel: c.channel,
            spend: c.spend,
            revenue: c.revenue,
            roi: c.spend > 0 ? ((c.revenue - c.spend) / c.spend * 100) : 0,
            cpa: c.newCustomers > 0 ? c.spend / c.newCustomers : 0,
            newCustomers: c.newCustomers,
            ltv: 1152,
            status: "maintain" as const,
            recommendation: "Review campaign performance manually",
          })),
          budgetRecommendations: {
            currentAllocation: [],
            recommendedAllocation: [],
            projectedImpact: { revenueIncrease: 0, roiImprovement: 0, cpaReduction: 0 },
          },
          cutScaleRecommendations: { scale: [], maintain: [], optimize: [], cut: [] },
          insights: [{
            type: "warning" as const,
            title: "Partial Analysis",
            description: "AI analysis could not be fully completed. Basic metrics calculated from provided data.",
            actionable: "Try again or review campaign data for accuracy.",
          }],
        },
        confidence: 0.4,
        error: "Partial analysis completed - some AI insights unavailable",
      };
    }
  } catch (error) {
    console.error("Gemini attribution analysis error:", error);
    throw error;
  }
}

router.post("/attribute-campaigns", async (req, res) => {
  try {
    if (!genAI) {
      return res.status(503).json({
        success: false,
        error: "AI service is not configured. Please contact support.",
      });
    }

    const { campaigns, attributionModel = "linear" } = req.body;

    if (!campaigns || !Array.isArray(campaigns) || campaigns.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide at least one campaign to analyze.",
      });
    }

    if (campaigns.length > 20) {
      return res.status(400).json({
        success: false,
        error: "Maximum 20 campaigns per analysis. Please consolidate or split your analysis.",
      });
    }

    const validatedCampaigns: CampaignData[] = campaigns.map((c: any, index: number) => ({
      id: c.id || `campaign-${index + 1}`,
      name: c.name || `Campaign ${index + 1}`,
      channel: c.channel || "other",
      spend: typeof c.spend === "number" ? c.spend : 0,
      startDate: c.startDate || new Date().toISOString().split("T")[0],
      endDate: c.endDate || new Date().toISOString().split("T")[0],
      revenue: typeof c.revenue === "number" ? c.revenue : 0,
      newCustomers: typeof c.newCustomers === "number" ? c.newCustomers : 0,
    }));

    const result = await analyzeMarketingAttribution(validatedCampaigns, attributionModel);

    return res.json(result);
  } catch (error: any) {
    console.error("Marketing attribution error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze marketing attribution. Please try again.",
    });
  }
});

// ============================================================================
// DELIVERY ROUTE OPTIMIZER - AI-powered WDF/pickup-delivery route optimization
// ============================================================================

export interface DeliveryStop {
  id: string;
  address: string;
  orderValue: number;
  timeWindowStart: string;
  timeWindowEnd: string;
  estimatedDuration?: number;
  priority?: "high" | "normal" | "low";
  notes?: string;
}

export interface DriverConstraints {
  maxDrivingHours: number;
  breakDurationMinutes: number;
  breakAfterHours: number;
  startTime: string;
  endTime: string;
}

export interface VehicleConstraints {
  capacity: number;
  fuelCostPerMile: number;
  averageSpeedMph: number;
}

export interface OptimizedStop {
  sequence: number;
  id: string;
  address: string;
  orderValue: number;
  estimatedArrival: string;
  estimatedDeparture: string;
  distanceFromPrevious: number;
  timeFromPrevious: number;
  timeWindowStart: string;
  timeWindowEnd: string;
  timeWindowStatus: "on-time" | "early" | "late" | "at-risk";
  waitTime: number;
  cumulativeDistance: number;
  cumulativeTime: number;
  cumulativeRevenue: number;
  notes: string;
}

export interface DeliveryRouteResult {
  success: boolean;
  data: {
    summary: {
      totalStops: number;
      totalDistance: number;
      totalTime: number;
      totalDrivingTime: number;
      totalServiceTime: number;
      totalWaitTime: number;
      totalBreakTime: number;
      estimatedStartTime: string;
      estimatedEndTime: string;
      fuelCost: number;
      totalRevenue: number;
      revenuePerMile: number;
      revenuePerHour: number;
      costPerStop: number;
      profitMargin: number;
    };
    optimizedRoute: OptimizedStop[];
    capacityUtilization: {
      totalOrderValue: number;
      vehicleCapacity: number;
      utilizationPercent: number;
      status: "optimal" | "underutilized" | "near-capacity" | "over-capacity";
      recommendation: string;
    };
    timeWindowCompliance: {
      onTimeStops: number;
      earlyStops: number;
      lateStops: number;
      atRiskStops: number;
      complianceRate: number;
      status: "excellent" | "good" | "needs-attention" | "critical";
    };
    efficiency: {
      milesPerStop: number;
      stopsPerHour: number;
      idleTimePercent: number;
      routeEfficiencyScore: number;
      grade: "A" | "B" | "C" | "D" | "F";
    };
    recommendations: Array<{
      category: "route" | "timing" | "capacity" | "cost" | "efficiency";
      title: string;
      description: string;
      impact: "high" | "medium" | "low";
      savings: number | null;
    }>;
    googleMapsUrl: string;
    turnByTurnSummary: string[];
  };
  confidence: number;
  error?: string;
}

async function optimizeDeliveryRoute(
  origin: string,
  stops: DeliveryStop[],
  vehicleConstraints: VehicleConstraints,
  driverConstraints: DriverConstraints
): Promise<DeliveryRouteResult> {
  if (!genAI) {
    throw new Error("Gemini AI is not configured");
  }

  const stopsJson = JSON.stringify(stops, null, 2);
  const totalOrderValue = stops.reduce((sum, s) => sum + s.orderValue, 0);

  const prompt = `You are an expert logistics and route optimization specialist for laundromat wash-dry-fold (WDF) pickup and delivery services. Analyze and optimize this delivery route.

ORIGIN/DEPOT:
${origin}

DELIVERY STOPS (${stops.length} total):
${stopsJson}

VEHICLE CONSTRAINTS:
- Capacity: $${vehicleConstraints.capacity} worth of orders
- Fuel Cost: $${vehicleConstraints.fuelCostPerMile}/mile
- Average Speed: ${vehicleConstraints.averageSpeedMph} mph

DRIVER CONSTRAINTS:
- Max Driving Hours: ${driverConstraints.maxDrivingHours} hours
- Break: ${driverConstraints.breakDurationMinutes} minutes after ${driverConstraints.breakAfterHours} hours
- Shift: ${driverConstraints.startTime} to ${driverConstraints.endTime}

OPTIMIZATION GOALS:
1. Minimize total driving distance while respecting time windows
2. Maximize on-time deliveries (within customer time windows)
3. Optimize revenue per mile driven
4. Ensure driver break compliance
5. Return to origin at end of route

For each stop, provide:
- Optimal sequence position
- Estimated arrival and departure times
- Distance and time from previous stop
- Time window compliance status
- Cumulative metrics

Calculate route metrics:
- Total distance, time, fuel cost
- Revenue per mile and per hour
- Time window compliance rate
- Capacity utilization
- Efficiency score (A=90+, B=80-89, C=70-79, D=60-69, F<60)

Provide 3-5 actionable recommendations to improve route efficiency.

Return ONLY valid JSON in this exact format:
{
  "summary": {
    "totalStops": ${stops.length},
    "totalDistance": 45.2,
    "totalTime": 180,
    "totalDrivingTime": 120,
    "totalServiceTime": 50,
    "totalWaitTime": 10,
    "totalBreakTime": 0,
    "estimatedStartTime": "${driverConstraints.startTime}",
    "estimatedEndTime": "14:30",
    "fuelCost": 15.80,
    "totalRevenue": ${totalOrderValue},
    "revenuePerMile": 8.50,
    "revenuePerHour": 128.00,
    "costPerStop": 2.63,
    "profitMargin": 85.5
  },
  "optimizedRoute": [
    {
      "sequence": 1,
      "id": "stop-id",
      "address": "Full address",
      "orderValue": 45.00,
      "estimatedArrival": "09:15",
      "estimatedDeparture": "09:25",
      "distanceFromPrevious": 3.2,
      "timeFromPrevious": 8,
      "timeWindowStart": "09:00",
      "timeWindowEnd": "11:00",
      "timeWindowStatus": "on-time",
      "waitTime": 0,
      "cumulativeDistance": 3.2,
      "cumulativeTime": 18,
      "cumulativeRevenue": 45.00,
      "notes": "First stop, residential area"
    }
  ],
  "capacityUtilization": {
    "totalOrderValue": ${totalOrderValue},
    "vehicleCapacity": ${vehicleConstraints.capacity},
    "utilizationPercent": ${Math.min(100, (totalOrderValue / vehicleConstraints.capacity) * 100).toFixed(1)},
    "status": "optimal",
    "recommendation": "Good utilization, consider adding 1-2 more stops"
  },
  "timeWindowCompliance": {
    "onTimeStops": ${stops.length},
    "earlyStops": 0,
    "lateStops": 0,
    "atRiskStops": 0,
    "complianceRate": 100,
    "status": "excellent"
  },
  "efficiency": {
    "milesPerStop": 4.5,
    "stopsPerHour": 3.2,
    "idleTimePercent": 5.5,
    "routeEfficiencyScore": 88,
    "grade": "B"
  },
  "recommendations": [
    {
      "category": "route",
      "title": "Consider alternate route order",
      "description": "Swapping stops 3 and 4 could save 2 miles",
      "impact": "medium",
      "savings": 0.70
    }
  ],
  "turnByTurnSummary": [
    "Depart from origin at 9:00 AM",
    "Head east on Main St for 2.1 miles",
    "Arrive at Stop 1 (123 Oak Ave) at 9:15 AM"
  ],
  "confidence": 0.85
}

Be realistic with distance estimates based on typical urban/suburban routing. Account for real-world factors like traffic patterns during the time windows specified.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text() || "";

    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                        text.match(/```\n([\s\S]*?)\n```/) || 
                        [null, text];
      const jsonText = jsonMatch[1] || text;
      const parsed = JSON.parse(jsonText.trim());

      const optimizedRoute: OptimizedStop[] = Array.isArray(parsed.optimizedRoute) 
        ? parsed.optimizedRoute.map((stop: any, idx: number) => ({
            sequence: stop.sequence || idx + 1,
            id: stop.id || stops[idx]?.id || `stop-${idx + 1}`,
            address: stop.address || stops[idx]?.address || "",
            orderValue: typeof stop.orderValue === "number" ? stop.orderValue : stops[idx]?.orderValue || 0,
            estimatedArrival: stop.estimatedArrival || "TBD",
            estimatedDeparture: stop.estimatedDeparture || "TBD",
            distanceFromPrevious: typeof stop.distanceFromPrevious === "number" ? stop.distanceFromPrevious : 0,
            timeFromPrevious: typeof stop.timeFromPrevious === "number" ? stop.timeFromPrevious : 0,
            timeWindowStart: stop.timeWindowStart || stops[idx]?.timeWindowStart || "",
            timeWindowEnd: stop.timeWindowEnd || stops[idx]?.timeWindowEnd || "",
            timeWindowStatus: stop.timeWindowStatus || "on-time",
            waitTime: typeof stop.waitTime === "number" ? stop.waitTime : 0,
            cumulativeDistance: typeof stop.cumulativeDistance === "number" ? stop.cumulativeDistance : 0,
            cumulativeTime: typeof stop.cumulativeTime === "number" ? stop.cumulativeTime : 0,
            cumulativeRevenue: typeof stop.cumulativeRevenue === "number" ? stop.cumulativeRevenue : 0,
            notes: stop.notes || "",
          }))
        : [];

      const addresses = [origin, ...optimizedRoute.map(s => s.address)];
      const googleMapsUrl = `https://www.google.com/maps/dir/${addresses.map(a => encodeURIComponent(a)).join("/")}`;

      return {
        success: true,
        data: {
          summary: {
            totalStops: parsed.summary?.totalStops || stops.length,
            totalDistance: typeof parsed.summary?.totalDistance === "number" ? parsed.summary.totalDistance : 0,
            totalTime: typeof parsed.summary?.totalTime === "number" ? parsed.summary.totalTime : 0,
            totalDrivingTime: typeof parsed.summary?.totalDrivingTime === "number" ? parsed.summary.totalDrivingTime : 0,
            totalServiceTime: typeof parsed.summary?.totalServiceTime === "number" ? parsed.summary.totalServiceTime : 0,
            totalWaitTime: typeof parsed.summary?.totalWaitTime === "number" ? parsed.summary.totalWaitTime : 0,
            totalBreakTime: typeof parsed.summary?.totalBreakTime === "number" ? parsed.summary.totalBreakTime : 0,
            estimatedStartTime: parsed.summary?.estimatedStartTime || driverConstraints.startTime,
            estimatedEndTime: parsed.summary?.estimatedEndTime || "",
            fuelCost: typeof parsed.summary?.fuelCost === "number" ? parsed.summary.fuelCost : 0,
            totalRevenue: typeof parsed.summary?.totalRevenue === "number" ? parsed.summary.totalRevenue : totalOrderValue,
            revenuePerMile: typeof parsed.summary?.revenuePerMile === "number" ? parsed.summary.revenuePerMile : 0,
            revenuePerHour: typeof parsed.summary?.revenuePerHour === "number" ? parsed.summary.revenuePerHour : 0,
            costPerStop: typeof parsed.summary?.costPerStop === "number" ? parsed.summary.costPerStop : 0,
            profitMargin: typeof parsed.summary?.profitMargin === "number" ? parsed.summary.profitMargin : 0,
          },
          optimizedRoute,
          capacityUtilization: {
            totalOrderValue: parsed.capacityUtilization?.totalOrderValue || totalOrderValue,
            vehicleCapacity: parsed.capacityUtilization?.vehicleCapacity || vehicleConstraints.capacity,
            utilizationPercent: typeof parsed.capacityUtilization?.utilizationPercent === "number" 
              ? parsed.capacityUtilization.utilizationPercent 
              : (totalOrderValue / vehicleConstraints.capacity) * 100,
            status: parsed.capacityUtilization?.status || "optimal",
            recommendation: parsed.capacityUtilization?.recommendation || "Review capacity needs",
          },
          timeWindowCompliance: {
            onTimeStops: typeof parsed.timeWindowCompliance?.onTimeStops === "number" ? parsed.timeWindowCompliance.onTimeStops : stops.length,
            earlyStops: typeof parsed.timeWindowCompliance?.earlyStops === "number" ? parsed.timeWindowCompliance.earlyStops : 0,
            lateStops: typeof parsed.timeWindowCompliance?.lateStops === "number" ? parsed.timeWindowCompliance.lateStops : 0,
            atRiskStops: typeof parsed.timeWindowCompliance?.atRiskStops === "number" ? parsed.timeWindowCompliance.atRiskStops : 0,
            complianceRate: typeof parsed.timeWindowCompliance?.complianceRate === "number" ? parsed.timeWindowCompliance.complianceRate : 100,
            status: parsed.timeWindowCompliance?.status || "excellent",
          },
          efficiency: {
            milesPerStop: typeof parsed.efficiency?.milesPerStop === "number" ? parsed.efficiency.milesPerStop : 0,
            stopsPerHour: typeof parsed.efficiency?.stopsPerHour === "number" ? parsed.efficiency.stopsPerHour : 0,
            idleTimePercent: typeof parsed.efficiency?.idleTimePercent === "number" ? parsed.efficiency.idleTimePercent : 0,
            routeEfficiencyScore: typeof parsed.efficiency?.routeEfficiencyScore === "number" ? parsed.efficiency.routeEfficiencyScore : 75,
            grade: parsed.efficiency?.grade || "C",
          },
          recommendations: Array.isArray(parsed.recommendations) 
            ? parsed.recommendations.map((r: any) => ({
                category: r.category || "efficiency",
                title: r.title || "Recommendation",
                description: r.description || "",
                impact: r.impact || "medium",
                savings: typeof r.savings === "number" ? r.savings : null,
              }))
            : [],
          googleMapsUrl,
          turnByTurnSummary: Array.isArray(parsed.turnByTurnSummary) ? parsed.turnByTurnSummary : [],
        },
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.75,
      };
    } catch (parseError) {
      console.error("Failed to parse Gemini route optimization response:", parseError);
      
      const googleMapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(origin)}/${stops.map(s => encodeURIComponent(s.address)).join("/")}`;
      
      return {
        success: true,
        data: {
          summary: {
            totalStops: stops.length,
            totalDistance: 0,
            totalTime: 0,
            totalDrivingTime: 0,
            totalServiceTime: 0,
            totalWaitTime: 0,
            totalBreakTime: 0,
            estimatedStartTime: driverConstraints.startTime,
            estimatedEndTime: "",
            fuelCost: 0,
            totalRevenue: totalOrderValue,
            revenuePerMile: 0,
            revenuePerHour: 0,
            costPerStop: 0,
            profitMargin: 0,
          },
          optimizedRoute: stops.map((stop, idx) => ({
            sequence: idx + 1,
            id: stop.id,
            address: stop.address,
            orderValue: stop.orderValue,
            estimatedArrival: "TBD",
            estimatedDeparture: "TBD",
            distanceFromPrevious: 0,
            timeFromPrevious: 0,
            timeWindowStart: stop.timeWindowStart,
            timeWindowEnd: stop.timeWindowEnd,
            timeWindowStatus: "on-time" as const,
            waitTime: 0,
            cumulativeDistance: 0,
            cumulativeTime: 0,
            cumulativeRevenue: 0,
            notes: "Route optimization in progress",
          })),
          capacityUtilization: {
            totalOrderValue,
            vehicleCapacity: vehicleConstraints.capacity,
            utilizationPercent: (totalOrderValue / vehicleConstraints.capacity) * 100,
            status: "optimal",
            recommendation: "Analysis incomplete - please retry",
          },
          timeWindowCompliance: {
            onTimeStops: stops.length,
            earlyStops: 0,
            lateStops: 0,
            atRiskStops: 0,
            complianceRate: 100,
            status: "excellent",
          },
          efficiency: {
            milesPerStop: 0,
            stopsPerHour: 0,
            idleTimePercent: 0,
            routeEfficiencyScore: 0,
            grade: "C",
          },
          recommendations: [{
            category: "efficiency" as const,
            title: "Retry Analysis",
            description: "Route optimization could not be fully completed. Please try again.",
            impact: "high" as const,
            savings: null,
          }],
          googleMapsUrl,
          turnByTurnSummary: ["Route optimization incomplete - please retry"],
        },
        confidence: 0.3,
        error: "Partial analysis completed - some route data could not be parsed",
      };
    }
  } catch (error) {
    console.error("Gemini route optimization error:", error);
    throw error;
  }
}

router.post("/optimize-delivery-route", async (req, res) => {
  try {
    if (!genAI) {
      return res.status(503).json({
        success: false,
        error: "AI service is not configured. Please contact support.",
      });
    }

    const { origin, stops, vehicleConstraints, driverConstraints } = req.body;

    if (!origin || typeof origin !== "string" || origin.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid origin address.",
      });
    }

    if (!stops || !Array.isArray(stops) || stops.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide at least one delivery stop.",
      });
    }

    if (stops.length > 25) {
      return res.status(400).json({
        success: false,
        error: "Maximum 25 stops per route optimization. Please split into multiple routes.",
      });
    }

    const validatedStops: DeliveryStop[] = stops.map((s: any, index: number) => ({
      id: s.id || `stop-${index + 1}`,
      address: s.address || "",
      orderValue: typeof s.orderValue === "number" ? s.orderValue : 0,
      timeWindowStart: s.timeWindowStart || "09:00",
      timeWindowEnd: s.timeWindowEnd || "17:00",
      estimatedDuration: typeof s.estimatedDuration === "number" ? s.estimatedDuration : 10,
      priority: s.priority || "normal",
      notes: s.notes || "",
    }));

    const invalidStops = validatedStops.filter(s => !s.address || s.address.trim().length === 0);
    if (invalidStops.length > 0) {
      return res.status(400).json({
        success: false,
        error: `${invalidStops.length} stop(s) are missing addresses. Please provide addresses for all stops.`,
      });
    }

    const validatedVehicle: VehicleConstraints = {
      capacity: typeof vehicleConstraints?.capacity === "number" ? vehicleConstraints.capacity : 500,
      fuelCostPerMile: typeof vehicleConstraints?.fuelCostPerMile === "number" ? vehicleConstraints.fuelCostPerMile : 0.35,
      averageSpeedMph: typeof vehicleConstraints?.averageSpeedMph === "number" ? vehicleConstraints.averageSpeedMph : 25,
    };

    const validatedDriver: DriverConstraints = {
      maxDrivingHours: typeof driverConstraints?.maxDrivingHours === "number" ? driverConstraints.maxDrivingHours : 8,
      breakDurationMinutes: typeof driverConstraints?.breakDurationMinutes === "number" ? driverConstraints.breakDurationMinutes : 30,
      breakAfterHours: typeof driverConstraints?.breakAfterHours === "number" ? driverConstraints.breakAfterHours : 4,
      startTime: driverConstraints?.startTime || "09:00",
      endTime: driverConstraints?.endTime || "17:00",
    };

    const result = await optimizeDeliveryRoute(
      origin.trim(),
      validatedStops,
      validatedVehicle,
      validatedDriver
    );

    return res.json(result);
  } catch (error: any) {
    console.error("Delivery route optimization error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to optimize delivery route. Please try again.",
    });
  }
});

// ============================================================================
// MARKETING CAMPAIGN ATTRIBUTION ENGINE - AI-powered marketing analysis
// ============================================================================

export interface CampaignDataV2 {
  name: string;
  channel: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface MarketingAttributionResultV2 {
  success: boolean;
  data: {
    dateRange: { start: string; end: string };
    goals: { targetCPA: number; targetROAS: number };
    totalSpend: number;
    totalConversions: number;
    overallROI: number;
    overallCPA: number;
    attributionModels: {
      firstTouch: Array<{
        channel: string;
        attributedConversions: number;
        attributedRevenue: number;
        percentageShare: number;
      }>;
      lastTouch: Array<{
        channel: string;
        attributedConversions: number;
        attributedRevenue: number;
        percentageShare: number;
      }>;
      linear: Array<{
        channel: string;
        attributedConversions: number;
        attributedRevenue: number;
        percentageShare: number;
      }>;
      timeDecay: Array<{
        channel: string;
        attributedConversions: number;
        attributedRevenue: number;
        percentageShare: number;
      }>;
    };
    channelPerformance: Array<{
      channel: string;
      spend: number;
      impressions: number;
      clicks: number;
      conversions: number;
      ctr: number;
      conversionRate: number;
      cpc: number;
      cpa: number;
      roi: number;
      roas: number;
      effectivenessScore: number;
      rank: number;
    }>;
    campaignROI: Array<{
      campaign: string;
      channel: string;
      spend: number;
      revenue: number;
      roi: number;
      roas: number;
      status: "exceeds-goal" | "meets-goal" | "below-goal" | "underperforming";
    }>;
    budgetReallocation: {
      currentAllocation: Array<{ channel: string; amount: number; percentage: number }>;
      recommendedAllocation: Array<{ channel: string; amount: number; percentage: number; change: number }>;
      rationale: string;
      expectedImpact: {
        additionalConversions: number;
        improvedROI: number;
        reducedCPA: number;
      };
    };
    predictedImpact: Array<{
      scenario: string;
      budgetChange: number;
      predictedConversions: number;
      predictedROI: number;
      predictedCPA: number;
      confidence: number;
    }>;
    recommendations: Array<{
      priority: "high" | "medium" | "low";
      category: string;
      action: string;
      expectedImpact: string;
    }>;
    insights: string[];
  };
  confidence: number;
  error?: string;
}

async function analyzeChannelAttributionV2(
  campaigns: CampaignDataV2[],
  dateRange: { start: string; end: string },
  goals: { targetCPA: number; targetROAS: number }
): Promise<MarketingAttributionResultV2> {
  if (!genAI) {
    throw new Error("Gemini AI is not configured");
  }

  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);

  const campaignSummary = campaigns.map(c => 
    `- ${c.name} (${c.channel}): $${c.spend} spend, ${c.impressions} impressions, ${c.clicks} clicks, ${c.conversions} conversions`
  ).join("\n");

  const prompt = `You are a senior marketing analytics expert specializing in multi-channel attribution analysis. Analyze this marketing campaign data and provide comprehensive attribution insights.

CAMPAIGN DATA:
${campaignSummary}

DATE RANGE: ${dateRange.start} to ${dateRange.end}
TOTAL SPEND: $${totalSpend}
TOTAL CONVERSIONS: ${totalConversions}
TOTAL CLICKS: ${totalClicks}
TOTAL IMPRESSIONS: ${totalImpressions}

BUSINESS GOALS:
- Target CPA: $${goals.targetCPA}
- Target ROAS: ${goals.targetROAS}x

Analyze the campaigns and provide:

1. **Attribution Models**: Calculate attribution for each channel using:
   - First-Touch: Credit to first interaction channel
   - Last-Touch: Credit to final conversion channel
   - Linear: Equal credit across all touchpoints
   - Time-Decay: More credit to recent touchpoints

2. **Channel Performance**: Rank each channel by effectiveness including:
   - CTR, Conversion Rate, CPC, CPA
   - ROI and ROAS calculations
   - Effectiveness score (0-100)

3. **Campaign ROI Analysis**: Evaluate each campaign's performance against goals

4. **Budget Reallocation**: Recommend optimal budget distribution with:
   - Current vs recommended allocation
   - Expected impact (additional conversions, improved ROI, reduced CPA)

5. **Predicted Impact**: Model 3-5 scenarios for budget changes

6. **Recommendations**: Prioritized action items

Return ONLY valid JSON in this exact format:
{
  "dateRange": {"start": "${dateRange.start}", "end": "${dateRange.end}"},
  "goals": {"targetCPA": ${goals.targetCPA}, "targetROAS": ${goals.targetROAS}},
  "totalSpend": ${totalSpend},
  "totalConversions": ${totalConversions},
  "overallROI": 125.5,
  "overallCPA": 45.00,
  "attributionModels": {
    "firstTouch": [
      {"channel": "Google Ads", "attributedConversions": 50, "attributedRevenue": 5000, "percentageShare": 45}
    ],
    "lastTouch": [
      {"channel": "Google Ads", "attributedConversions": 55, "attributedRevenue": 5500, "percentageShare": 50}
    ],
    "linear": [
      {"channel": "Google Ads", "attributedConversions": 40, "attributedRevenue": 4000, "percentageShare": 36}
    ],
    "timeDecay": [
      {"channel": "Google Ads", "attributedConversions": 48, "attributedRevenue": 4800, "percentageShare": 43}
    ]
  },
  "channelPerformance": [
    {
      "channel": "Google Ads",
      "spend": 5000,
      "impressions": 100000,
      "clicks": 2500,
      "conversions": 50,
      "ctr": 2.5,
      "conversionRate": 2.0,
      "cpc": 2.00,
      "cpa": 100.00,
      "roi": 150.0,
      "roas": 2.5,
      "effectivenessScore": 85,
      "rank": 1
    }
  ],
  "campaignROI": [
    {
      "campaign": "Summer Sale",
      "channel": "Google Ads",
      "spend": 5000,
      "revenue": 12500,
      "roi": 150.0,
      "roas": 2.5,
      "status": "exceeds-goal"
    }
  ],
  "budgetReallocation": {
    "currentAllocation": [
      {"channel": "Google Ads", "amount": 5000, "percentage": 50}
    ],
    "recommendedAllocation": [
      {"channel": "Google Ads", "amount": 6000, "percentage": 60, "change": 20}
    ],
    "rationale": "Shift budget from underperforming channels to high-ROI channels",
    "expectedImpact": {
      "additionalConversions": 15,
      "improvedROI": 12.5,
      "reducedCPA": 8.50
    }
  },
  "predictedImpact": [
    {
      "scenario": "Increase Google Ads by 20%",
      "budgetChange": 1000,
      "predictedConversions": 65,
      "predictedROI": 165.0,
      "predictedCPA": 92.30,
      "confidence": 0.85
    }
  ],
  "recommendations": [
    {
      "priority": "high",
      "category": "Budget Optimization",
      "action": "Reallocate 20% of Facebook budget to Google Ads",
      "expectedImpact": "Increase conversions by 15% while reducing CPA by 10%"
    }
  ],
  "insights": [
    "Google Ads is your highest performing channel with 2.5x ROAS",
    "Facebook shows high awareness but low conversion - consider retargeting"
  ],
  "confidence": 0.85
}

Be analytical and data-driven. Calculate realistic metrics based on the input data.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text() || "";

    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                        text.match(/```\n([\s\S]*?)\n```/) || 
                        [null, text];
      const jsonText = jsonMatch[1] || text;
      const parsed = JSON.parse(jsonText.trim());

      return {
        success: true,
        data: {
          dateRange: parsed.dateRange || dateRange,
          goals: parsed.goals || goals,
          totalSpend: parsed.totalSpend || totalSpend,
          totalConversions: parsed.totalConversions || totalConversions,
          overallROI: typeof parsed.overallROI === "number" ? parsed.overallROI : 0,
          overallCPA: typeof parsed.overallCPA === "number" ? parsed.overallCPA : 0,
          attributionModels: {
            firstTouch: Array.isArray(parsed.attributionModels?.firstTouch) ? parsed.attributionModels.firstTouch : [],
            lastTouch: Array.isArray(parsed.attributionModels?.lastTouch) ? parsed.attributionModels.lastTouch : [],
            linear: Array.isArray(parsed.attributionModels?.linear) ? parsed.attributionModels.linear : [],
            timeDecay: Array.isArray(parsed.attributionModels?.timeDecay) ? parsed.attributionModels.timeDecay : [],
          },
          channelPerformance: Array.isArray(parsed.channelPerformance) ? parsed.channelPerformance : [],
          campaignROI: Array.isArray(parsed.campaignROI) ? parsed.campaignROI : [],
          budgetReallocation: {
            currentAllocation: Array.isArray(parsed.budgetReallocation?.currentAllocation) ? parsed.budgetReallocation.currentAllocation : [],
            recommendedAllocation: Array.isArray(parsed.budgetReallocation?.recommendedAllocation) ? parsed.budgetReallocation.recommendedAllocation : [],
            rationale: parsed.budgetReallocation?.rationale || "Budget optimization analysis",
            expectedImpact: {
              additionalConversions: parsed.budgetReallocation?.expectedImpact?.additionalConversions || 0,
              improvedROI: parsed.budgetReallocation?.expectedImpact?.improvedROI || 0,
              reducedCPA: parsed.budgetReallocation?.expectedImpact?.reducedCPA || 0,
            },
          },
          predictedImpact: Array.isArray(parsed.predictedImpact) ? parsed.predictedImpact : [],
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
          insights: Array.isArray(parsed.insights) ? parsed.insights : [],
        },
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.7,
      };
    } catch (parseError) {
      console.error("Failed to parse Gemini marketing attribution response:", parseError);
      return {
        success: false,
        data: {
          dateRange,
          goals,
          totalSpend,
          totalConversions,
          overallROI: 0,
          overallCPA: totalConversions > 0 ? totalSpend / totalConversions : 0,
          attributionModels: { firstTouch: [], lastTouch: [], linear: [], timeDecay: [] },
          channelPerformance: [],
          campaignROI: [],
          budgetReallocation: {
            currentAllocation: [],
            recommendedAllocation: [],
            rationale: "Unable to generate recommendations",
            expectedImpact: { additionalConversions: 0, improvedROI: 0, reducedCPA: 0 },
          },
          predictedImpact: [],
          recommendations: [],
          insights: [],
        },
        confidence: 0.3,
        error: "Could not parse attribution analysis results",
      };
    }
  } catch (error) {
    console.error("Gemini marketing attribution error:", error);
    throw error;
  }
}

router.post("/attribute-marketing", async (req, res) => {
  try {
    if (!genAI) {
      return res.status(503).json({
        success: false,
        error: "AI service is not configured. Please contact support.",
      });
    }

    const { campaigns, dateRange, goals } = req.body;

    if (!campaigns || !Array.isArray(campaigns) || campaigns.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide at least one campaign to analyze.",
      });
    }

    if (campaigns.length > 20) {
      return res.status(400).json({
        success: false,
        error: "Maximum 20 campaigns per analysis. Please split into multiple analyses.",
      });
    }

    const validatedCampaigns: CampaignDataV2[] = campaigns.map((c: any, index: number) => ({
      name: c.name || `Campaign ${index + 1}`,
      channel: c.channel || "Unknown",
      spend: typeof c.spend === "number" ? Math.max(0, c.spend) : 0,
      impressions: typeof c.impressions === "number" ? Math.max(0, Math.round(c.impressions)) : 0,
      clicks: typeof c.clicks === "number" ? Math.max(0, Math.round(c.clicks)) : 0,
      conversions: typeof c.conversions === "number" ? Math.max(0, Math.round(c.conversions)) : 0,
    }));

    const validatedDateRange = {
      start: dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      end: dateRange?.end || new Date().toISOString().split("T")[0],
    };

    const validatedGoals = {
      targetCPA: typeof goals?.targetCPA === "number" ? Math.max(0, goals.targetCPA) : 50,
      targetROAS: typeof goals?.targetROAS === "number" ? Math.max(0, goals.targetROAS) : 3,
    };

    const result = await analyzeChannelAttributionV2(
      validatedCampaigns,
      validatedDateRange,
      validatedGoals
    );

    return res.json(result);
  } catch (error: any) {
    console.error("Marketing attribution error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze marketing attribution. Please try again.",
    });
  }
});

export default router;
