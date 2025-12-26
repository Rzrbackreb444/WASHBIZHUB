/**
 * Unified AI Router - Smart Assistant Routing Service
 * 
 * Routes AI requests to the most appropriate provider based on query type:
 * - Equipment/Diagnostics → Gemini (excellent technical analysis)
 * - Business Analysis/CLEANBI → OpenAI GPT-4o (strong reasoning)
 * - Complex Reasoning/Business Plans → Anthropic Claude (best for nuanced analysis)
 * 
 * Features:
 * - Automatic query type detection
 * - Provider fallback chain
 * - Streaming support
 * - Cost optimization
 */

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type QueryType = 
  | "equipment_diagnostic"    // Error codes, maintenance, repairs
  | "business_analysis"       // CLEANBI, financial analysis, market research
  | "business_plan"           // Complex business planning, strategy
  | "laundromat_expert"       // General laundromat industry questions
  | "service_guy"             // Technical service and repair guidance
  | "general_chat";           // Default conversational

export type AIProvider = "openai" | "anthropic" | "gemini";

export interface AIRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIRouterResponse {
  content: string;
  provider: AIProvider;
  model: string;
  queryType: QueryType;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIRouterOptions {
  forceProvider?: AIProvider;
  forceQueryType?: QueryType;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

const QUERY_TYPE_ROUTING: Record<QueryType, { primary: AIProvider; fallback: AIProvider[] }> = {
  equipment_diagnostic: { 
    primary: "gemini",      // Gemini excels at technical analysis
    fallback: ["openai", "anthropic"] 
  },
  business_analysis: { 
    primary: "openai",      // GPT-4o for business/financial analysis
    fallback: ["anthropic", "gemini"] 
  },
  business_plan: { 
    primary: "anthropic",   // Claude for complex, nuanced reasoning
    fallback: ["openai", "gemini"] 
  },
  laundromat_expert: { 
    primary: "openai",      // GPT-4o for expert industry knowledge
    fallback: ["anthropic", "gemini"] 
  },
  service_guy: { 
    primary: "gemini",      // Gemini for technical diagnostics
    fallback: ["openai", "anthropic"] 
  },
  general_chat: { 
    primary: "gemini",      // Gemini is free tier friendly
    fallback: ["openai", "anthropic"] 
  },
};

const PROVIDER_MODELS: Record<AIProvider, string> = {
  openai: "gpt-4o",
  anthropic: "claude-3-5-sonnet-20241022",
  gemini: "gemini-2.0-flash-exp",
};

class UnifiedAIRouter {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private gemini: GoogleGenerativeAI | null = null;

  constructor() {
    // Initialize OpenAI (prefer Replit AI Integrations, fallback to user key)
    const openaiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (openaiKey) {
      this.openai = new OpenAI({
        apiKey: openaiKey,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || undefined,
      });
      console.log('✅ AI Router: OpenAI configured');
    }

    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      console.log('✅ AI Router: Anthropic configured');
    }

    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.log('✅ AI Router: Gemini configured');
    }
  }

  /**
   * Detect query type from user message
   */
  detectQueryType(message: string): QueryType {
    const lowerMessage = message.toLowerCase();

    // Equipment/Diagnostic patterns
    const diagnosticPatterns = [
      /error\s*code/i,
      /fault\s*code/i,
      /\b[A-Z]{1,2}\d{1,3}\b/, // Error codes like E01, F12, AL3
      /\bF\d{1,2}[A-Z]?\d?\b/i, // Dexter F-codes
      /not\s*(working|spinning|draining|heating)/i,
      /broken|malfunction|repair|fix|troubleshoot/i,
      /drain|pump|motor|belt|bearing|valve|sensor/i,
      /dexter|speed\s*queen|huebsch|maytag|wascomat/i,
      /washer|dryer|extractor|tumbler/i,
    ];

    // Business analysis patterns
    const businessAnalysisPatterns = [
      /cleanbi/i,
      /business\s*analysis/i,
      /financial\s*(analysis|projection|statement)/i,
      /market\s*(analysis|research|study)/i,
      /roi|return\s*on\s*investment/i,
      /valuation|apprais/i,
      /revenue|profit|expense|cash\s*flow/i,
      /benchmark|comparison|competitor/i,
      /demographic|population|income\s*level/i,
    ];

    // Business plan patterns
    const businessPlanPatterns = [
      /business\s*plan/i,
      /strategic\s*plan/i,
      /expansion\s*plan/i,
      /marketing\s*strategy/i,
      /growth\s*strategy/i,
      /acquisition\s*strategy/i,
      /exit\s*strategy/i,
      /5\s*year\s*plan|five\s*year\s*plan/i,
      /pro\s*forma/i,
      /funding|investment\s*proposal/i,
    ];

    // Service Guy specific patterns (technical service guidance)
    const serviceGuyPatterns = [
      /service\s*guy/i,
      /service\s*technician/i,
      /maintenance\s*schedule/i,
      /preventive\s*maintenance/i,
      /part\s*number|parts?\s*needed/i,
      /install|installation/i,
      /calibrat/i,
      /diagnostic\s*mode/i,
    ];

    // Check patterns in priority order
    if (serviceGuyPatterns.some(p => p.test(lowerMessage))) {
      return "service_guy";
    }

    if (diagnosticPatterns.some(p => p.test(message))) { // Use original case for error codes
      return "equipment_diagnostic";
    }

    if (businessPlanPatterns.some(p => p.test(lowerMessage))) {
      return "business_plan";
    }

    if (businessAnalysisPatterns.some(p => p.test(lowerMessage))) {
      return "business_analysis";
    }

    // Default to general chat
    return "general_chat";
  }

  /**
   * Check if a provider is available
   */
  isProviderAvailable(provider: AIProvider): boolean {
    switch (provider) {
      case "openai": return this.openai !== null;
      case "anthropic": return this.anthropic !== null;
      case "gemini": return this.gemini !== null;
    }
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): AIProvider[] {
    const providers: AIProvider[] = [];
    if (this.openai) providers.push("openai");
    if (this.anthropic) providers.push("anthropic");
    if (this.gemini) providers.push("gemini");
    return providers;
  }

  /**
   * Generate response with OpenAI
   */
  private async generateWithOpenAI(
    messages: AIRouterMessage[],
    options: AIRouterOptions
  ): Promise<AIRouterResponse> {
    if (!this.openai) {
      throw new Error("OpenAI not configured");
    }

    const model = PROVIDER_MODELS.openai;
    const response = await this.openai.chat.completions.create({
      model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature || 0.7,
    });

    return {
      content: response.choices[0]?.message?.content || "",
      provider: "openai",
      model,
      queryType: options.forceQueryType || "general_chat",
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  }

  /**
   * Generate response with Anthropic
   */
  private async generateWithAnthropic(
    messages: AIRouterMessage[],
    options: AIRouterOptions
  ): Promise<AIRouterResponse> {
    if (!this.anthropic) {
      throw new Error("Anthropic not configured");
    }

    const model = PROVIDER_MODELS.anthropic;
    const systemMessage = messages.find(m => m.role === "system");
    const chatMessages = messages.filter(m => m.role !== "system");

    const response = await this.anthropic.messages.create({
      model,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature || 0.7,
      system: systemMessage?.content || "",
      messages: chatMessages.map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
    });

    const content = response.content[0]?.type === "text" 
      ? response.content[0].text 
      : "";

    return {
      content,
      provider: "anthropic",
      model,
      queryType: options.forceQueryType || "general_chat",
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }

  /**
   * Generate response with Gemini
   */
  private async generateWithGemini(
    messages: AIRouterMessage[],
    options: AIRouterOptions
  ): Promise<AIRouterResponse> {
    if (!this.gemini) {
      throw new Error("Gemini not configured");
    }

    const model = PROVIDER_MODELS.gemini;
    const genModel = this.gemini.getGenerativeModel({ model });

    const systemMessage = messages.find(m => m.role === "system");
    const chatMessages = messages.filter(m => m.role !== "system");

    // Build Gemini chat history (must start with user)
    let history = chatMessages.slice(0, -1).map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    // Remove leading model messages (Gemini requirement)
    while (history.length > 0 && history[0].role === "model") {
      history = history.slice(1);
    }

    const chat = genModel.startChat({
      history,
      systemInstruction: systemMessage?.content,
    });

    const lastMessage = chatMessages[chatMessages.length - 1];
    const result = await chat.sendMessage(lastMessage?.content || "");
    const response = result.response;

    return {
      content: response.text(),
      provider: "gemini",
      model,
      queryType: options.forceQueryType || "general_chat",
      usage: {
        promptTokens: response.usageMetadata?.promptTokenCount || 0,
        completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata?.totalTokenCount || 0,
      },
    };
  }

  /**
   * Route and generate AI response
   */
  async chat(
    messages: AIRouterMessage[],
    options: AIRouterOptions = {}
  ): Promise<AIRouterResponse> {
    // Detect query type from the last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === "user");
    const queryType = options.forceQueryType || 
      (lastUserMessage ? this.detectQueryType(lastUserMessage.content) : "general_chat");

    // Get routing configuration
    const routing = QUERY_TYPE_ROUTING[queryType];
    const providersToTry = options.forceProvider 
      ? [options.forceProvider]
      : [routing.primary, ...routing.fallback];

    const errors: Array<{ provider: AIProvider; error: string }> = [];

    for (const provider of providersToTry) {
      if (!this.isProviderAvailable(provider)) {
        continue;
      }

      try {
        console.log(`🤖 AI Router: ${queryType} → ${provider}`);
        
        const optionsWithType = { ...options, forceQueryType: queryType };

        switch (provider) {
          case "openai":
            return await this.generateWithOpenAI(messages, optionsWithType);
          case "anthropic":
            return await this.generateWithAnthropic(messages, optionsWithType);
          case "gemini":
            return await this.generateWithGemini(messages, optionsWithType);
        }
      } catch (error: any) {
        console.warn(`⚠️ AI Router: ${provider} failed:`, error.message);
        errors.push({ provider, error: error.message });
      }
    }

    // All providers failed
    console.error("❌ AI Router: All providers failed", errors);
    throw new Error("AI service temporarily unavailable. Please try again.");
  }

  /**
   * Specialized method for equipment diagnostics
   */
  async diagnoseEquipment(
    errorCode: string,
    manufacturer?: string,
    machineType?: string,
    symptoms?: string
  ): Promise<AIRouterResponse> {
    const systemPrompt = `You are Service Guy AI, an expert commercial laundry equipment technician with 30+ years of experience.

Your expertise covers:
- Dexter, Speed Queen, Huebsch, Maytag, Wascomat, Continental Girbau, UniMac, Milnor
- Washers, dryers, washer-extractors, ironers, folders
- Error code diagnostics, repair procedures, parts identification
- Preventive maintenance, calibration, installation

Provide:
1. Error code meaning and severity
2. Likely causes (ranked by probability)
3. Step-by-step diagnostic procedure
4. Required parts with part numbers when possible
5. Safety warnings if applicable
6. Estimated repair time and difficulty level`;

    const userMessage = [
      errorCode ? `Error Code: ${errorCode}` : "",
      manufacturer ? `Manufacturer: ${manufacturer}` : "",
      machineType ? `Machine Type: ${machineType}` : "",
      symptoms ? `Symptoms: ${symptoms}` : "",
    ].filter(Boolean).join("\n");

    return this.chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ], { forceQueryType: "equipment_diagnostic" });
  }

  /**
   * Specialized method for CLEANBI business analysis
   */
  async analyzeBusiness(
    cleanbiScores: {
      customer?: number;
      location?: number;
      equipment?: number;
      adaptability?: number;
      numbers?: number;
      intelligence?: number;
      brand?: number;
    },
    additionalContext?: string
  ): Promise<AIRouterResponse> {
    const systemPrompt = `You are a CLEANBI™ business analyst, expert in laundromat business intelligence and optimization.

CLEANBI Framework:
C - Customer Experience (0-100)
L - Location Quality (0-100)
E - Equipment Grade (0-100)
A - Adaptability (0-100)
N - Numbers/Financials (0-100)
B - Business Intelligence (0-100)
I - Brand Identity (0-100)

Provide actionable insights:
1. Score interpretation and industry benchmarks
2. Top 3 strengths to leverage
3. Top 3 areas needing improvement
4. Specific recommendations with expected ROI
5. Growth strategy roadmap`;

    const scores = Object.entries(cleanbiScores)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}/100`)
      .join("\n");

    const userMessage = `CLEANBI Scores:\n${scores}${additionalContext ? `\n\nContext: ${additionalContext}` : ""}`;

    return this.chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ], { forceQueryType: "business_analysis" });
  }

  /**
   * Specialized method for laundromat expert consultation
   */
  async consultLaundromatExpert(
    question: string,
    context?: string
  ): Promise<AIRouterResponse> {
    const systemPrompt = `You are the Laundromat Expert AI, a comprehensive consultant for the coin laundry industry with expertise in:

- Business operations and best practices
- Site selection and market analysis
- Equipment selection and maintenance
- Financial modeling and ROI calculations
- Marketing and customer acquisition
- Industry trends and regulations
- Buying, selling, and valuing laundromats

Provide expert-level advice that is:
1. Actionable and specific
2. Based on industry best practices
3. Supported by data when applicable
4. Tailored to the user's situation`;

    const userMessage = context ? `${question}\n\nContext: ${context}` : question;

    return this.chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ], { forceQueryType: "laundromat_expert" });
  }

  /**
   * Generate a business plan section
   */
  async generateBusinessPlan(
    section: string,
    businessDetails: {
      name?: string;
      location?: string;
      size?: string;
      investment?: number;
      targetMarket?: string;
    }
  ): Promise<AIRouterResponse> {
    const systemPrompt = `You are a professional business plan writer specializing in laundromat and commercial laundry businesses.

Create detailed, investor-ready business plan sections that include:
1. Clear objectives and strategies
2. Market data and analysis
3. Financial projections with realistic assumptions
4. Risk assessment and mitigation
5. Competitive positioning

Format with professional headings, bullet points, and tables where appropriate.`;

    const details = Object.entries(businessDetails)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    return this.chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Generate the "${section}" section for this laundromat business:\n\n${details}` },
    ], { forceQueryType: "business_plan" });
  }
}

// Export singleton instance
export const unifiedAIRouter = new UnifiedAIRouter();

// Export types and class for extensibility
export { UnifiedAIRouter };
