/**
 * Premium CLEANBI Report Generator
 * 
 * Generates comprehensive PDF location analysis reports using:
 * - Google CLEANBI Engine (scoring)
 * - Google Vision AI (image analysis)
 * - Google Places API (competitor data)
 * - Street View Static API (location images)
 * - Gemini AI (insights and recommendations)
 * - jsPDF (PDF generation)
 */

import { jsPDF } from "jspdf";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { objectStorageClient, ObjectStorageService } from "./objectStorage";
import { calculateGoogleCleanbi } from "./google-cleanbi-engine";
import { CleanbiReport } from "@shared/schema";
import { randomUUID } from "crypto";

export const REPORT_TIERS = {
  standard: {
    id: "standard",
    name: "Standard Report",
    price: 19900, // $199.00 in cents
    features: [
      "CLEANBI Score & Grade",
      "Location Overview",
      "Basic Competitor Analysis",
      "Traffic Insights",
      "5-Page PDF Report"
    ],
    includesVision: false,
    includesAiInsights: false,
    includesDeepCompetitor: false,
  },
  pro: {
    id: "pro",
    name: "Pro Report",
    price: 34900, // $349.00 in cents
    features: [
      "Everything in Standard",
      "Vision AI Image Analysis",
      "Deep Competitor Analysis",
      "Demographic Data",
      "12-Page PDF Report"
    ],
    includesVision: true,
    includesAiInsights: false,
    includesDeepCompetitor: true,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise Report",
    price: 49900, // $499.00 in cents
    features: [
      "Everything in Pro",
      "AI-Powered Recommendations",
      "ROI Projections",
      "Market Opportunity Analysis",
      "Executive Summary",
      "20+ Page Premium Report"
    ],
    includesVision: true,
    includesAiInsights: true,
    includesDeepCompetitor: true,
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
  aiInsights?: AiInsights
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

  let visionAnalysis: VisionAnalysisResult | undefined;
  let competitorData: CompetitorDeepDive | undefined;
  let demographicData: DemographicData | undefined;
  let aiInsights: AiInsights | undefined;

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
    aiInsights
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
