/**
 * WashBizHub Perfection Engine
 * 
 * Multi-AI orchestration system that uses all available API keys to:
 * 1. Self-audit the entire platform continuously
 * 2. Research and fill data gaps automatically
 * 3. Generate improvements without discussion
 * 4. Make WashBizHub undeniably perfect
 * 
 * AI Providers Used:
 * - Grok (xAI): Research, competitive intelligence, real-time data
 * - Perplexity: Web research, fact-checking, source verification
 * - Gemini: Vision analysis, content generation, structured data
 * - OpenAI: Complex reasoning, embeddings, summaries
 * - Anthropic: Deep analysis, code review, documentation
 */

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../db";
import { diagnosticCodes, parts } from "@shared/schema";
import { sql, count } from "drizzle-orm";

// AI Clients
let grok: OpenAI | null = null;
let perplexity: OpenAI | null = null;
let openai: OpenAI | null = null;
let anthropic: Anthropic | null = null;
let gemini: GoogleGenerativeAI | null = null;

// Initialize all AI clients
function initClients() {
  if (process.env.GROK_API_KEY) {
    grok = new OpenAI({ apiKey: process.env.GROK_API_KEY, baseURL: "https://api.x.ai/v1" });
    console.log("🧠 Perfection Engine: Grok initialized");
  }
  if (process.env.PERPLEXITY_API_KEY) {
    perplexity = new OpenAI({ apiKey: process.env.PERPLEXITY_API_KEY, baseURL: "https://api.perplexity.ai" });
    console.log("🧠 Perfection Engine: Perplexity initialized");
  }
  if (process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    openai = new OpenAI({ 
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || undefined
    });
    console.log("🧠 Perfection Engine: OpenAI initialized");
  }
  if (process.env.ANTHROPIC_API_KEY) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    console.log("🧠 Perfection Engine: Anthropic initialized");
  }
  if (process.env.GEMINI_API_KEY) {
    gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("🧠 Perfection Engine: Gemini initialized");
  }
}

initClients();

// AAdvantage brands - these are Ryan's priority
const AADVANTAGE_BRANDS = [
  "Dexter",
  "Continental Girbau", 
  "Maytag",
  "Whirlpool",
  "LG",
  "B&C Technologies",
  "Econ-O",
];

// Complete manufacturer list
const ALL_MANUFACTURERS = [
  ...AADVANTAGE_BRANDS,
  "Speed Queen", "Huebsch", "UniMac", "Electrolux", "IPSO", "Primus", "ADC",
  "Wascomat", "Milnor", "Chicago Dryer", "Girbau", "Alliance Laundry", "Tolon",
  "Jensen", "Pellerin Milnor", "GE", "Samsung", "Kenmore", "Frigidaire", "Bosch",
  "Miele", "Asko", "Fisher & Paykel", "Haier", "Fagor", "Danube", "Schulthess",
  "Yamamoto", "Domus", "Lavatec", "Sea-Lion", "Cissell", "American Dryer",
];

interface BrandCoverage {
  name: string;
  codes: number;
  target: number;
}

interface PlatformAudit {
  timestamp: Date;
  overallScore: number;
  totalErrorCodes: number;
  totalParts: number;
  aadvantageBrands: BrandCoverage[];
  categories: {
    serviceGuyAI: { score: number; gaps: string[]; recommendations: string[] };
    errorCodeCoverage: { score: number; gaps: string[]; recommendations: string[] };
    partsCatalog: { score: number; gaps: string[]; recommendations: string[] };
    aadvantageReadiness: { score: number; gaps: string[]; recommendations: string[] };
    userExperience: { score: number; gaps: string[]; recommendations: string[] };
  };
  priority: "critical" | "high" | "medium" | "low";
  nextActions: string[];
}

interface ResearchTask {
  type: "error_codes" | "parts" | "competitor" | "market_data" | "content";
  target: string;
  priority: number;
  status: "pending" | "in_progress" | "completed" | "failed";
  result?: any;
}

class WashBizHubPerfectionEngine {
  private researchQueue: ResearchTask[] = [];

  async runFullAudit(): Promise<PlatformAudit> {
    console.log("🔍 Running comprehensive platform audit...");

    // Get current database stats
    const [codeCount] = await db.select({ count: count() }).from(diagnosticCodes);
    const [partCount] = await db.select({ count: count() }).from(parts);

    // Get manufacturer coverage
    const manufacturerStats = await db
      .select({
        manufacturer: diagnosticCodes.manufacturer,
        count: count(),
      })
      .from(diagnosticCodes)
      .groupBy(diagnosticCodes.manufacturer);

    const coverageMap: Record<string, number> = {};
    manufacturerStats.forEach(s => {
      coverageMap[s.manufacturer] = s.count;
    });

    // Calculate scores
    const totalCodes = codeCount.count;
    const totalParts = partCount.count;

    // Target: 20,000+ codes, 10,000+ parts
    const codeScore = Math.min(100, (totalCodes / 20000) * 100);
    const partScore = Math.min(100, (totalParts / 10000) * 100);

    // AAdvantage brand coverage (critical for Ryan pitch)
    const aadvantageCodesNeeded = 500; // per brand
    let aadvantageScore = 0;
    const aadvantageGaps: string[] = [];
    
    for (const brand of AADVANTAGE_BRANDS) {
      const count = coverageMap[brand] || 0;
      aadvantageScore += Math.min(100, (count / aadvantageCodesNeeded) * 100);
      if (count < aadvantageCodesNeeded) {
        aadvantageGaps.push(`${brand}: ${count}/${aadvantageCodesNeeded} codes`);
      }
    }
    aadvantageScore = aadvantageScore / AADVANTAGE_BRANDS.length;

    // Service Guy AI score (features completeness)
    const serviceGuyScore = 85; // Base score - features are built

    // UX score
    const uxScore = 93; // Based on Grok's 9.3/10 rating

    const overallScore = (codeScore + partScore + aadvantageScore + serviceGuyScore + uxScore) / 5;

    // Build structured brand coverage data
    const aadvantageBrands: BrandCoverage[] = AADVANTAGE_BRANDS.map(brand => ({
      name: brand,
      codes: coverageMap[brand] || 0,
      target: aadvantageCodesNeeded,
    }));

    const audit: PlatformAudit = {
      timestamp: new Date(),
      overallScore: Math.round(overallScore * 10) / 10,
      totalErrorCodes: totalCodes,
      totalParts: totalParts,
      aadvantageBrands,
      categories: {
        serviceGuyAI: {
          score: serviceGuyScore,
          gaps: [
            totalCodes < 5000 ? "Error code database needs expansion" : "",
            totalParts < 2000 ? "Parts catalog needs growth" : "",
          ].filter(Boolean),
          recommendations: [
            "Expand error code database to 20,000+",
            "Add photo/video diagnostics demos",
            "Launch enterprise demo for Ryan",
          ],
        },
        errorCodeCoverage: {
          score: Math.round(codeScore),
          gaps: ALL_MANUFACTURERS.filter(m => !coverageMap[m] || coverageMap[m] < 100)
            .slice(0, 10)
            .map(m => `${m}: ${coverageMap[m] || 0} codes`),
          recommendations: [
            `Current: ${totalCodes} codes. Target: 20,000+`,
            "Priority: AAdvantage brands first",
          ],
        },
        partsCatalog: {
          score: Math.round(partScore),
          gaps: [`Current: ${totalParts} parts. Target: 10,000+`],
          recommendations: [
            "Add AAdvantage parts feed integration",
            "Include buy links for all parts",
          ],
        },
        aadvantageReadiness: {
          score: Math.round(aadvantageScore),
          gaps: aadvantageGaps,
          recommendations: [
            "Focus on Dexter, Continental, Maytag first",
            "Add all codes from Ryan's research document",
            "Link parts to AAdvantage inventory",
          ],
        },
        userExperience: {
          score: uxScore,
          gaps: ["Mobile optimization can improve", "Add video tutorials"],
          recommendations: [
            "Subtle animations",
            "Site-wide search",
            "User accounts for saving",
          ],
        },
      },
      priority: overallScore < 50 ? "critical" : overallScore < 70 ? "high" : overallScore < 85 ? "medium" : "low",
      nextActions: [
        "Import all AAdvantage brand codes from research",
        "Expand parts catalog with buy links",
        "Create Ryan demo dashboard",
        "Add photo diagnostics showcase",
      ],
    };

    return audit;
  }

  async researchWithGrok(prompt: string): Promise<string> {
    if (!grok) return "Grok not configured";
    
    try {
      const response = await grok.chat.completions.create({
        model: "grok-3-latest",
        messages: [
          { role: "system", content: "You are a commercial laundry industry expert with 30 years of experience. Provide detailed, accurate, actionable information." },
          { role: "user", content: prompt }
        ],
        max_tokens: 4000,
        temperature: 0.3,
      });
      return response.choices[0]?.message?.content || "";
    } catch (e) {
      console.error("Grok error:", e);
      return "";
    }
  }

  async researchWithPerplexity(query: string): Promise<string> {
    if (!perplexity) return "Perplexity not configured";
    
    try {
      const response = await perplexity.chat.completions.create({
        model: "llama-3.1-sonar-large-128k-online",
        messages: [
          { role: "system", content: "You are a research assistant specializing in commercial laundry industry intelligence." },
          { role: "user", content: query }
        ],
        max_tokens: 2000,
      });
      return response.choices[0]?.message?.content || "";
    } catch (e) {
      console.error("Perplexity error:", e);
      return "";
    }
  }

  async analyzeWithAnthropic(content: string, task: string): Promise<string> {
    if (!anthropic) return "Anthropic not configured";
    
    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        system: "You are a senior analyst for a B2B SaaS platform serving the commercial laundry industry.",
        messages: [{ role: "user", content: `${task}\n\nContent:\n${content}` }],
      });
      return response.content[0].type === "text" ? response.content[0].text : "";
    } catch (e) {
      console.error("Anthropic error:", e);
      return "";
    }
  }

  async generateWithGemini(prompt: string): Promise<string> {
    if (!gemini) return "Gemini not configured";
    
    try {
      const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      console.error("Gemini error:", e);
      return "";
    }
  }

  async generateImprovementPlan(): Promise<string> {
    const audit = await this.runFullAudit();
    
    const prompt = `Based on this WashBizHub platform audit, generate a prioritized improvement plan to achieve a 10/10 rating:

${JSON.stringify(audit, null, 2)}

Context:
- We're pitching to Ryan Smith at AAdvantage/EVI Industries
- Need to make Service Guy AI undeniable for enterprise distributors
- AAdvantage sells: Dexter, Continental Girbau, Maytag, Whirlpool, LG, B&C Technologies
- Goal: Create the most powerful platform the laundromat industry has ever seen

Generate:
1. Immediate actions (next 24 hours)
2. This week priorities
3. Specific metrics to hit
4. Ryan pitch preparation steps`;

    let plan = "";
    
    // Use multiple AIs for comprehensive planning
    if (grok) {
      plan = await this.researchWithGrok(prompt);
    } else if (anthropic) {
      plan = await this.analyzeWithAnthropic(JSON.stringify(audit), prompt);
    } else if (gemini) {
      plan = await this.generateWithGemini(prompt);
    }
    
    return plan || JSON.stringify(audit, null, 2);
  }

  async expandErrorCodesFromResearch(brandData: any): Promise<{ added: number; errors: string[] }> {
    let added = 0;
    const errors: string[] = [];
    
    if (!brandData?.brands) {
      return { added: 0, errors: ["Invalid brand data format"] };
    }

    for (const [brandName, brand] of Object.entries(brandData.brands) as any) {
      if (!brand.error_codes) continue;
      
      for (const code of brand.error_codes) {
        try {
          const slug = `${brandName.toLowerCase().replace(/\s+/g, "-")}-${code.code.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
          
          await db.insert(diagnosticCodes).values({
            code: code.code,
            manufacturer: brandName,
            machineType: "washer",
            description: code.description,
            possibleCauses: [code.troubleshooting || ""],
            troubleshootingSteps: [code.troubleshooting || ""],
            requiredParts: code.common_parts?.map((p: any) => p.part_number) || [],
            partsWithPricing: code.common_parts?.map((p: any) => ({
              partNumber: p.part_number,
              name: p.description,
              price: p.cost,
              link: p.link,
            })) || [],
            severity: "medium",
            skillLevel: "intermediate",
            estimatedRepairTime: "30-60 minutes",
            slug,
          }).onConflictDoNothing();
          
          added++;
        } catch (e) {
          errors.push(`Error adding ${brandName} ${code.code}: ${e}`);
        }
      }
    }
    
    return { added, errors };
  }

  async analyzeCompetitor(name: string): Promise<any> {
    const queries = [
      `What are ${name}'s key features, pricing, and limitations as a commercial laundry management platform?`,
      `How does ${name} compare to other laundromat software solutions in 2025?`,
      `What do ${name} users complain about most in reviews?`,
    ];

    const results: string[] = [];
    
    if (perplexity) {
      for (const query of queries) {
        const result = await this.researchWithPerplexity(query);
        if (result) results.push(result);
        await new Promise(r => setTimeout(r, 500));
      }
    }

    if (grok && results.length === 0) {
      const result = await this.researchWithGrok(
        `Analyze ${name} as a competitor in the commercial laundry technology space. Include features, pricing, limitations, and how WashBizHub can differentiate.`
      );
      if (result) results.push(result);
    }

    return {
      competitor: name,
      analysis: results.join("\n\n---\n\n"),
      timestamp: new Date(),
    };
  }

  async getMarketIntelligence(): Promise<any> {
    const topics = [
      "commercial laundry industry market size 2025",
      "laundromat acquisition multiples 2025",
      "laundry equipment technology trends 2025",
    ];

    const intelligence: Record<string, string> = {};
    
    for (const topic of topics) {
      if (perplexity) {
        intelligence[topic] = await this.researchWithPerplexity(topic);
      } else if (grok) {
        intelligence[topic] = await this.researchWithGrok(`Research: ${topic}`);
      }
      await new Promise(r => setTimeout(r, 500));
    }

    return intelligence;
  }
}

export const perfectionEngine = new WashBizHubPerfectionEngine();

// Export functions for API routes
export const runFullAudit = () => perfectionEngine.runFullAudit();
export const generateImprovementPlan = () => perfectionEngine.generateImprovementPlan();
export const analyzeCompetitor = (name: string) => perfectionEngine.analyzeCompetitor(name);
export const getMarketIntelligence = () => perfectionEngine.getMarketIntelligence();
export const expandFromResearch = (data: any) => perfectionEngine.expandErrorCodesFromResearch(data);
