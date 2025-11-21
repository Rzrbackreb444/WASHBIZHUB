/**
 * AI ROUTER - Cost-Optimized Multi-Provider Intelligence
 * 
 * Routes AI requests to the most cost-effective provider based on:
 * - Free tier availability
 * - Task complexity
 * - Response time requirements
 * - Provider strengths
 * 
 * Providers & Free Tiers:
 * - Gemini 2.0 Flash: 1,500 requests/day FREE
 * - Perplexity: Limited free tier
 * - OpenAI: Pay-per-use (use sparingly)
 * - Anthropic: Pay-per-use (use for complex tasks)
 * - Grok (xAI): Check availability
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

// Initialize clients (lazy-loaded to save memory)
let geminiClient: GoogleGenerativeAI | null = null;
let anthropicClient: Anthropic | null = null;
let openaiClient: OpenAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient;
}

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY not configured");
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// Provider selection strategy
export type AITask = 
  | "keyword_research"
  | "content_generation"
  | "seo_analysis"
  | "competitor_analysis"
  | "schema_generation"
  | "blog_writing"
  | "technical_analysis"
  | "chat_response"
  | "data_extraction";

export type AIProvider = "gemini" | "anthropic" | "openai" | "perplexity" | "grok";

interface ProviderConfig {
  provider: AIProvider;
  model: string;
  costPerRequest: number; // Estimated cost in credits
  maxTokens: number;
  strengths: AITask[];
}

// Provider configurations (prioritize FREE tiers)
const PROVIDER_CONFIGS: ProviderConfig[] = [
  {
    provider: "gemini",
    model: "gemini-2.0-flash-exp",
    costPerRequest: 0, // FREE tier: 1,500 requests/day
    maxTokens: 8192,
    strengths: [
      "keyword_research",
      "content_generation",
      "blog_writing",
      "seo_analysis",
      "data_extraction",
      "chat_response"
    ],
  },
  {
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    costPerRequest: 3, // Pay-per-use (use for complex tasks)
    maxTokens: 8192,
    strengths: [
      "technical_analysis",
      "content_generation",
      "competitor_analysis",
    ],
  },
  {
    provider: "openai",
    model: "gpt-4o-mini",
    costPerRequest: 1, // Pay-per-use (use mini model)
    maxTokens: 16384,
    strengths: [
      "schema_generation",
      "data_extraction",
      "chat_response",
    ],
  },
];

/**
 * Select the best provider for a given task
 * Priority: FREE tier > Cost > Provider strengths
 */
export function selectProvider(task: AITask): ProviderConfig {
  // Always prefer FREE Gemini for supported tasks
  const geminiConfig = PROVIDER_CONFIGS.find(c => c.provider === "gemini");
  if (geminiConfig && geminiConfig.strengths.includes(task)) {
    return geminiConfig;
  }

  // Fallback to best alternative
  const suitable = PROVIDER_CONFIGS
    .filter(c => c.strengths.includes(task))
    .sort((a, b) => a.costPerRequest - b.costPerRequest);

  return suitable[0] || PROVIDER_CONFIGS[0]; // Default to Gemini
}

/**
 * Execute AI request with automatic provider selection and retry logic
 */
export async function executeAIRequest(
  task: AITask,
  prompt: string,
  options: {
    maxTokens?: number;
    temperature?: number;
    forceProvider?: AIProvider;
  } = {}
): Promise<string> {
  const config = options.forceProvider
    ? PROVIDER_CONFIGS.find(c => c.provider === options.forceProvider)!
    : selectProvider(task);

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[AI Router] ${task} → ${config.provider} (attempt ${attempt}/${maxRetries})`);
      
      switch (config.provider) {
        case "gemini":
          return await executeGeminiRequest(prompt, config, options);
        case "anthropic":
          return await executeAnthropicRequest(prompt, config, options);
        case "openai":
          return await executeOpenAIRequest(prompt, config, options);
        default:
          throw new Error(`Provider ${config.provider} not implemented`);
      }
    } catch (error: any) {
      lastError = error;
      console.error(`[AI Router] ${config.provider} failed (attempt ${attempt}):`, error.message);
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw new Error(`All AI providers failed. Last error: ${lastError?.message}`);
}

/**
 * Execute Gemini request (FREE tier - 1,500 requests/day)
 */
async function executeGeminiRequest(
  prompt: string,
  config: ProviderConfig,
  options: any
): Promise<string> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: config.model });
  const result = await model.generateContent(prompt);
  const response = result.response;
  
  return response.text() || "";
}

/**
 * Execute Anthropic request (pay-per-use)
 */
async function executeAnthropicRequest(
  prompt: string,
  config: ProviderConfig,
  options: any
): Promise<string> {
  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: config.model,
    max_tokens: options.maxTokens || config.maxTokens,
    temperature: options.temperature || 0.7,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const textBlock = response.content.find(block => block.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text : "";
}

/**
 * Execute OpenAI request (pay-per-use)
 */
async function executeOpenAIRequest(
  prompt: string,
  config: ProviderConfig,
  options: any
): Promise<string> {
  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: config.model,
    max_tokens: options.maxTokens || config.maxTokens,
    temperature: options.temperature || 0.7,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.choices[0]?.message?.content || "";
}

/**
 * Batch AI requests with intelligent routing
 * Automatically distributes load across providers
 */
export async function executeBatchAIRequests(
  requests: Array<{ task: AITask; prompt: string }>
): Promise<string[]> {
  // Group by task type for optimal batching
  const grouped = requests.reduce((acc, req) => {
    if (!acc[req.task]) acc[req.task] = [];
    acc[req.task].push(req.prompt);
    return acc;
  }, {} as Record<AITask, string[]>);

  const results: string[] = [];

  // Process each group with the best provider
  for (const [task, prompts] of Object.entries(grouped)) {
    const taskType = task as AITask;
    const provider = selectProvider(taskType);

    console.log(`[AI Batch] Processing ${prompts.length} ${taskType} requests with ${provider.provider}`);

    // Execute in parallel batches (max 5 concurrent to avoid rate limits)
    const batchSize = 5;
    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(prompt => executeAIRequest(taskType, prompt))
      );
      results.push(...batchResults);
    }
  }

  return results;
}

/**
 * Cost tracking for monitoring
 */
interface CostTracker {
  provider: AIProvider;
  requests: number;
  estimatedCost: number;
  date: string;
}

const costTracking: Map<string, CostTracker> = new Map();

export function trackAIUsage(provider: AIProvider, cost: number) {
  const today = new Date().toISOString().split('T')[0];
  const key = `${provider}-${today}`;
  
  const existing = costTracking.get(key) || {
    provider,
    requests: 0,
    estimatedCost: 0,
    date: today,
  };

  existing.requests++;
  existing.estimatedCost += cost;
  costTracking.set(key, existing);
}

export function getDailyCostReport(): CostTracker[] {
  const today = new Date().toISOString().split('T')[0];
  return Array.from(costTracking.values()).filter(t => t.date === today);
}

/**
 * Health check for all providers
 */
export async function checkProviderHealth(): Promise<Record<AIProvider, boolean>> {
  const health: Record<string, boolean> = {};

  // Test Gemini
  try {
    await executeGeminiRequest("Test", PROVIDER_CONFIGS[0], {});
    health.gemini = true;
  } catch {
    health.gemini = false;
  }

  // Test Anthropic
  try {
    await executeAnthropicRequest("Test", PROVIDER_CONFIGS[1], {});
    health.anthropic = true;
  } catch {
    health.anthropic = false;
  }

  // Test OpenAI
  try {
    await executeOpenAIRequest("Test", PROVIDER_CONFIGS[2], {});
    health.openai = true;
  } catch {
    health.openai = false;
  }

  return health as Record<AIProvider, boolean>;
}
