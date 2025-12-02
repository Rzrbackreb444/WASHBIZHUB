import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing required GEMINI_API_KEY");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export interface UtilityBillData {
  billType: "electric" | "water" | "gas" | "combined";
  billDate: string | null;
  billPeriodStart: string | null;
  billPeriodEnd: string | null;
  electricKwh: number | null;
  electricCost: number | null;
  electricRatePerKwh: number | null;
  waterGallons: number | null;
  waterCost: number | null;
  waterRatePerGallon: number | null;
  gasTherms: number | null;
  gasCost: number | null;
  gasRatePerTherm: number | null;
  totalCost: number | null;
  providerName: string | null;
  accountNumber: string | null;
  serviceAddress: string | null;
  confidence: number;
}

export interface LaundromatMetrics {
  costPerWasherLoad: number;
  costPerDryerLoad: number;
  upgRatio: number | null;
  estimatedLoadsSupported: {
    washerLoads: number;
    dryerLoads: number;
  };
}

export interface Anomaly {
  type: string;
  severity: "low" | "medium" | "high";
  message: string;
  percentChange?: number;
}

export interface Recommendation {
  priority: "low" | "medium" | "high";
  action: string;
  expectedSavings?: string;
}

export interface UtilityBillAnalysisResult {
  billData: UtilityBillData;
  laundromatMetrics: LaundromatMetrics;
  anomalies: Anomaly[];
  recommendations: Recommendation[];
  rawExtractedData: any;
}

const WASHER_LOAD_WATER_GALLONS = 20;
const WASHER_LOAD_KWH = 2.5;
const DRYER_LOAD_KWH = 3.5;

export async function analyzeUtilityBill(
  imageBase64: string,
  mimeType: string = "image/jpeg",
  grossRevenue?: number,
  previousBillData?: UtilityBillData
): Promise<UtilityBillAnalysisResult> {
  const prompt = `You are an expert utility bill analyzer for commercial laundromat businesses. Analyze this utility bill image and extract all relevant information.

Extract the following data:
1. Bill Type: Is this an electric, water, gas, or combined utility bill?
2. Bill Date: The date the bill was issued
3. Billing Period: Start and end dates of the billing period
4. Electric Usage: kWh consumed and total cost
5. Water Usage: Gallons consumed and total cost (convert from CCF or HCF if needed - 1 CCF = 748 gallons)
6. Gas Usage: Therms consumed and total cost (convert from MCF if needed - 1 MCF ≈ 10 therms)
7. Total Amount Due
8. Provider/Utility Company Name
9. Account Number (partial is fine)
10. Service Address

Calculate the rate per unit for each utility type if not explicitly shown.

Return ONLY valid JSON in this exact format:
{
  "billType": "electric" | "water" | "gas" | "combined",
  "billDate": "YYYY-MM-DD" or null,
  "billPeriodStart": "YYYY-MM-DD" or null,
  "billPeriodEnd": "YYYY-MM-DD" or null,
  "electricKwh": number or null,
  "electricCost": number or null,
  "electricRatePerKwh": number or null,
  "waterGallons": number or null,
  "waterCost": number or null,
  "waterRatePerGallon": number or null,
  "gasTherms": number or null,
  "gasCost": number or null,
  "gasRatePerTherm": number or null,
  "totalCost": number or null,
  "providerName": "string" or null,
  "accountNumber": "string" or null,
  "serviceAddress": "string" or null,
  "confidence": 0.0 to 1.0
}

Important:
- Convert all units to the standard format (gallons for water, kWh for electric, therms for gas)
- If a value is not found or unclear, use null
- The confidence score should reflect how clearly you could read the bill
- For combined bills, extract all available utility types`;

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
    
    let billData: UtilityBillData;
    
    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/) || [null, text];
      const jsonText = jsonMatch[1] || text;
      const parsed = JSON.parse(jsonText.trim());
      
      billData = {
        billType: parsed.billType || "combined",
        billDate: parsed.billDate,
        billPeriodStart: parsed.billPeriodStart,
        billPeriodEnd: parsed.billPeriodEnd,
        electricKwh: parsed.electricKwh,
        electricCost: parsed.electricCost,
        electricRatePerKwh: parsed.electricRatePerKwh,
        waterGallons: parsed.waterGallons,
        waterCost: parsed.waterCost,
        waterRatePerGallon: parsed.waterRatePerGallon,
        gasTherms: parsed.gasTherms,
        gasCost: parsed.gasCost,
        gasRatePerTherm: parsed.gasRatePerTherm,
        totalCost: parsed.totalCost,
        providerName: parsed.providerName,
        accountNumber: parsed.accountNumber,
        serviceAddress: parsed.serviceAddress,
        confidence: parsed.confidence || 0.5
      };
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      throw new Error("Failed to parse utility bill data from image");
    }

    const laundromatMetrics = calculateLaundromatMetrics(billData, grossRevenue);

    const anomalies = detectAnomalies(billData, previousBillData);

    const recommendations = generateRecommendations(billData, laundromatMetrics, anomalies);

    return {
      billData,
      laundromatMetrics,
      anomalies,
      recommendations,
      rawExtractedData: billData
    };
  } catch (error) {
    console.error("Utility bill analysis error:", error);
    throw new Error("Failed to analyze utility bill image");
  }
}

function calculateLaundromatMetrics(
  billData: UtilityBillData,
  grossRevenue?: number
): LaundromatMetrics {
  let costPerWasherLoad = 0;
  let costPerDryerLoad = 0;

  if (billData.waterRatePerGallon) {
    costPerWasherLoad += billData.waterRatePerGallon * WASHER_LOAD_WATER_GALLONS;
  } else if (billData.waterCost && billData.waterGallons) {
    const waterRate = billData.waterCost / billData.waterGallons;
    costPerWasherLoad += waterRate * WASHER_LOAD_WATER_GALLONS;
  }

  if (billData.electricRatePerKwh) {
    costPerWasherLoad += billData.electricRatePerKwh * WASHER_LOAD_KWH;
    costPerDryerLoad += billData.electricRatePerKwh * DRYER_LOAD_KWH;
  } else if (billData.electricCost && billData.electricKwh) {
    const electricRate = billData.electricCost / billData.electricKwh;
    costPerWasherLoad += electricRate * WASHER_LOAD_KWH;
    costPerDryerLoad += electricRate * DRYER_LOAD_KWH;
  }

  if (billData.gasRatePerTherm && billData.gasTherms) {
    const gasContributionPerLoad = (billData.gasCost || 0) / 
      ((billData.electricKwh || 1) / DRYER_LOAD_KWH);
    costPerDryerLoad += gasContributionPerLoad > 0 ? gasContributionPerLoad * 0.3 : 0;
  }

  let upgRatio: number | null = null;
  if (grossRevenue && billData.totalCost) {
    upgRatio = (billData.totalCost / grossRevenue) * 100;
  }

  let washerLoads = 0;
  let dryerLoads = 0;
  
  if (billData.waterGallons) {
    washerLoads = Math.floor(billData.waterGallons / WASHER_LOAD_WATER_GALLONS);
  }
  
  if (billData.electricKwh) {
    const washerKwh = washerLoads * WASHER_LOAD_KWH;
    const remainingKwh = billData.electricKwh - washerKwh;
    dryerLoads = Math.floor(remainingKwh / DRYER_LOAD_KWH);
  }

  return {
    costPerWasherLoad: Math.round(costPerWasherLoad * 10000) / 10000,
    costPerDryerLoad: Math.round(costPerDryerLoad * 10000) / 10000,
    upgRatio: upgRatio ? Math.round(upgRatio * 100) / 100 : null,
    estimatedLoadsSupported: {
      washerLoads,
      dryerLoads
    }
  };
}

function detectAnomalies(
  currentBill: UtilityBillData,
  previousBill?: UtilityBillData
): Anomaly[] {
  const anomalies: Anomaly[] = [];

  if (!previousBill) {
    if (currentBill.electricKwh && currentBill.electricKwh > 50000) {
      anomalies.push({
        type: "high_electric_usage",
        severity: "medium",
        message: "Electric usage is unusually high. Consider an energy audit to identify inefficiencies."
      });
    }
    
    if (currentBill.waterGallons && currentBill.waterGallons > 100000) {
      anomalies.push({
        type: "high_water_usage",
        severity: "medium",
        message: "Water usage is very high. Check for leaks or inefficient equipment."
      });
    }

    return anomalies;
  }

  if (currentBill.electricKwh && previousBill.electricKwh) {
    const electricChange = ((currentBill.electricKwh - previousBill.electricKwh) / previousBill.electricKwh) * 100;
    
    if (electricChange > 30) {
      anomalies.push({
        type: "electric_spike",
        severity: electricChange > 50 ? "high" : "medium",
        message: `Electric usage up ${Math.round(electricChange)}% - Check for malfunctioning equipment or HVAC issues`,
        percentChange: Math.round(electricChange)
      });
    } else if (electricChange < -30) {
      anomalies.push({
        type: "electric_drop",
        severity: "low",
        message: `Electric usage down ${Math.abs(Math.round(electricChange))}% - Verify meter readings are accurate`,
        percentChange: Math.round(electricChange)
      });
    }
  }

  if (currentBill.waterGallons && previousBill.waterGallons) {
    const waterChange = ((currentBill.waterGallons - previousBill.waterGallons) / previousBill.waterGallons) * 100;
    
    if (waterChange > 40) {
      anomalies.push({
        type: "water_spike",
        severity: "high",
        message: `Water up ${Math.round(waterChange)}% - POSSIBLE LEAK! Inspect all washers, pipes, and toilets immediately`,
        percentChange: Math.round(waterChange)
      });
    } else if (waterChange > 20) {
      anomalies.push({
        type: "water_increase",
        severity: "medium",
        message: `Water usage up ${Math.round(waterChange)}% - Monitor for continued increases`,
        percentChange: Math.round(waterChange)
      });
    }
  }

  if (currentBill.gasTherms && previousBill.gasTherms) {
    const gasChange = ((currentBill.gasTherms - previousBill.gasTherms) / previousBill.gasTherms) * 100;
    
    if (gasChange > 50) {
      anomalies.push({
        type: "gas_spike",
        severity: "high",
        message: `Gas usage up ${Math.round(gasChange)}% - Check dryer burners and water heater efficiency`,
        percentChange: Math.round(gasChange)
      });
    }
  }

  if (currentBill.electricRatePerKwh && previousBill.electricRatePerKwh) {
    const rateChange = ((currentBill.electricRatePerKwh - previousBill.electricRatePerKwh) / previousBill.electricRatePerKwh) * 100;
    
    if (rateChange > 15) {
      anomalies.push({
        type: "rate_increase",
        severity: "medium",
        message: `Electric rate increased ${Math.round(rateChange)}% - Consider shopping for alternative providers`,
        percentChange: Math.round(rateChange)
      });
    }
  }

  return anomalies;
}

function generateRecommendations(
  billData: UtilityBillData,
  metrics: LaundromatMetrics,
  anomalies: Anomaly[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (metrics.upgRatio !== null) {
    if (metrics.upgRatio > 15) {
      recommendations.push({
        priority: "high",
        action: "Your UPG ratio is above 15%. Industry benchmark is 8-12%. Conduct a comprehensive utility audit.",
        expectedSavings: `Reducing to 12% could save $${Math.round(((metrics.upgRatio - 12) / 100) * (billData.totalCost || 0) * 12)}/year`
      });
    } else if (metrics.upgRatio < 8) {
      recommendations.push({
        priority: "low",
        action: "Excellent utility efficiency! Your UPG ratio is below industry average. Document your practices.",
        expectedSavings: "N/A - Already optimized"
      });
    }
  }

  if (metrics.costPerWasherLoad > 0.50) {
    recommendations.push({
      priority: "medium",
      action: "Cost per washer load is high. Consider upgrading to high-efficiency washers (Galaxy, Dexter O-Series).",
      expectedSavings: "30-40% water reduction per cycle"
    });
  }

  if (metrics.costPerDryerLoad > 0.40) {
    recommendations.push({
      priority: "medium",
      action: "Dryer operating costs are elevated. Check lint traps, exhaust vents, and consider LED lighting.",
      expectedSavings: "15-25% energy reduction"
    });
  }

  const hasLeakAnomaly = anomalies.some(a => a.type === "water_spike");
  if (hasLeakAnomaly) {
    recommendations.push({
      priority: "high",
      action: "URGENT: Water spike detected. Check all fill valves, drain valves, water heater, and restroom fixtures.",
      expectedSavings: "Could prevent $500-2000+ in water bills"
    });
  }

  if (billData.electricKwh && billData.electricKwh > 10000) {
    recommendations.push({
      priority: "medium",
      action: "Consider installing a demand controller to manage peak electric loads and reduce demand charges.",
      expectedSavings: "10-20% on electric bill"
    });
  }

  if (!hasLeakAnomaly && anomalies.length === 0) {
    recommendations.push({
      priority: "low",
      action: "Your utility usage appears normal. Continue monitoring monthly for any changes.",
      expectedSavings: "Maintain current efficiency"
    });
  }

  return recommendations;
}

export async function compareBills(
  currentBill: UtilityBillData,
  previousBill: UtilityBillData
): Promise<{
  changes: {
    electric: { usage: number; cost: number; rate: number } | null;
    water: { usage: number; cost: number; rate: number } | null;
    gas: { usage: number; cost: number; rate: number } | null;
    total: number;
  };
  anomalies: Anomaly[];
  summary: string;
}> {
  const changes: any = {
    electric: null,
    water: null,
    gas: null,
    total: 0
  };

  if (currentBill.electricKwh && previousBill.electricKwh) {
    changes.electric = {
      usage: ((currentBill.electricKwh - previousBill.electricKwh) / previousBill.electricKwh) * 100,
      cost: currentBill.electricCost && previousBill.electricCost 
        ? ((currentBill.electricCost - previousBill.electricCost) / previousBill.electricCost) * 100 
        : 0,
      rate: currentBill.electricRatePerKwh && previousBill.electricRatePerKwh
        ? ((currentBill.electricRatePerKwh - previousBill.electricRatePerKwh) / previousBill.electricRatePerKwh) * 100
        : 0
    };
  }

  if (currentBill.waterGallons && previousBill.waterGallons) {
    changes.water = {
      usage: ((currentBill.waterGallons - previousBill.waterGallons) / previousBill.waterGallons) * 100,
      cost: currentBill.waterCost && previousBill.waterCost
        ? ((currentBill.waterCost - previousBill.waterCost) / previousBill.waterCost) * 100
        : 0,
      rate: currentBill.waterRatePerGallon && previousBill.waterRatePerGallon
        ? ((currentBill.waterRatePerGallon - previousBill.waterRatePerGallon) / previousBill.waterRatePerGallon) * 100
        : 0
    };
  }

  if (currentBill.gasTherms && previousBill.gasTherms) {
    changes.gas = {
      usage: ((currentBill.gasTherms - previousBill.gasTherms) / previousBill.gasTherms) * 100,
      cost: currentBill.gasCost && previousBill.gasCost
        ? ((currentBill.gasCost - previousBill.gasCost) / previousBill.gasCost) * 100
        : 0,
      rate: currentBill.gasRatePerTherm && previousBill.gasRatePerTherm
        ? ((currentBill.gasRatePerTherm - previousBill.gasRatePerTherm) / previousBill.gasRatePerTherm) * 100
        : 0
    };
  }

  if (currentBill.totalCost && previousBill.totalCost) {
    changes.total = ((currentBill.totalCost - previousBill.totalCost) / previousBill.totalCost) * 100;
  }

  const anomalies = detectAnomalies(currentBill, previousBill);

  let summary = `Month-over-month comparison: `;
  if (changes.total > 0) {
    summary += `Total utility costs increased by ${Math.abs(Math.round(changes.total))}%. `;
  } else if (changes.total < 0) {
    summary += `Total utility costs decreased by ${Math.abs(Math.round(changes.total))}%. `;
  } else {
    summary += `Total utility costs remained stable. `;
  }

  if (anomalies.length > 0) {
    summary += `${anomalies.length} anomaly(ies) detected requiring attention.`;
  } else {
    summary += `No anomalies detected.`;
  }

  return { changes, anomalies, summary };
}
