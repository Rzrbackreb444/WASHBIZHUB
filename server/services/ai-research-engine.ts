/**
 * AI Research Engine - Self-Auditing & Improvement System
 * 
 * Uses Grok/xAI + Perplexity for real-time research to:
 * 1. Audit platform gaps and generate improvement reports
 * 2. Research and generate missing error codes
 * 3. Research and generate missing parts catalog entries
 * 4. Analyze competitor features and recommend enhancements
 * 5. Generate comprehensive manufacturer-specific data
 */

import OpenAI from "openai";
import { db } from "../db";
import { diagnosticCodes, parts } from "@shared/schema";
import { eq, sql, count, countDistinct } from "drizzle-orm";

const MANUFACTURERS = [
  "Speed Queen", "Dexter", "Maytag Commercial", "Continental Girbau",
  "Huebsch", "UniMac", "Electrolux", "IPSO", "Primus", "ADC",
  "Whirlpool Commercial", "LG Commercial", "Samsung Commercial",
  "Wascomat", "Milnor", "Chicago Dryer", "B&C Technologies",
  "Girbau", "Alliance Laundry", "Tolon", "Jensen", "Pellerin Milnor"
];

interface ResearchResult {
  success: boolean;
  data: any;
  source: string;
  timestamp: Date;
}

interface AuditReport {
  timestamp: Date;
  currentState: {
    totalErrorCodes: number;
    totalParts: number;
    manufacturerCoverage: Record<string, number>;
  };
  gaps: {
    missingManufacturers: string[];
    lowCoverageManufacturers: { name: string; count: number; target: number }[];
    missingCategories: string[];
  };
  recommendations: string[];
  priority: "critical" | "high" | "medium" | "low";
}

class AIResearchEngine {
  private grok: OpenAI | null = null;
  private perplexity: OpenAI | null = null;

  constructor() {
    if (process.env.GROK_API_KEY) {
      this.grok = new OpenAI({
        apiKey: process.env.GROK_API_KEY,
        baseURL: "https://api.x.ai/v1",
      });
      console.log("🔬 AI Research Engine: Grok configured");
    }

    if (process.env.PERPLEXITY_API_KEY) {
      this.perplexity = new OpenAI({
        apiKey: process.env.PERPLEXITY_API_KEY,
        baseURL: "https://api.perplexity.ai",
      });
      console.log("🔬 AI Research Engine: Perplexity configured");
    }
  }

  async selfAudit(): Promise<AuditReport> {
    console.log("🔍 Running self-audit...");

    const [codeCount] = await db.select({ count: count() }).from(diagnosticCodes);
    const [partCount] = await db.select({ count: count() }).from(parts);

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

    const TARGET_CODES_PER_MANUFACTURER = 500;

    const missingManufacturers = MANUFACTURERS.filter(m => !coverageMap[m]);
    const lowCoverage = MANUFACTURERS
      .filter(m => coverageMap[m] && coverageMap[m] < TARGET_CODES_PER_MANUFACTURER)
      .map(m => ({ name: m, count: coverageMap[m] || 0, target: TARGET_CODES_PER_MANUFACTURER }));

    const recommendations: string[] = [];

    if (missingManufacturers.length > 0) {
      recommendations.push(`Add error codes for ${missingManufacturers.length} missing manufacturers: ${missingManufacturers.slice(0, 5).join(", ")}${missingManufacturers.length > 5 ? "..." : ""}`);
    }

    if (lowCoverage.length > 0) {
      recommendations.push(`Expand coverage for ${lowCoverage.length} manufacturers with <${TARGET_CODES_PER_MANUFACTURER} codes`);
    }

    if (partCount.count < 5000) {
      recommendations.push(`Expand parts catalog from ${partCount.count} to 10,000+ parts`);
    }

    const priority = missingManufacturers.length > 5 ? "critical" :
      lowCoverage.length > 10 ? "high" :
        partCount.count < 1000 ? "high" : "medium";

    return {
      timestamp: new Date(),
      currentState: {
        totalErrorCodes: codeCount.count,
        totalParts: partCount.count,
        manufacturerCoverage: coverageMap,
      },
      gaps: {
        missingManufacturers,
        lowCoverageManufacturers: lowCoverage,
        missingCategories: [],
      },
      recommendations,
      priority,
    };
  }

  async researchErrorCodes(manufacturer: string, machineType: "washer" | "dryer" | "both" = "both"): Promise<ResearchResult> {
    if (!this.grok) {
      return { success: false, data: null, source: "none", timestamp: new Date() };
    }

    console.log(`🔬 Researching error codes for ${manufacturer}...`);

    const prompt = `You are a commercial laundry equipment expert. Generate a comprehensive list of error codes for ${manufacturer} commercial ${machineType === "both" ? "washers and dryers" : machineType + "s"}.

For each error code, provide:
1. Code (exactly as displayed on machine)
2. Description (what the error means)
3. Possible causes (3-5 causes)
4. Troubleshooting steps (ordered by likelihood)
5. Required parts (if applicable, with part numbers)
6. Severity (high/medium/low)
7. Skill level needed (basic/intermediate/professional)
8. Estimated repair time

Format as JSON array:
[
  {
    "code": "E01",
    "description": "Water inlet error",
    "machineType": "washer",
    "causes": ["Blocked inlet valve", "Low water pressure", "Faulty sensor"],
    "troubleshooting": ["Check water supply", "Inspect inlet filter", "Test valve solenoid"],
    "parts": [{"number": "ABC-123", "name": "Inlet Valve", "price": "$45"}],
    "severity": "medium",
    "skillLevel": "intermediate",
    "repairTime": "30-60 minutes"
  }
]

Generate at least 50 unique, accurate error codes based on real ${manufacturer} equipment documentation.`;

    try {
      const response = await this.grok.chat.completions.create({
        model: "grok-3-latest",
        messages: [
          { role: "system", content: "You are a commercial laundry equipment diagnostic expert with 30 years of experience servicing Speed Queen, Dexter, Maytag, Continental, and other major brands." },
          { role: "user", content: prompt }
        ],
        max_tokens: 8000,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content || "";

      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const codes = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          data: codes,
          source: "grok",
          timestamp: new Date(),
        };
      }

      return { success: false, data: null, source: "grok", timestamp: new Date() };
    } catch (error) {
      console.error(`Error researching ${manufacturer}:`, error);
      return { success: false, data: null, source: "grok", timestamp: new Date() };
    }
  }

  async researchParts(manufacturer: string, category: string): Promise<ResearchResult> {
    if (!this.grok) {
      return { success: false, data: null, source: "none", timestamp: new Date() };
    }

    console.log(`🔬 Researching parts for ${manufacturer} - ${category}...`);

    const prompt = `You are a commercial laundry parts specialist. Generate a comprehensive parts catalog for ${manufacturer} ${category}.

For each part, provide:
1. Part number (OEM format)
2. Name
3. Description
4. Price range (USD)
5. Compatible models
6. Category
7. Availability (in-stock/special-order)
8. Lead time

Format as JSON array:
[
  {
    "partNumber": "9539-461-001",
    "name": "Door Lock Assembly",
    "description": "OEM door lock mechanism for front-load washers",
    "priceMin": 65,
    "priceMax": 85,
    "compatibleModels": ["X-350", "X-450", "T-300"],
    "category": "Door Parts",
    "availability": "in-stock",
    "leadTime": "1-2 days"
  }
]

Generate at least 30 unique, accurate parts based on real ${manufacturer} catalogs.`;

    try {
      const response = await this.grok.chat.completions.create({
        model: "grok-3-latest",
        messages: [
          { role: "system", content: "You are a commercial laundry parts specialist with deep knowledge of OEM part numbers, pricing, and compatibility across all major brands." },
          { role: "user", content: prompt }
        ],
        max_tokens: 6000,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content || "";

      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parts = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          data: parts,
          source: "grok",
          timestamp: new Date(),
        };
      }

      return { success: false, data: null, source: "grok", timestamp: new Date() };
    } catch (error) {
      console.error(`Error researching parts for ${manufacturer}:`, error);
      return { success: false, data: null, source: "grok", timestamp: new Date() };
    }
  }

  async analyzeCompetitor(competitorName: string): Promise<ResearchResult> {
    if (!this.perplexity) {
      return { success: false, data: null, source: "none", timestamp: new Date() };
    }

    console.log(`🔬 Analyzing competitor: ${competitorName}...`);

    try {
      const response = await this.perplexity.chat.completions.create({
        model: "llama-3.1-sonar-large-128k-online",
        messages: [
          {
            role: "system",
            content: "You are a competitive intelligence analyst specializing in commercial laundry technology and SaaS platforms."
          },
          {
            role: "user",
            content: `Analyze ${competitorName} as a commercial laundry management system. Include:
1. Key features and capabilities
2. Pricing structure
3. Limitations and gaps
4. Integration capabilities
5. Market positioning
6. How Service Guy AI could differentiate and enhance beyond their offering

Focus on actionable competitive intelligence.`
          }
        ],
        max_tokens: 2000,
      });

      return {
        success: true,
        data: response.choices[0]?.message?.content || "",
        source: "perplexity",
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`Error analyzing ${competitorName}:`, error);
      return { success: false, data: null, source: "perplexity", timestamp: new Date() };
    }
  }

  async generateImprovementPlan(): Promise<string> {
    const audit = await this.selfAudit();

    if (!this.grok) {
      return JSON.stringify(audit, null, 2);
    }

    const prompt = `Based on this platform audit, generate a prioritized improvement plan:

${JSON.stringify(audit, null, 2)}

Create an actionable plan with:
1. Immediate actions (this week)
2. Short-term goals (this month)
3. Long-term vision (this quarter)
4. Specific metrics to hit
5. Technical implementation steps

Focus on making Service Guy AI undeniable for enterprise laundry distributors like EVI Industries/AAdvantage.`;

    try {
      const response = await this.grok.chat.completions.create({
        model: "grok-3-latest",
        messages: [
          { role: "system", content: "You are a product strategist for B2B SaaS platforms targeting commercial laundry industry." },
          { role: "user", content: prompt }
        ],
        max_tokens: 3000,
      });

      return response.choices[0]?.message?.content || JSON.stringify(audit, null, 2);
    } catch (error) {
      console.error("Error generating improvement plan:", error);
      return JSON.stringify(audit, null, 2);
    }
  }

  async expandManufacturer(manufacturer: string): Promise<{ codesAdded: number; partsAdded: number }> {
    console.log(`📈 Expanding coverage for ${manufacturer}...`);

    const codesResult = await this.researchErrorCodes(manufacturer);
    let codesAdded = 0;

    if (codesResult.success && Array.isArray(codesResult.data)) {
      for (const code of codesResult.data) {
        try {
          const slug = `${manufacturer.toLowerCase().replace(/\s+/g, "-")}-${code.code.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

          await db.insert(diagnosticCodes).values({
            code: code.code,
            manufacturer,
            machineType: code.machineType || "washer",
            description: code.description,
            possibleCauses: code.causes || [],
            troubleshootingSteps: code.troubleshooting || [],
            requiredParts: code.parts?.map((p: any) => p.number) || [],
            partsWithPricing: code.parts || [],
            severity: code.severity || "medium",
            skillLevel: code.skillLevel || "intermediate",
            estimatedRepairTime: code.repairTime || "30-60 minutes",
            slug,
          }).onConflictDoNothing();

          codesAdded++;
        } catch (e) {
        }
      }
    }

    const categories = ["Motors", "Pumps", "Valves", "Control Boards", "Belts", "Bearings"];
    let partsAdded = 0;

    for (const category of categories.slice(0, 2)) {
      const partsResult = await this.researchParts(manufacturer, category);

      if (partsResult.success && Array.isArray(partsResult.data)) {
        for (const part of partsResult.data) {
          try {
            await db.insert(parts).values({
              name: part.name,
              partNumber: part.partNumber,
              description: part.description,
              price: String(part.priceMin || "0"),
              category: part.category || category,
              inStock: part.availability === "in-stock",
            }).onConflictDoNothing();

            partsAdded++;
          } catch (e) {
          }
        }
      }
    }

    console.log(`✅ ${manufacturer}: +${codesAdded} codes, +${partsAdded} parts`);
    return { codesAdded, partsAdded };
  }

  async runFullExpansion(): Promise<{ totalCodes: number; totalParts: number; manufacturers: string[] }> {
    const audit = await this.selfAudit();
    const expandedManufacturers: string[] = [];
    let totalCodesAdded = 0;
    let totalPartsAdded = 0;

    const toExpand = [
      ...audit.gaps.missingManufacturers.slice(0, 5),
      ...audit.gaps.lowCoverageManufacturers.slice(0, 5).map(m => m.name),
    ];

    for (const manufacturer of toExpand) {
      const result = await this.expandManufacturer(manufacturer);
      totalCodesAdded += result.codesAdded;
      totalPartsAdded += result.partsAdded;
      expandedManufacturers.push(manufacturer);

      await new Promise(r => setTimeout(r, 1000));
    }

    return {
      totalCodes: totalCodesAdded,
      totalParts: totalPartsAdded,
      manufacturers: expandedManufacturers,
    };
  }
}

export const aiResearchEngine = new AIResearchEngine();

export async function runSelfAudit() {
  return aiResearchEngine.selfAudit();
}

export async function generateImprovementPlan() {
  return aiResearchEngine.generateImprovementPlan();
}

export async function expandManufacturerCoverage(manufacturer: string) {
  return aiResearchEngine.expandManufacturer(manufacturer);
}

export async function runFullExpansion() {
  return aiResearchEngine.runFullExpansion();
}

export async function analyzeCompetitor(name: string) {
  return aiResearchEngine.analyzeCompetitor(name);
}
