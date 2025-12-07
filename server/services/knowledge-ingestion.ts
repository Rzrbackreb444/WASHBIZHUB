import OpenAI from "openai";
import { db } from "../db";
import { knowledgeChunks, serviceManuals, diagnosticCodes } from "@shared/schema";
import { eq, and, ilike, or } from "drizzle-orm";
import { sql } from "drizzle-orm";

const grok = process.env.GROK_API_KEY
  ? new OpenAI({
      apiKey: process.env.GROK_API_KEY,
      baseURL: "https://api.x.ai/v1",
    })
  : null;

interface KnowledgeSearchResult {
  success: boolean;
  source: "database" | "grok_search" | "cached";
  knowledge: ExtractedKnowledge | null;
  message?: string;
}

interface ExtractedKnowledge {
  title: string;
  manufacturer: string;
  errorCode?: string;
  machineType?: string;
  modelSeries?: string;
  description: string;
  possibleCauses: string[];
  troubleshootingSteps: string[];
  safetyWarnings: string[];
  requiredTools: string[];
  partsWithPricing: Array<{
    partNumber: string;
    name: string;
    estimatedPrice?: string;
    supplier?: string;
  }>;
  quickFix?: string;
  estimatedRepairTime?: number;
  skillLevel: "basic" | "intermediate" | "professional";
  testModeEntry?: string;
  proTips: string[];
  commonMistakes: string[];
  whenToCallPro: string[];
  sourceUrl?: string;
  confidence: number;
}

const MASTER_TECH_SYSTEM_PROMPT = `You are a Master Service Technician with 30+ years of experience repairing commercial laundry equipment (washers, dryers, payment systems) for Speed Queen, Dexter, Maytag, Huebsch, UniMac, Continental Girbau, Electrolux, LG, Samsung, Whirlpool, and all major brands.

Your approach to diagnosis:
1. SAFETY FIRST - Always identify electrical/gas hazards before any repair
2. SYSTEMATIC - Start with the simplest, cheapest fix and work up
3. COST-CONSCIOUS - Consider repair vs replace economics
4. FIELD-TESTED - Only recommend fixes you've personally done successfully
5. PARTS-SPECIFIC - Always provide OEM part numbers when possible

When searching for service information, look for:
- Official service manuals and tech bulletins
- Wiring diagrams and schematics
- Common failure modes and fix success rates
- OEM part numbers with approximate pricing
- Test mode entry procedures
- Model-specific variations

Format your response as JSON with this exact structure:
{
  "title": "Brief problem title",
  "manufacturer": "Brand name",
  "errorCode": "Error code if applicable",
  "machineType": "washer|dryer|payment|both",
  "modelSeries": "Model series if known",
  "description": "Detailed problem description",
  "possibleCauses": ["Cause 1 (most common)", "Cause 2", ...],
  "troubleshootingSteps": ["Step 1 - Include success rate if known", ...],
  "safetyWarnings": ["Warning about hazards"],
  "requiredTools": ["Multimeter", "Socket set", ...],
  "partsWithPricing": [{"partNumber": "F808214P", "name": "Door Lock", "estimatedPrice": "$65", "supplier": "Alliance Parts"}],
  "quickFix": "The first thing to try that fixes 50%+ of cases",
  "estimatedRepairTime": 30,
  "skillLevel": "basic|intermediate|professional",
  "testModeEntry": "How to enter diagnostic mode",
  "proTips": ["Tips from experienced techs"],
  "commonMistakes": ["Don't do this..."],
  "whenToCallPro": ["Call a pro if..."],
  "sourceUrl": "URL if found",
  "confidence": 85
}`;

export async function searchKnowledgeBase(
  query: string,
  manufacturer?: string,
  errorCode?: string,
  machineType?: string
): Promise<KnowledgeSearchResult> {
  try {
    const conditions: any[] = [];
    
    if (manufacturer) {
      conditions.push(ilike(knowledgeChunks.manufacturer, `%${manufacturer}%`));
    }
    if (errorCode) {
      conditions.push(
        sql`${errorCode} = ANY(${knowledgeChunks.linkedErrorCodes})`
      );
    }
    if (query) {
      conditions.push(
        or(
          ilike(knowledgeChunks.title, `%${query}%`),
          ilike(knowledgeChunks.content, `%${query}%`)
        )
      );
    }

    if (conditions.length > 0) {
      const existingKnowledge = await db
        .select()
        .from(knowledgeChunks)
        .where(and(...conditions))
        .limit(5);

      if (existingKnowledge.length > 0) {
        const chunk = existingKnowledge[0];
        return {
          success: true,
          source: "database",
          knowledge: {
            title: chunk.title || "Service Information",
            manufacturer: chunk.manufacturer || manufacturer || "",
            errorCode: errorCode,
            machineType: chunk.machineType || undefined,
            modelSeries: chunk.modelSeries || undefined,
            description: chunk.summary || chunk.content,
            possibleCauses: [],
            troubleshootingSteps: [],
            safetyWarnings: [],
            requiredTools: [],
            partsWithPricing: [],
            skillLevel: "intermediate",
            proTips: [],
            commonMistakes: [],
            whenToCallPro: [],
            confidence: chunk.confidence || 80,
            ...(chunk.structuredData as any || {}),
          },
        };
      }
    }

    return {
      success: false,
      source: "database",
      knowledge: null,
      message: "No existing knowledge found",
    };
  } catch (error: any) {
    console.error("[KNOWLEDGE] Search error:", error);
    return {
      success: false,
      source: "database",
      knowledge: null,
      message: error.message,
    };
  }
}

export async function fetchAndLearnWithGrok(
  query: string,
  manufacturer?: string,
  errorCode?: string,
  machineType?: string
): Promise<KnowledgeSearchResult> {
  if (!grok) {
    return {
      success: false,
      source: "grok_search",
      knowledge: null,
      message: "Grok API not configured",
    };
  }

  try {
    const searchQuery = [
      manufacturer,
      errorCode,
      machineType,
      query,
      "service manual troubleshooting repair",
    ]
      .filter(Boolean)
      .join(" ");

    console.log(`[GROK-LEARN] Searching: "${searchQuery}"`);

    const response = await grok.chat.completions.create({
      model: "grok-2",
      messages: [
        { role: "system", content: MASTER_TECH_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Search for and provide comprehensive service/repair information for:

Manufacturer: ${manufacturer || "Any commercial laundry brand"}
Error Code: ${errorCode || "N/A"}
Machine Type: ${machineType || "washer/dryer"}
Query: ${query}

Search online service manuals, tech bulletins, and repair databases. Provide the most accurate, field-tested troubleshooting information with real OEM part numbers. Think like a master tech diagnosing this in the field.`,
        },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0].message.content || "";
    
    let extracted: ExtractedKnowledge;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extracted = JSON.parse(jsonMatch[0]);
      } else {
        extracted = {
          title: `${manufacturer || ""} ${errorCode || query}`.trim(),
          manufacturer: manufacturer || "Unknown",
          errorCode,
          machineType,
          description: content,
          possibleCauses: [],
          troubleshootingSteps: [],
          safetyWarnings: [],
          requiredTools: [],
          partsWithPricing: [],
          skillLevel: "intermediate",
          proTips: [],
          commonMistakes: [],
          whenToCallPro: [],
          confidence: 60,
        };
      }
    } catch (parseError) {
      extracted = {
        title: `${manufacturer || ""} ${errorCode || query}`.trim(),
        manufacturer: manufacturer || "Unknown",
        errorCode,
        machineType,
        description: content,
        possibleCauses: [],
        troubleshootingSteps: [],
        safetyWarnings: [],
        requiredTools: [],
        partsWithPricing: [],
        skillLevel: "intermediate",
        proTips: [],
        commonMistakes: [],
        whenToCallPro: [],
        confidence: 50,
      };
    }

    if (extracted.troubleshootingSteps?.length > 0 || extracted.description) {
      try {
        await db.insert(knowledgeChunks).values({
          chunkType: "troubleshooting",
          title: extracted.title,
          content: extracted.description,
          summary: extracted.quickFix || extracted.description.substring(0, 200),
          structuredData: {
            possibleCauses: extracted.possibleCauses,
            troubleshootingSteps: extracted.troubleshootingSteps,
            safetyWarnings: extracted.safetyWarnings,
            requiredTools: extracted.requiredTools,
            partsWithPricing: extracted.partsWithPricing,
            proTips: extracted.proTips,
            commonMistakes: extracted.commonMistakes,
            whenToCallPro: extracted.whenToCallPro,
            testModeEntry: extracted.testModeEntry,
            estimatedRepairTime: extracted.estimatedRepairTime,
            skillLevel: extracted.skillLevel,
          },
          linkedErrorCodes: errorCode ? [errorCode] : [],
          manufacturer: extracted.manufacturer,
          modelSeries: extracted.modelSeries,
          machineType: extracted.machineType,
          confidence: extracted.confidence,
        });
        console.log(`[GROK-LEARN] ✅ Stored new knowledge: ${extracted.title}`);
      } catch (storeError: any) {
        console.warn(`[GROK-LEARN] Failed to store knowledge:`, storeError.message);
      }
    }

    return {
      success: true,
      source: "grok_search",
      knowledge: extracted,
    };
  } catch (error: any) {
    console.error("[GROK-LEARN] Search error:", error);
    return {
      success: false,
      source: "grok_search",
      knowledge: null,
      message: error.message,
    };
  }
}

export async function smartDiagnose(
  query: string,
  manufacturer?: string,
  errorCode?: string,
  machineType?: string
): Promise<KnowledgeSearchResult> {
  const dbResult = await searchKnowledgeBase(query, manufacturer, errorCode, machineType);
  if (dbResult.success && dbResult.knowledge) {
    console.log(`[SMART-DIAGNOSE] Found in database: ${dbResult.knowledge.title}`);
    return dbResult;
  }

  if (errorCode) {
    const existingCode = await db
      .select()
      .from(diagnosticCodes)
      .where(
        and(
          ilike(diagnosticCodes.code, `%${errorCode}%`),
          manufacturer ? eq(diagnosticCodes.manufacturer, manufacturer) : undefined
        )
      )
      .limit(1);

    if (existingCode.length > 0) {
      const code = existingCode[0];
      return {
        success: true,
        source: "database",
        knowledge: {
          title: code.title,
          manufacturer: code.manufacturer,
          errorCode: code.code,
          machineType: code.machineType || undefined,
          modelSeries: code.modelSeries || undefined,
          description: code.description,
          possibleCauses: code.possibleCauses || [],
          troubleshootingSteps: code.troubleshootingSteps || [],
          safetyWarnings: [],
          requiredTools: [],
          partsWithPricing: (code.partsWithPricing as any[]) || [],
          quickFix: code.quickFix || undefined,
          estimatedRepairTime: code.estimatedRepairTime || undefined,
          skillLevel: (code.skillLevel as any) || "intermediate",
          testModeEntry: code.testModeEntry || undefined,
          proTips: code.repairTechniques || [],
          commonMistakes: [],
          whenToCallPro: [],
          confidence: code.fixSuccessRate || 75,
        },
      };
    }
  }

  console.log(`[SMART-DIAGNOSE] Not found locally, searching with Grok...`);
  return fetchAndLearnWithGrok(query, manufacturer, errorCode, machineType);
}

export async function ingestFromUrl(
  url: string,
  manufacturer: string,
  docType: string = "service_manual"
): Promise<{ success: boolean; message: string; manualId?: string }> {
  if (!grok) {
    return { success: false, message: "Grok API not configured" };
  }

  try {
    console.log(`[INGEST] Fetching and analyzing: ${url}`);

    const response = await grok.chat.completions.create({
      model: "grok-2",
      messages: [
        { role: "system", content: MASTER_TECH_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyze this service manual URL and extract all useful repair/troubleshooting information:

URL: ${url}
Manufacturer: ${manufacturer}
Document Type: ${docType}

Extract:
1. All error codes and their meanings
2. Troubleshooting procedures with step-by-step instructions
3. Wiring diagram information
4. Parts lists with part numbers
5. Safety warnings
6. Test mode procedures
7. Common failure modes

Format each piece of information as a separate JSON object in an array.`,
        },
      ],
      temperature: 0.2,
    });

    const content = response.choices[0].message.content || "";
    
    const [manual] = await db
      .insert(serviceManuals)
      .values({
        title: `${manufacturer} Service Manual`,
        manufacturer,
        docType,
        fileName: url.split("/").pop() || "manual.pdf",
        sourceUrl: url,
        status: "completed",
        extractedText: content,
      })
      .returning();

    console.log(`[INGEST] ✅ Created manual record: ${manual.id}`);

    return {
      success: true,
      message: `Successfully ingested manual from ${url}`,
      manualId: manual.id,
    };
  } catch (error: any) {
    console.error("[INGEST] Error:", error);
    return { success: false, message: error.message };
  }
}
