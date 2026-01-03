/**
 * Premium CLEANBI Report Generator
 * 
 * Generates comprehensive PDF location analysis reports using:
 * - Google CLEANBI Engine (scoring)
 * - Google Vision AI (image analysis)
 * - Google Places API (competitor data)
 * - Street View Static API (location images)
 * - Gemini AI (insights and recommendations)
 * - Walk Score API (walkability, transit, bike scores)
 * - Census Data (demographics)
 * - ATTOM Data (property intelligence)
 * - jsPDF (PDF generation)
 */

import { jsPDF } from "jspdf";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { objectStorageClient, ObjectStorageService } from "./objectStorage";
import { calculateGoogleCleanbi } from "./google-cleanbi-engine";
import { getWalkScore, WalkScoreResult } from "./walk-score-service";
import { enrichCLEANBIData, EnrichedCLEANBIData } from "./cleanbi-data-enrichment";
import { CleanbiReport } from "@shared/schema";
import { randomUUID } from "crypto";

export const REPORT_TIERS = {
  quick: {
    id: "quick",
    name: "Quick Score",
    price: 2900, // $29.00 in cents - Gateway product
    features: [
      "CLEANBI Letter Grade (A/B/C)",
      "Pass/Fail Verdict",
      "3 Key Risk Factors",
      "Competition Count",
      "Email Delivery"
    ],
    includesVision: false,
    includesAiInsights: false,
    includesDeepCompetitor: false,
    includesValuation: false,
    includesWalkScore: false,
    includesDemographics: false,
    includesProperty: false,
  },
  standard: {
    id: "standard",
    name: "Location Intelligence",
    price: 14900, // $149.00 in cents
    features: [
      "Everything in Quick Score",
      "17-Factor CLEANBI Score",
      "Walk Score / Transit / Bike Score",
      "Population & Demographics",
      "Median Income Analysis",
      "Competitor Mapping (3-mile)",
      "12-Page PDF Report"
    ],
    includesVision: false,
    includesAiInsights: false,
    includesDeepCompetitor: false,
    includesValuation: false,
    includesWalkScore: true,
    includesDemographics: true,
    includesProperty: false,
  },
  pro: {
    id: "pro",
    name: "Due Diligence",
    price: 34900, // $349.00 in cents
    features: [
      "Everything in Location Intelligence",
      "Vision AI Photo Analysis",
      "Deep Competitor Analysis",
      "Property Intelligence (ATTOM)",
      "3-Method Valuation Range",
      "25-Page PDF Report"
    ],
    includesVision: true,
    includesAiInsights: false,
    includesDeepCompetitor: true,
    includesValuation: true,
    includesWalkScore: true,
    includesDemographics: true,
    includesProperty: true,
  },
  enterprise: {
    id: "enterprise",
    name: "Acquisition Ready",
    price: 59900, // $599.00 in cents
    features: [
      "Everything in Due Diligence",
      "AI Executive Summary",
      "Strategic Recommendations",
      "ROI Projections (5-year)",
      "Market Opportunity Analysis",
      "30-min Larry Consultation",
      "40+ Page Premium Report"
    ],
    includesVision: true,
    includesAiInsights: true,
    includesDeepCompetitor: true,
    includesValuation: true,
    includesWalkScore: true,
    includesDemographics: true,
    includesProperty: true,
  }
} as const;

export type ReportTier = keyof typeof REPORT_TIERS;

interface VisionAnalysisResult {
  streetViewAnalysis: {
    buildingCondition: string;
    parkingAvailability: string;
    visibility: string;
    signage: string;
    overallScore: number;
  };
  aerialAnalysis?: {
    surroundingArea: string;
    accessibility: string;
    nearbyAmenities: string[];
  };
  imageUrl?: string;
}

interface CompetitorDeepDive {
  competitors: Array<{
    name: string;
    distance: string;
    rating: number;
    reviewCount: number;
    priceLevel?: number;
    strengths: string[];
    weaknesses: string[];
  }>;
  marketPosition: string;
  competitiveAdvantage: string;
}

interface DemographicData {
  populationDensity: string;
  medianIncome: string;
  ageDistribution: string;
  householdTypes: string;
  growthTrend: string;
}

interface AiInsights {
  executiveSummary: string;
  keyOpportunities: string[];
  riskFactors: string[];
  recommendations: Array<{
    action: string;
    impact: "high" | "medium" | "low";
    timeframe: string;
    estimatedRoi?: string;
  }>;
  marketOpportunity: string;
  projectedGrowth: string;
}

export interface ReportGenerationResult {
  pdfBuffer: Buffer;
  pdfUrl: string;
  reportData: {
    cleanbiScore: number;
    cleanbiGrade: string;
    visionAnalysis?: VisionAnalysisResult;
    competitorData?: CompetitorDeepDive;
    demographicData?: DemographicData;
    aiInsights?: AiInsights;
  };
}

async function fetchStreetViewImage(lat: number, lng: number): Promise<string | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;
  
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${lat},${lng}&key=${apiKey}`;
  return streetViewUrl;
}

async function analyzeImageWithVision(imageUrl: string): Promise<VisionAnalysisResult> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = `Analyze this Street View image of a commercial property location for a laundromat business assessment.

Provide a detailed analysis in this JSON format:
{
  "streetViewAnalysis": {
    "buildingCondition": "Description of building condition (excellent/good/fair/poor)",
    "parkingAvailability": "Assessment of parking availability and accessibility",
    "visibility": "How visible is the location from the street",
    "signage": "Quality and visibility of any existing signage",
    "overallScore": 0-100
  },
  "aerialAnalysis": {
    "surroundingArea": "Description of surrounding businesses and area type",
    "accessibility": "How accessible is the location by foot, car, and public transit",
    "nearbyAmenities": ["list", "of", "nearby", "amenities"]
  }
}

Be specific and objective in your assessment. This will be used for business decision making.`;

  try {
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const jsonText = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonText);
    }
  } catch (error) {
    console.error("Vision analysis error:", error);
  }

  return {
    streetViewAnalysis: {
      buildingCondition: "Unable to analyze",
      parkingAvailability: "Unable to analyze",
      visibility: "Unable to analyze",
      signage: "Unable to analyze",
      overallScore: 50,
    },
  };
}

async function getDeepCompetitorAnalysis(
  lat: number,
  lng: number,
  competitors: any[]
): Promise<CompetitorDeepDive> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const competitorSummary = competitors.slice(0, 10).map((c: any) => ({
    name: c.name,
    rating: c.rating || 0,
    reviewCount: c.user_ratings_total || 0,
    priceLevel: c.price_level,
  }));

  const prompt = `Analyze these competing laundromats in the area and provide strategic insights:

Competitors: ${JSON.stringify(competitorSummary, null, 2)}

Provide analysis in this JSON format:
{
  "competitors": [
    {
      "name": "competitor name",
      "distance": "approximate distance",
      "rating": 4.5,
      "reviewCount": 100,
      "priceLevel": 2,
      "strengths": ["list", "of", "strengths"],
      "weaknesses": ["list", "of", "weaknesses"]
    }
  ],
  "marketPosition": "Analysis of the competitive landscape",
  "competitiveAdvantage": "Recommendations for differentiation"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const jsonText = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonText);
    }
  } catch (error) {
    console.error("Competitor analysis error:", error);
  }

  return {
    competitors: competitorSummary.map((c: any) => ({
      ...c,
      distance: "within 5 miles",
      strengths: ["Established presence"],
      weaknesses: ["Unknown"],
    })),
    marketPosition: "Competitive market with multiple players",
    competitiveAdvantage: "Focus on superior customer service and modern equipment",
  };
}

async function generateAiInsights(
  cleanbiResult: any,
  visionAnalysis?: VisionAnalysisResult,
  competitorData?: CompetitorDeepDive
): Promise<AiInsights> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = `As a laundromat business consultant, provide comprehensive strategic insights based on this data:

CLEANBI Score: ${cleanbiResult.score}/100 (Grade: ${cleanbiResult.grade})

Breakdown:
- Foot Traffic: ${cleanbiResult.breakdown.footTraffic.score}
- Competition: ${cleanbiResult.breakdown.competition.score}
- Reviews: ${cleanbiResult.breakdown.reviews.score}
- Location: ${cleanbiResult.breakdown.location.score}
- Visibility: ${cleanbiResult.breakdown.visibility.score}

${visionAnalysis ? `Vision Analysis: ${JSON.stringify(visionAnalysis)}` : ""}
${competitorData ? `Competitor Analysis: ${JSON.stringify(competitorData)}` : ""}

Provide strategic insights in this JSON format:
{
  "executiveSummary": "2-3 paragraph executive summary of the location's potential",
  "keyOpportunities": ["list", "of", "5-7", "key", "opportunities"],
  "riskFactors": ["list", "of", "3-5", "risk", "factors"],
  "recommendations": [
    {
      "action": "Specific actionable recommendation",
      "impact": "high|medium|low",
      "timeframe": "immediate|short-term|long-term",
      "estimatedRoi": "Estimated return on investment"
    }
  ],
  "marketOpportunity": "Assessment of the market opportunity",
  "projectedGrowth": "Growth projection for the area"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const jsonText = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonText);
    }
  } catch (error) {
    console.error("AI insights error:", error);
  }

  return {
    executiveSummary: `This location shows a CLEANBI score of ${cleanbiResult.score}/100 (${cleanbiResult.grade}), indicating ${cleanbiResult.score >= 70 ? 'strong' : cleanbiResult.score >= 55 ? 'moderate' : 'developing'} potential for a laundromat business.`,
    keyOpportunities: cleanbiResult.recommendations || [],
    riskFactors: cleanbiResult.warnings || [],
    recommendations: [
      {
        action: "Conduct on-site evaluation",
        impact: "high",
        timeframe: "immediate",
        estimatedRoi: "Essential for decision making",
      },
    ],
    marketOpportunity: "Further analysis recommended",
    projectedGrowth: "Based on available data, growth potential is moderate",
  };
}

function generatePDF(
  address: string,
  cleanbiResult: any,
  tier: ReportTier,
  visionAnalysis?: VisionAnalysisResult,
  competitorData?: CompetitorDeepDive,
  demographicData?: DemographicData,
  aiInsights?: AiInsights,
  walkScoreData?: WalkScoreResult,
  enrichedData?: EnrichedCLEANBIData
): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 30;

  const addHeader = () => {
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 50, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("CLEANBI™ Location Report", margin, 32);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, 32);
    doc.setTextColor(0, 0, 0);
    yPos = 70;
  };

  const addSection = (title: string) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 30;
    }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(title, margin, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
  };

  const addText = (text: string, maxWidth = pageWidth - 2 * margin) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 30;
      }
      doc.text(line, margin, yPos);
      yPos += 6;
    });
    yPos += 4;
  };

  const addBullet = (text: string) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 30;
    }
    doc.text("•", margin, yPos);
    const lines = doc.splitTextToSize(text, pageWidth - 2 * margin - 10);
    lines.forEach((line: string, index: number) => {
      doc.text(line, margin + 8, yPos + (index * 6));
    });
    yPos += lines.length * 6 + 2;
  };

  addHeader();

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Location: ${address}`, margin, yPos);
  yPos += 15;

  doc.setFillColor(245, 247, 250);
  doc.roundedRect(margin, yPos - 5, pageWidth - 2 * margin, 45, 3, 3, "F");

  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  const gradeColor = cleanbiResult.grade === "A" ? [34, 197, 94] :
                     cleanbiResult.grade === "B" ? [59, 130, 246] :
                     cleanbiResult.grade === "C" ? [251, 191, 36] : [239, 68, 68];
  doc.setTextColor(gradeColor[0], gradeColor[1], gradeColor[2]);
  doc.text(cleanbiResult.grade, margin + 15, yPos + 25);

  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text(`Score: ${cleanbiResult.score}/100`, margin + 60, yPos + 15);
  doc.setFontSize(10);
  doc.text(`Confidence: ${cleanbiResult.confidence}%`, margin + 60, yPos + 25);
  doc.text(`Data Quality: ${cleanbiResult.dataQuality}`, margin + 60, yPos + 35);
  yPos += 55;

  addSection("Score Breakdown");
  const breakdown = cleanbiResult.breakdown;
  const categories = [
    { name: "Foot Traffic", score: breakdown.footTraffic.score, max: 25 },
    { name: "Competition", score: breakdown.competition.score, max: 25 },
    { name: "Reviews", score: breakdown.reviews.score, max: 20 },
    { name: "Location", score: breakdown.location.score, max: 15 },
    { name: "Visibility", score: breakdown.visibility.score, max: 15 },
  ];

  categories.forEach((cat) => {
    doc.text(cat.name, margin, yPos);
    const barWidth = 80;
    const barHeight = 6;
    const barX = margin + 50;
    
    doc.setFillColor(229, 231, 235);
    doc.rect(barX, yPos - 5, barWidth, barHeight, "F");
    
    const fillWidth = (cat.score / cat.max) * barWidth;
    doc.setFillColor(59, 130, 246);
    doc.rect(barX, yPos - 5, fillWidth, barHeight, "F");
    
    doc.text(`${cat.score}/${cat.max}`, barX + barWidth + 5, yPos);
    yPos += 12;
  });
  yPos += 10;

  if (competitorData || breakdown.competition?.data?.competitors) {
    addSection("Competitive Analysis");
    const competitors = competitorData?.competitors || breakdown.competition.data.competitors || [];
    
    addText(`Number of competitors in area: ${competitors.length}`);
    
    if (competitors.length > 0) {
      competitors.slice(0, 5).forEach((comp: any) => {
        addBullet(`${comp.name} - Rating: ${comp.rating || "N/A"} ${comp.distance || ""}`);
      });
    }
    
    if (competitorData?.marketPosition) {
      yPos += 5;
      addText(`Market Position: ${competitorData.marketPosition}`);
    }
    yPos += 10;
  }

  // Walk Score Section (Standard tier and above)
  if (walkScoreData && walkScoreData.status === "success") {
    addSection("Walkability & Accessibility Scores");
    
    // Walk Score
    const walkColor = walkScoreData.walkScore >= 70 ? [34, 197, 94] : 
                      walkScoreData.walkScore >= 50 ? [251, 191, 36] : [239, 68, 68];
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(walkColor[0], walkColor[1], walkColor[2]);
    doc.text(`Walk Score: ${walkScoreData.walkScore}/100`, margin, yPos);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(` - ${walkScoreData.walkDescription}`, margin + 55, yPos);
    yPos += 8;
    
    // Transit Score
    if (walkScoreData.transitScore !== null) {
      const transitColor = walkScoreData.transitScore >= 70 ? [34, 197, 94] : 
                           walkScoreData.transitScore >= 50 ? [251, 191, 36] : [239, 68, 68];
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(transitColor[0], transitColor[1], transitColor[2]);
      doc.text(`Transit Score: ${walkScoreData.transitScore}/100`, margin, yPos);
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(` - ${walkScoreData.transitDescription || ""}`, margin + 55, yPos);
      yPos += 8;
    }
    
    // Bike Score
    if (walkScoreData.bikeScore !== null) {
      const bikeColor = walkScoreData.bikeScore >= 70 ? [34, 197, 94] : 
                        walkScoreData.bikeScore >= 50 ? [251, 191, 36] : [239, 68, 68];
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(bikeColor[0], bikeColor[1], bikeColor[2]);
      doc.text(`Bike Score: ${walkScoreData.bikeScore}/100`, margin, yPos);
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(` - ${walkScoreData.bikeDescription || ""}`, margin + 55, yPos);
      yPos += 8;
    }
    
    yPos += 10;
  }

  // Demographics Section (Standard tier and above)
  if (demographicData || enrichedData?.demographics) {
    addSection("Demographics & Market Data");
    
    if (enrichedData?.demographics) {
      const demo = enrichedData.demographics;
      addText(`Population Density: ${demo.populationDensity.toLocaleString()} people/sq mi`);
      addText(`Median Household Income: $${demo.medianHouseholdIncome.toLocaleString()}`);
      addText(`Renter Percentage: ${Math.round(demo.renterPercentage)}%`);
      addText(`Housing Units: ${demo.housingUnits.toLocaleString()}`);
      addText(`Median Age: ${demo.medianAge}`);
      addText(`Laundry Demand Index: ${demo.laundryDemandIndex}/100`);
      
      // Data source indicator
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`Data Source: ${demo.dataSource} (${Math.round(demo.dataConfidence * 100)}% confidence)`, margin, yPos);
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(10);
      yPos += 8;
    } else if (demographicData) {
      addText(`Population Density: ${demographicData.populationDensity}`);
      addText(`Median Income: ${demographicData.medianIncome}`);
      addText(`${demographicData.householdTypes}`);
      addText(`${demographicData.ageDistribution}`);
    }
    yPos += 10;
  }

  // Property Intelligence Section (Pro tier and above)
  if (enrichedData?.property) {
    addSection("Property Intelligence");
    const prop = enrichedData.property;
    
    addText(`Assessed Value: $${prop.assessedValue.toLocaleString()}`);
    addText(`Market Value: $${prop.marketValue.toLocaleString()}`);
    addText(`Year Built: ${prop.yearBuilt}`);
    addText(`Building Size: ${prop.buildingSqFt.toLocaleString()} sq ft`);
    addText(`Property Type: ${prop.propertyType}`);
    addText(`Annual Taxes: $${prop.taxAmount.toLocaleString()}`);
    
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Data Source: ${prop.dataSource} (${Math.round(prop.dataConfidence * 100)}% confidence)`, margin, yPos);
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    yPos += 10;
  }

  // Growth Signals Section (Pro tier and above)
  if (enrichedData?.growthSignals) {
    addSection("Market Growth Signals");
    const growth = enrichedData.growthSignals;
    
    addText(`Growth Score: ${growth.growthScore}/100`);
    addText(`Recent Permits: ${growth.recentPermits}`);
    addText(`New Construction Permits: ${growth.newConstructionPermits}`);
    addText(`1-Year Home Value Change: ${growth.homeValueChange1Yr >= 0 ? '+' : ''}${growth.homeValueChange1Yr.toFixed(1)}%`);
    addText(`5-Year Home Value Change: ${growth.homeValueChange5Yr >= 0 ? '+' : ''}${growth.homeValueChange5Yr.toFixed(1)}%`);
    addText(`Inventory Level: ${growth.inventoryLevel}`);
    yPos += 10;
  }

  // Valuation Estimate Section (Pro tier and above)
  const tierConfig = REPORT_TIERS[tier];
  if (tierConfig.includesValuation) {
    doc.addPage();
    yPos = 30;
    addSection("Business Valuation Estimate");
    
    // Get EBITDA multiples based on CLEANBI grade
    const gradeMultiples: Record<string, { min: number; mid: number; max: number }> = {
      'A': { min: 4.0, mid: 4.75, max: 5.5 },
      'B': { min: 2.8, mid: 3.4, max: 4.0 },
      'C': { min: 1.8, mid: 2.3, max: 2.8 },
      'Needs Work': { min: 0.8, mid: 1.3, max: 1.8 }
    };
    const multiples = gradeMultiples[cleanbiResult.grade] || gradeMultiples['C'];
    
    // Industry benchmark revenue for valuation example
    const avgRevenue = 250000; // Industry average
    const avgEbitdaMargin = 0.25; // 25% EBITDA margin
    const estimatedEbitda = avgRevenue * avgEbitdaMargin;
    
    addText("EBITDA Multiple Analysis (Based on CLEANBI Grade):");
    yPos += 5;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(`Grade ${cleanbiResult.grade} Multiple Range: ${multiples.min}x - ${multiples.max}x EBITDA`, margin, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    
    addText("Valuation Methodology:");
    addBullet(`EBITDA Multiple: ${multiples.mid}x (mid-range for Grade ${cleanbiResult.grade})`);
    addBullet(`Revenue Multiple: 0.8x - 1.2x (industry standard)`);
    addBullet(`Asset-Based: Equipment FMV + working capital`);
    yPos += 5;
    
    addText("Example Valuation (Using Industry Average $250K Revenue):");
    const lowVal = Math.round(estimatedEbitda * multiples.min);
    const midVal = Math.round(estimatedEbitda * multiples.mid);
    const highVal = Math.round(estimatedEbitda * multiples.max);
    
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(margin, yPos - 2, pageWidth - 2 * margin, 35, 3, 3, "F");
    yPos += 8;
    
    doc.setFontSize(11);
    addText(`Estimated EBITDA: $${estimatedEbitda.toLocaleString()} (at 25% margin)`);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const gradeColor = cleanbiResult.grade === "A" ? [34, 197, 94] :
                       cleanbiResult.grade === "B" ? [59, 130, 246] :
                       cleanbiResult.grade === "C" ? [251, 191, 36] : [239, 68, 68];
    doc.setTextColor(gradeColor[0], gradeColor[1], gradeColor[2]);
    doc.text(`Valuation Range: $${lowVal.toLocaleString()} - $${highVal.toLocaleString()}`, margin, yPos);
    yPos += 8;
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text(`Mid-Point Estimate: $${midVal.toLocaleString()}`, margin, yPos);
    yPos += 12;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    
    addText("Note: This is an illustrative example. Actual valuation requires verified financials.");
    addText("For a precise valuation, schedule a consultation with Larry Larsen.");
    yPos += 10;
    
    // Disclaimer
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    addText("DISCLAIMER: This valuation estimate is for informational purposes only and does not constitute financial advice. Actual business value may vary significantly based on verified financial data, market conditions, and other factors. Consult with qualified professionals before making investment decisions.");
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
  }

  if (visionAnalysis) {
    doc.addPage();
    yPos = 30;
    addSection("Vision AI Analysis");
    
    const va = visionAnalysis.streetViewAnalysis;
    addText(`Building Condition: ${va.buildingCondition}`);
    addText(`Parking Availability: ${va.parkingAvailability}`);
    addText(`Street Visibility: ${va.visibility}`);
    addText(`Signage Quality: ${va.signage}`);
    addText(`Visual Score: ${va.overallScore}/100`);
    
    if (visionAnalysis.aerialAnalysis) {
      yPos += 10;
      addText(`Surrounding Area: ${visionAnalysis.aerialAnalysis.surroundingArea}`);
      addText(`Accessibility: ${visionAnalysis.aerialAnalysis.accessibility}`);
      if (visionAnalysis.aerialAnalysis.nearbyAmenities?.length > 0) {
        addText(`Nearby Amenities: ${visionAnalysis.aerialAnalysis.nearbyAmenities.join(", ")}`);
      }
    }
    yPos += 10;
  }

  if (aiInsights) {
    doc.addPage();
    yPos = 30;
    addSection("Executive Summary");
    addText(aiInsights.executiveSummary);
    yPos += 10;

    addSection("Key Opportunities");
    aiInsights.keyOpportunities.forEach((opp) => {
      addBullet(opp);
    });
    yPos += 10;

    addSection("Risk Factors");
    aiInsights.riskFactors.forEach((risk) => {
      addBullet(risk);
    });
    yPos += 10;

    doc.addPage();
    yPos = 30;
    addSection("Strategic Recommendations");
    aiInsights.recommendations.forEach((rec, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 30;
      }
      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}. ${rec.action}`, margin, yPos);
      yPos += 6;
      doc.setFont("helvetica", "normal");
      doc.text(`   Impact: ${rec.impact.toUpperCase()} | Timeframe: ${rec.timeframe}`, margin, yPos);
      yPos += 6;
      if (rec.estimatedRoi) {
        doc.text(`   ROI: ${rec.estimatedRoi}`, margin, yPos);
        yPos += 6;
      }
      yPos += 6;
    });

    yPos += 10;
    addSection("Market Analysis");
    addText(`Market Opportunity: ${aiInsights.marketOpportunity}`);
    addText(`Projected Growth: ${aiInsights.projectedGrowth}`);
  }

  addSection("Recommendations");
  cleanbiResult.recommendations?.forEach((rec: string) => {
    addBullet(rec);
  });
  
  if (cleanbiResult.warnings?.length > 0) {
    yPos += 10;
    addSection("Warnings");
    cleanbiResult.warnings.forEach((warning: string) => {
      addBullet(warning);
    });
  }

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages} | CLEANBI™ ${REPORT_TIERS[tier].name} | © ${new Date().getFullYear()} WashBizHub`,
      pageWidth / 2,
      290,
      { align: "center" }
    );
  }

  return Buffer.from(doc.output("arraybuffer"));
}

export async function generateCleanbiReport(
  address: string,
  tier: ReportTier,
  userId?: string
): Promise<ReportGenerationResult> {
  const tierConfig = REPORT_TIERS[tier];

  const cleanbiResult = await calculateGoogleCleanbi({ address });

  const lat = cleanbiResult.breakdown.location.data.coordinates.lat;
  const lng = cleanbiResult.breakdown.location.data.coordinates.lng;
  const formattedAddress = cleanbiResult.breakdown.location.data.formattedAddress || address;

  let visionAnalysis: VisionAnalysisResult | undefined;
  let competitorData: CompetitorDeepDive | undefined;
  let demographicData: DemographicData | undefined;
  let aiInsights: AiInsights | undefined;
  let walkScoreData: WalkScoreResult | undefined;
  let enrichedData: EnrichedCLEANBIData | undefined;

  // Fetch Walk Score for standard tier and above
  if (tierConfig.includesWalkScore) {
    try {
      walkScoreData = await getWalkScore(lat, lng, formattedAddress);
      console.log(`📊 Walk Score fetched: ${walkScoreData.walkScore}`);
    } catch (error) {
      console.error("Walk Score fetch error:", error);
    }
  }

  // Fetch enriched data (demographics, property, etc.) for standard tier and above
  if (tierConfig.includesDemographics || tierConfig.includesProperty) {
    try {
      const enrichmentTier = tier === 'quick' ? 'free' : 
                             tier === 'standard' ? 'starter' : 
                             tier === 'pro' ? 'pro' : 'enterprise';
      enrichedData = await enrichCLEANBIData(address, { tier: enrichmentTier });
      
      // Build demographic data for PDF
      if (enrichedData) {
        demographicData = {
          populationDensity: `${enrichedData.demographics.populationDensity.toLocaleString()} people/sq mi`,
          medianIncome: `$${enrichedData.demographics.medianHouseholdIncome.toLocaleString()}`,
          ageDistribution: `Median age: ${enrichedData.demographics.medianAge}`,
          householdTypes: `${Math.round(enrichedData.demographics.renterPercentage)}% renters`,
          growthTrend: enrichedData.growthSignals?.growthScore 
            ? `Growth Score: ${enrichedData.growthSignals.growthScore}/100` 
            : "Data not available"
        };
      }
      console.log(`📊 Enriched data fetched: ${enrichedData?.dataQuality.sourcesUsed.join(', ')}`);
    } catch (error) {
      console.error("Data enrichment error:", error);
    }
  }

  if (tierConfig.includesVision) {
    const streetViewUrl = await fetchStreetViewImage(lat, lng);
    if (streetViewUrl) {
      visionAnalysis = await analyzeImageWithVision(streetViewUrl);
      visionAnalysis.imageUrl = streetViewUrl;
    }
  }

  if (tierConfig.includesDeepCompetitor) {
    const competitors = cleanbiResult.breakdown.competition.data.competitors || [];
    competitorData = await getDeepCompetitorAnalysis(lat, lng, competitors);
  }

  if (tierConfig.includesAiInsights) {
    aiInsights = await generateAiInsights(cleanbiResult, visionAnalysis, competitorData);
  }

  const pdfBuffer = generatePDF(
    address,
    cleanbiResult,
    tier,
    visionAnalysis,
    competitorData,
    demographicData,
    aiInsights,
    walkScoreData,
    enrichedData
  );

  let pdfUrl = "";
  
  try {
    const objectStorage = new ObjectStorageService();
    const privateDir = objectStorage.getPrivateObjectDir();
    const timestamp = Date.now();
    const sanitizedAddress = address.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
    const fileName = `cleanbi-reports/${userId || "anonymous"}/${sanitizedAddress}_${timestamp}.pdf`;
    const fullPath = `${privateDir}/${fileName}`;

    const pathParts = fullPath.split("/");
    const bucketName = pathParts[1];
    const objectName = pathParts.slice(2).join("/");

    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(objectName);

    await file.save(pdfBuffer, {
      contentType: "application/pdf",
      metadata: {
        cacheControl: "public, max-age=31536000",
      },
    });

    pdfUrl = `/objects/${fileName}`;
  } catch (error) {
    console.error("Error uploading PDF to object storage:", error);
    pdfUrl = `/api/cleanbi/reports/download/${randomUUID()}`; // Fallback URL pattern
  }

  return {
    pdfBuffer,
    pdfUrl,
    reportData: {
      cleanbiScore: cleanbiResult.score,
      cleanbiGrade: cleanbiResult.grade,
      visionAnalysis,
      competitorData,
      demographicData,
      aiInsights,
    },
  };
}
