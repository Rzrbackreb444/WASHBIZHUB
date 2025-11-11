// Gemini AI integration for WashBizHub
// Reference: javascript_gemini blueprint

import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing required GEMINI_API_KEY");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateBlogContent(topic: string, category: string): Promise<string> {
  const prompt = `Write a professional, informative blog post about "${topic}" for laundromat operators. 
Category: ${category}
Length: 500-800 words
Tone: Expert, practical, data-driven
Include: Specific actionable advice, industry insights, and real-world examples.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: prompt,
  });

  return response.text || "Unable to generate content";
}

export async function generateCleanbiInsights(scores: {
  customer: number;
  location: number;
  equipment: number;
  adaptability: number;
  numbers: number;
  intelligence: number;
  brand: number;
}): Promise<string> {
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const avgScore = totalScore / 7;

  const prompt = `As a laundromat business consultant, analyze this CLEANBI™ assessment:
  
Customer Experience: ${scores.customer}/100
Location Quality: ${scores.location}/100
Equipment Grade: ${scores.equipment}/100
Adaptability: ${scores.adaptability}/100
Financial Numbers: ${scores.numbers}/100
Business Intelligence: ${scores.intelligence}/100
Brand Strength: ${scores.brand}/100

Total Score: ${totalScore}/700 (Avg: ${avgScore.toFixed(1)}/100)

Provide:
1. Top 3 strengths to leverage
2. Top 3 areas needing immediate improvement
3. 5 specific, actionable recommendations with expected ROI
4. Growth strategy roadmap

Keep response under 400 words, highly actionable.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: prompt,
  });

  return response.text || "Unable to generate insights";
}

export async function optimizeLayout(equipment: any[], dimensions: any): Promise<{
  score: number;
  recommendations: string;
}> {
  const equipmentSummary = equipment.map((e) => ({
    name: e.equipment.name,
    type: e.equipment.type,
    capacity: e.equipment.capacity,
  }));

  const prompt = `As a laundromat layout optimization expert, analyze this design:

Room Dimensions: ${dimensions.width}" × ${dimensions.depth}"
Equipment: ${JSON.stringify(equipmentSummary, null, 2)}

Evaluate:
1. Traffic flow and customer movement patterns
2. Equipment accessibility and ADA compliance
3. Space utilization efficiency
4. Revenue optimization potential

Provide:
- Overall layout score (0-100)
- 3-5 specific improvement recommendations
- Expected revenue impact

Keep under 200 words.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: prompt,
  });

  const text = response.text || "";
  
  // Extract score from response (simple heuristic)
  const scoreMatch = text.match(/score[:\s]+(\d+)/i);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 75;

  return {
    score,
    recommendations: text,
  };
}
