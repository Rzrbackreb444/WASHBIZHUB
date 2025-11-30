/**
 * AI COUNCIL - Multi-AI Orchestration System
 * 
 * Enables multiple AI models to collaborate on complex tasks.
 * Prioritizes FREE tiers to minimize costs.
 * 
 * Model Hierarchy (Cost Priority):
 * 1. Gemini 2.0 Flash - FREE (1,500 req/day) - PRIMARY WORKHORSE
 * 2. GPT-4o-mini - Very cheap (~$0.0005/1K tokens)
 * 3. Perplexity Sonar - Web search specialist
 * 4. Grok - Trending/social specialist
 * 5. Claude Sonnet - Complex reasoning (expensive, use sparingly)
 * 6. GPT-4o - Premium tasks only
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import crypto from "crypto";

// ============== CACHE LAYER ==============
interface CacheEntry {
  result: string;
  timestamp: number;
  provider: string;
  cost: number;
}

const responseCache = new Map<string, CacheEntry>();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

function getCacheKey(prompt: string, taskType: string): string {
  const hash = crypto.createHash("md5").update(prompt + taskType).digest("hex");
  return `ai_cache_${hash}`;
}

function getFromCache(key: string): CacheEntry | null {
  const entry = responseCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    console.log(`[AI Council] Cache HIT - saving API call`);
    return entry;
  }
  if (entry) {
    responseCache.delete(key);
  }
  return null;
}

function setCache(key: string, result: string, provider: string, cost: number): void {
  responseCache.set(key, {
    result,
    timestamp: Date.now(),
    provider,
    cost
  });
  
  // Limit cache size to 1000 entries
  if (responseCache.size > 1000) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey) responseCache.delete(oldestKey);
  }
}

// ============== AI CLIENTS (LAZY LOADED) ==============
let geminiClient: GoogleGenerativeAI | null = null;
let anthropicClient: Anthropic | null = null;
let openaiClient: OpenAI | null = null;
let perplexityClient: OpenAI | null = null;
let grokClient: OpenAI | null = null;

function getGemini(): GoogleGenerativeAI {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  if (!geminiClient) throw new Error("Gemini not configured");
  return geminiClient;
}

function getAnthropic(): Anthropic {
  if (!anthropicClient && process.env.ANTHROPIC_API_KEY) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  if (!anthropicClient) throw new Error("Anthropic not configured");
  return anthropicClient;
}

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    if (process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
      openaiClient = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });
    } else if (process.env.OPENAI_API_KEY) {
      openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }
  if (!openaiClient) throw new Error("OpenAI not configured");
  return openaiClient;
}

function getPerplexity(): OpenAI {
  if (!perplexityClient && process.env.PERPLEXITY_API_KEY) {
    perplexityClient = new OpenAI({
      apiKey: process.env.PERPLEXITY_API_KEY,
      baseURL: "https://api.perplexity.ai",
    });
  }
  if (!perplexityClient) throw new Error("Perplexity not configured");
  return perplexityClient;
}

function getGrok(): OpenAI {
  if (!grokClient && process.env.GROK_API_KEY) {
    grokClient = new OpenAI({
      apiKey: process.env.GROK_API_KEY,
      baseURL: "https://api.x.ai/v1",
    });
  }
  if (!grokClient) throw new Error("Grok not configured");
  return grokClient;
}

// ============== TYPES ==============
export type AIModel = 
  | "gemini-flash"      // FREE - Primary workhorse
  | "gemini-pro"        // FREE - Complex tasks
  | "gpt-4o-mini"       // Cheap fallback
  | "gpt-4o"            // Premium
  | "claude-haiku"      // Cheap Claude
  | "claude-sonnet"     // Premium Claude
  | "perplexity-sonar"  // Web search
  | "grok-2";           // Social/trending

export type TaskType =
  | "general"           // Any general task
  | "research"          // Web research, fact-finding
  | "analysis"          // Complex data analysis
  | "content"           // Content generation
  | "code"              // Code generation
  | "scoring"           // CLEANBI-style scoring
  | "chat"              // Conversational
  | "trending"          // Social/trending topics
  | "validation";       // Cross-check/verify

export interface CouncilRequest {
  prompt: string;
  taskType: TaskType;
  context?: string;
  models?: AIModel[];         // Specific models to use
  collaboration?: boolean;    // Use multiple AIs together
  useCache?: boolean;         // Default true
}

export interface CouncilResponse {
  result: string;
  model: AIModel;
  provider: string;
  fromCache: boolean;
  cost: number;
  collaborators?: Array<{ model: AIModel; contribution: string }>;
}

// ============== MODEL CONFIGS ==============
interface ModelConfig {
  model: AIModel;
  apiModel: string;
  provider: "gemini" | "openai" | "anthropic" | "perplexity" | "grok";
  costPer1kTokens: number;
  strengths: TaskType[];
  priority: number; // Lower = preferred
}

const MODEL_CONFIGS: ModelConfig[] = [
  {
    model: "gemini-flash",
    apiModel: "gemini-2.0-flash-exp",
    provider: "gemini",
    costPer1kTokens: 0, // FREE
    strengths: ["general", "content", "analysis", "scoring", "chat", "code"],
    priority: 1,
  },
  {
    model: "gemini-pro",
    apiModel: "gemini-1.5-pro",
    provider: "gemini",
    costPer1kTokens: 0.00125, // Very cheap
    strengths: ["analysis", "code", "content"],
    priority: 2,
  },
  {
    model: "gpt-4o-mini",
    apiModel: "gpt-4o-mini",
    provider: "openai",
    costPer1kTokens: 0.00015,
    strengths: ["general", "code", "chat", "scoring"],
    priority: 3,
  },
  {
    model: "perplexity-sonar",
    apiModel: "llama-3.1-sonar-large-128k-online",
    provider: "perplexity",
    costPer1kTokens: 0.001,
    strengths: ["research", "validation"],
    priority: 4,
  },
  {
    model: "grok-2",
    apiModel: "grok-2",
    provider: "grok",
    costPer1kTokens: 0.002,
    strengths: ["trending", "chat", "content"],
    priority: 5,
  },
  {
    model: "claude-haiku",
    apiModel: "claude-3-haiku-20240307",
    provider: "anthropic",
    costPer1kTokens: 0.00025,
    strengths: ["chat", "content", "validation"],
    priority: 6,
  },
  {
    model: "claude-sonnet",
    apiModel: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    costPer1kTokens: 0.003,
    strengths: ["analysis", "code", "content"],
    priority: 7,
  },
  {
    model: "gpt-4o",
    apiModel: "gpt-4o",
    provider: "openai",
    costPer1kTokens: 0.005,
    strengths: ["analysis", "code", "content", "scoring"],
    priority: 8,
  },
];

// ============== PROVIDER EXECUTORS ==============
async function executeGemini(prompt: string, model: string): Promise<string> {
  const client = getGemini();
  const genModel = client.getGenerativeModel({ model });
  const result = await genModel.generateContent(prompt);
  return result.response.text() || "";
}

async function executeOpenAI(prompt: string, model: string): Promise<string> {
  const client = getOpenAI();
  const response = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 4096,
  });
  return response.choices[0]?.message?.content || "";
}

async function executeAnthropic(prompt: string, model: string): Promise<string> {
  const client = getAnthropic();
  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });
  const textBlock = response.content.find(b => b.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text : "";
}

async function executePerplexity(prompt: string, model: string): Promise<string> {
  const client = getPerplexity();
  const response = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
  });
  return response.choices[0]?.message?.content || "";
}

async function executeGrok(prompt: string, model: string): Promise<string> {
  const client = getGrok();
  const response = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
  });
  return response.choices[0]?.message?.content || "";
}

// ============== CORE FUNCTIONS ==============
function selectBestModel(taskType: TaskType): ModelConfig {
  // Find models that are good at this task, sorted by priority (cost)
  const suitable = MODEL_CONFIGS
    .filter(m => m.strengths.includes(taskType))
    .sort((a, b) => a.priority - b.priority);
  
  return suitable[0] || MODEL_CONFIGS[0]; // Default to Gemini Flash
}

async function executeModel(config: ModelConfig, prompt: string): Promise<string> {
  switch (config.provider) {
    case "gemini":
      return executeGemini(prompt, config.apiModel);
    case "openai":
      return executeOpenAI(prompt, config.apiModel);
    case "anthropic":
      return executeAnthropic(prompt, config.apiModel);
    case "perplexity":
      return executePerplexity(prompt, config.apiModel);
    case "grok":
      return executeGrok(prompt, config.apiModel);
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

/**
 * Main entry point - Route to optimal AI(s)
 */
export async function askCouncil(request: CouncilRequest): Promise<CouncilResponse> {
  const { prompt, taskType, context, collaboration = false, useCache = true } = request;
  
  const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
  const cacheKey = getCacheKey(fullPrompt, taskType);
  
  // Check cache first
  if (useCache) {
    const cached = getFromCache(cacheKey);
    if (cached) {
      return {
        result: cached.result,
        model: "gemini-flash" as AIModel, // Cache doesn't track model
        provider: cached.provider,
        fromCache: true,
        cost: 0,
      };
    }
  }
  
  // Select best model for task
  const config = selectBestModel(taskType);
  
  console.log(`[AI Council] Task: ${taskType} → Model: ${config.model} (priority ${config.priority})`);
  
  try {
    // Execute with retry logic and smart fallback
    let result = "";
    let usedConfig = config;
    let attempts = 0;
    const maxAttempts = 2;
    
    // Try primary model first
    while (attempts < maxAttempts) {
      try {
        result = await executeModel(usedConfig, fullPrompt);
        break;
      } catch (error: any) {
        attempts++;
        console.error(`[AI Council] ${usedConfig.model} attempt ${attempts} failed:`, error.message);
        
        if (attempts >= maxAttempts) {
          // Smart fallback chain: Gemini → GPT-4o-mini → Claude Haiku
          const fallbackChain = ["gpt-4o-mini", "claude-haiku", "gpt-4o"];
          let fallbackSuccess = false;
          
          for (const fallbackModel of fallbackChain) {
            if (fallbackModel === usedConfig.model) continue;
            
            const fallbackConfig = MODEL_CONFIGS.find(m => m.model === fallbackModel);
            if (!fallbackConfig) continue;
            
            try {
              console.log(`[AI Council] Falling back to ${fallbackModel}`);
              result = await executeModel(fallbackConfig, fullPrompt);
              usedConfig = fallbackConfig;
              fallbackSuccess = true;
              break;
            } catch (fallbackError: any) {
              console.error(`[AI Council] Fallback ${fallbackModel} failed:`, fallbackError.message);
            }
          }
          
          if (!fallbackSuccess) {
            throw error;
          }
        } else {
          await new Promise(r => setTimeout(r, 1000 * attempts));
        }
      }
    }
    
    // Estimate cost (rough estimate based on prompt + response length)
    const estimatedTokens = (fullPrompt.length + result.length) / 4;
    const cost = (estimatedTokens / 1000) * usedConfig.costPer1kTokens;
    
    // Cache the result
    if (useCache) {
      setCache(cacheKey, result, usedConfig.provider, cost);
    }
    
    return {
      result,
      model: usedConfig.model,
      provider: usedConfig.provider,
      fromCache: false,
      cost,
    };
    
  } catch (error: any) {
    console.error(`[AI Council] All attempts failed:`, error.message);
    throw error;
  }
}

/**
 * Multi-AI Collaboration - Get insights from multiple models
 */
export async function consultCouncil(
  prompt: string,
  taskType: TaskType,
  options: {
    models?: AIModel[];
    synthesize?: boolean;
  } = {}
): Promise<{
  responses: Array<{ model: AIModel; result: string; cost: number }>;
  synthesis?: string;
}> {
  // Default to top 3 cost-effective models for the task
  const modelsToUse = options.models || 
    MODEL_CONFIGS
      .filter(m => m.strengths.includes(taskType))
      .slice(0, 3)
      .map(m => m.model);
  
  console.log(`[AI Council] Consulting ${modelsToUse.length} models for: ${taskType}`);
  
  // Execute all models in parallel
  const responses = await Promise.all(
    modelsToUse.map(async (modelName) => {
      const config = MODEL_CONFIGS.find(m => m.model === modelName);
      if (!config) return null;
      
      try {
        const result = await executeModel(config, prompt);
        const estimatedTokens = (prompt.length + result.length) / 4;
        const cost = (estimatedTokens / 1000) * config.costPer1kTokens;
        
        return { model: modelName, result, cost };
      } catch (error: any) {
        console.error(`[AI Council] ${modelName} failed:`, error.message);
        return null;
      }
    })
  );
  
  const validResponses = responses.filter(r => r !== null) as Array<{
    model: AIModel;
    result: string;
    cost: number;
  }>;
  
  // Optionally synthesize responses into a final answer
  let synthesis: string | undefined;
  if (options.synthesize && validResponses.length > 1) {
    const synthesisPrompt = `You are synthesizing insights from multiple AI models. Combine the best ideas into a coherent, comprehensive response.

${validResponses.map((r, i) => `=== Model ${i + 1} (${r.model}) ===\n${r.result}`).join("\n\n")}

Synthesize the above into a single, optimal response:`;

    // Use Gemini (free) to synthesize
    const synthResult = await askCouncil({
      prompt: synthesisPrompt,
      taskType: "general",
      useCache: false,
    });
    synthesis = synthResult.result;
  }
  
  return { responses: validResponses, synthesis };
}

/**
 * Task Chain - Execute sequential AI tasks
 */
export async function chainTasks(
  tasks: Array<{
    prompt: string | ((prevResult: string) => string);
    taskType: TaskType;
    model?: AIModel;
  }>
): Promise<string[]> {
  const results: string[] = [];
  
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const promptText = typeof task.prompt === "function" 
      ? task.prompt(results[i - 1] || "")
      : task.prompt;
    
    console.log(`[AI Council] Chain step ${i + 1}/${tasks.length}: ${task.taskType}`);
    
    const response = await askCouncil({
      prompt: promptText,
      taskType: task.taskType,
      models: task.model ? [task.model] : undefined,
    });
    
    results.push(response.result);
  }
  
  return results;
}

/**
 * Get available models and their status
 */
export async function getCouncilStatus(): Promise<{
  available: AIModel[];
  costs: Record<AIModel, number>;
  cacheSize: number;
}> {
  const available: AIModel[] = [];
  const costs: Record<string, number> = {};
  
  for (const config of MODEL_CONFIGS) {
    costs[config.model] = config.costPer1kTokens;
    
    try {
      switch (config.provider) {
        case "gemini":
          if (process.env.GEMINI_API_KEY) available.push(config.model);
          break;
        case "openai":
          if (process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY) 
            available.push(config.model);
          break;
        case "anthropic":
          if (process.env.ANTHROPIC_API_KEY) available.push(config.model);
          break;
        case "perplexity":
          if (process.env.PERPLEXITY_API_KEY) available.push(config.model);
          break;
        case "grok":
          if (process.env.GROK_API_KEY) available.push(config.model);
          break;
      }
    } catch {
      // Provider not available
    }
  }
  
  return {
    available,
    costs: costs as Record<AIModel, number>,
    cacheSize: responseCache.size,
  };
}

// ============== SPECIALIZED COUNCIL QUERIES ==============

/**
 * Research Query - Uses Perplexity for web search
 */
export async function researchQuery(question: string): Promise<string> {
  return (await askCouncil({
    prompt: question,
    taskType: "research",
    models: ["perplexity-sonar"],
  })).result;
}

/**
 * Trending Query - Uses Grok for social insights
 */
export async function trendingQuery(topic: string): Promise<string> {
  return (await askCouncil({
    prompt: `What's trending or notable about: ${topic}`,
    taskType: "trending",
    models: ["grok-2"],
  })).result;
}

/**
 * Analysis Query - Uses Claude for deep reasoning
 */
export async function analysisQuery(data: string, question: string): Promise<string> {
  return (await askCouncil({
    prompt: `${question}\n\nData:\n${data}`,
    taskType: "analysis",
  })).result;
}

/**
 * Validation Query - Cross-check with multiple models
 */
export async function validateClaim(claim: string): Promise<{
  consensus: boolean;
  confidence: number;
  details: string;
}> {
  const { responses, synthesis } = await consultCouncil(
    `Evaluate the accuracy of this claim and provide a confidence score (0-100):\n\n"${claim}"\n\nRespond with JSON: { "accurate": boolean, "confidence": number, "reasoning": string }`,
    "validation",
    { models: ["gemini-flash", "perplexity-sonar", "gpt-4o-mini"], synthesize: true }
  );
  
  // Parse responses and determine consensus
  let trueCount = 0;
  let confidenceSum = 0;
  
  for (const r of responses) {
    try {
      const match = r.result.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.accurate) trueCount++;
        confidenceSum += parsed.confidence || 50;
      }
    } catch {
      // Skip unparseable responses
    }
  }
  
  const consensus = trueCount > responses.length / 2;
  const confidence = responses.length > 0 ? confidenceSum / responses.length : 50;
  
  return {
    consensus,
    confidence: Math.round(confidence),
    details: synthesis || "Unable to synthesize responses",
  };
}

console.log("✅ AI Council initialized - Multi-AI orchestration ready");
