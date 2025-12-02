// Gemini AI integration for WashBizHub
// Reference: javascript_gemini blueprint

import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing required GEMINI_API_KEY");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateBlogContent(topic: string, category: string): Promise<string> {
  const prompt = `Write a professional, informative blog post about "${topic}" for laundromat operators. 
Category: ${category}
Length: 500-800 words
Tone: Expert, practical, data-driven
Include: Specific actionable advice, industry insights, and real-world examples.`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  const result = await model.generateContent(prompt);
  const response = result.response;
  
  return response.text() || "Unable to generate content";
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

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  const result = await model.generateContent(prompt);
  const response = result.response;
  
  return response.text() || "Unable to generate insights";
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

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text() || "";
  
  // Extract score from response (simple heuristic)
  const scoreMatch = text.match(/score[:\s]+(\d+)/i);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 75;

  return {
    score,
    recommendations: text,
  };
}

/**
 * Generate optimized SEO metadata using AI (Yoast-style)
 */
export async function generateSEOMetadata(input: {
  pageTitle: string;
  pageContent: string;
  industry: string;
  targetKeywords?: string[];
}): Promise<{
  metaTitle: string;
  metaDescription: string;
  slug: string;
  ogTitle: string;
  ogDescription: string;
  twitterTitle: string;
  twitterDescription: string;
  keywords: string[];
}> {
  const prompt = `As an SEO expert, generate optimal metadata for this webpage:

Page Title: ${input.pageTitle}
Industry: ${input.industry}
Target Keywords: ${input.targetKeywords?.join(", ") || "auto-detect from content"}
Content Preview: ${input.pageContent.substring(0, 500)}...

Generate:
1. Meta Title (50-60 characters, include primary keyword, engaging)
2. Meta Description (150-160 characters, include CTA, compelling)
3. URL Slug (SEO-friendly, lowercase, hyphens, no stop words)
4. Open Graph Title (engaging for social shares)
5. Open Graph Description (concise, benefit-driven)
6. Twitter Card Title (punchy, attention-grabbing)
7. Twitter Card Description (conversational, value-focused)
8. Target Keywords (5-7 relevant keywords)

Return ONLY valid JSON in this exact format:
{
  "metaTitle": "Example Title Here",
  "metaDescription": "Example description here...",
  "slug": "example-slug-here",
  "ogTitle": "Example OG Title",
  "ogDescription": "Example OG description",
  "twitterTitle": "Example Twitter Title",
  "twitterDescription": "Example Twitter description",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text() || "";
  
  try {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/) || [null, text];
    const jsonText = jsonMatch[1] || text;
    const parsed = JSON.parse(jsonText.trim());
    
    return {
      metaTitle: parsed.metaTitle || input.pageTitle,
      metaDescription: parsed.metaDescription || "",
      slug: parsed.slug || input.pageTitle.toLowerCase().replace(/\s+/g, "-"),
      ogTitle: parsed.ogTitle || parsed.metaTitle || input.pageTitle,
      ogDescription: parsed.ogDescription || parsed.metaDescription || "",
      twitterTitle: parsed.twitterTitle || parsed.metaTitle || input.pageTitle,
      twitterDescription: parsed.twitterDescription || parsed.metaDescription || "",
      keywords: parsed.keywords || [],
    };
  } catch (error) {
    console.error("Failed to parse Gemini SEO response:", error);
    // Fallback to basic generation
    return {
      metaTitle: input.pageTitle,
      metaDescription: input.pageContent.substring(0, 160),
      slug: input.pageTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      ogTitle: input.pageTitle,
      ogDescription: input.pageContent.substring(0, 160),
      twitterTitle: input.pageTitle,
      twitterDescription: input.pageContent.substring(0, 160),
      keywords: input.targetKeywords || [],
    };
  }
}

/**
 * Extract error codes from machine display image using Gemini Vision
 */
export async function scanErrorCodeFromImage(imageBase64: string, mimeType: string = "image/jpeg"): Promise<{
  extractedText: string;
  errorCodes: string[];
  detectedBrand: string | null;
  detectedModel: string | null;
  machineType: "washer" | "dryer" | "payment" | "unknown";
  confidence: number;
}> {
  const prompt = `You are an expert at reading commercial laundry equipment displays. Analyze this image of a machine display panel.

Extract the following information:
1. Any error codes shown (formats like: E01, E-01, E:01, F21, dE, dL, nF, tS, Er1, Err1, etc.)
2. Equipment brand name if visible (Speed Queen, Dexter, Huebsch, Continental, Maytag, Wascomat, LG, etc.)
3. Model number if visible
4. Machine type (washer, dryer, or payment system)

Return ONLY valid JSON in this exact format:
{
  "extractedText": "All text visible on the display",
  "errorCodes": ["E01", "F21"],
  "detectedBrand": "Speed Queen" or null,
  "detectedModel": "SC40NC" or null,
  "machineType": "washer" or "dryer" or "payment" or "unknown",
  "confidence": 0.95
}

If you cannot read the display or find no error codes, return empty arrays/null values but still valid JSON.`;

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
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/) || [null, text];
      const jsonText = jsonMatch[1] || text;
      const parsed = JSON.parse(jsonText.trim());
      
      return {
        extractedText: parsed.extractedText || "",
        errorCodes: Array.isArray(parsed.errorCodes) ? parsed.errorCodes : [],
        detectedBrand: parsed.detectedBrand || null,
        detectedModel: parsed.detectedModel || null,
        machineType: parsed.machineType || "unknown",
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5
      };
    } catch (parseError) {
      console.error("Failed to parse Gemini Vision response:", parseError);
      
      const codeMatches = text.match(/[A-Z]?[:\-]?[0-9]{1,3}|d[ELU]|nF|tS|oH|Er[r]?[0-9]+/gi) || [];
      
      return {
        extractedText: text,
        errorCodes: codeMatches,
        detectedBrand: null,
        detectedModel: null,
        machineType: "unknown",
        confidence: 0.3
      };
    }
  } catch (error) {
    console.error("Gemini Vision API error:", error);
    throw new Error("Failed to process image with Vision AI");
  }
}
