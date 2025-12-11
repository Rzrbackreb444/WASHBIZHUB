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

export default router;
