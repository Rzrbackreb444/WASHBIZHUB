import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type AIProvider = "openai" | "anthropic" | "gemini" | "perplexity" | "grok";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIResponse {
  content: string;
  provider: AIProvider;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

class AIProviderService {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private gemini: GoogleGenerativeAI | null = null;
  private perplexity: OpenAI | null = null;
  private grok: OpenAI | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }

    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    if (process.env.PERPLEXITY_API_KEY) {
      this.perplexity = new OpenAI({
        apiKey: process.env.PERPLEXITY_API_KEY,
        baseURL: "https://api.perplexity.ai",
      });
    }

    if (process.env.GROK_API_KEY) {
      this.grok = new OpenAI({
        apiKey: process.env.GROK_API_KEY,
        baseURL: "https://api.x.ai/v1",
      });
    }
  }

  async generateWithOpenAI(
    messages: AIMessage[],
    model: string = "gpt-4-turbo-preview"
  ): Promise<AIResponse> {
    if (!this.openai) {
      throw new Error("OpenAI API key not configured");
    }

    const response = await this.openai.chat.completions.create({
      model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    });

    return {
      content: response.choices[0].message.content || "",
      provider: "openai",
      model,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  }

  async generateWithAnthropic(
    messages: AIMessage[],
    model: string = "claude-3-5-sonnet-20241022"
  ): Promise<AIResponse> {
    if (!this.anthropic) {
      throw new Error("Anthropic API key not configured");
    }

    const systemMessage = messages.find(m => m.role === "system");
    const userMessages = messages.filter(m => m.role !== "system");

    const response = await this.anthropic.messages.create({
      model,
      max_tokens: 4096,
      system: systemMessage?.content || "",
      messages: userMessages.map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
    });

    const content = response.content[0].type === "text" 
      ? response.content[0].text 
      : "";

    return {
      content,
      provider: "anthropic",
      model,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }

  async generateWithGemini(
    messages: AIMessage[],
    model: string = "gemini-1.5-pro"
  ): Promise<AIResponse> {
    if (!this.gemini) {
      throw new Error("Gemini API key not configured");
    }

    const genModel = this.gemini.getGenerativeModel({ model });

    const systemMessage = messages.find(m => m.role === "system");
    const userMessages = messages.filter(m => m.role !== "system");

    // Build chat history - Gemini requires it to start with "user" role
    let chatHistory = userMessages.slice(0, -1).map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    // Ensure history starts with user message (Gemini requirement)
    // Remove only leading model messages, keep the rest of the history
    while (chatHistory.length > 0 && chatHistory[0].role === "model") {
      chatHistory = chatHistory.slice(1);
    }

    const chat = genModel.startChat({
      history: chatHistory,
      systemInstruction: systemMessage?.content,
    });

    const lastMessage = userMessages[userMessages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response;

    return {
      content: response.text(),
      provider: "gemini",
      model,
      usage: {
        promptTokens: response.usageMetadata?.promptTokenCount || 0,
        completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata?.totalTokenCount || 0,
      },
    };
  }

  async generateWithPerplexity(
    messages: AIMessage[],
    model: string = "llama-3.1-sonar-large-128k-online"
  ): Promise<AIResponse> {
    if (!this.perplexity) {
      throw new Error("Perplexity API key not configured");
    }

    const response = await this.perplexity.chat.completions.create({
      model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    });

    return {
      content: response.choices[0].message.content || "",
      provider: "perplexity",
      model,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  }

  async generateWithGrok(
    messages: AIMessage[],
    model: string = "grok-beta"
  ): Promise<AIResponse> {
    if (!this.grok) {
      throw new Error("Grok API key not configured");
    }

    const response = await this.grok.chat.completions.create({
      model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    });

    return {
      content: response.choices[0].message.content || "",
      provider: "grok",
      model,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  }

  async generate(
    provider: AIProvider,
    messages: AIMessage[],
    model?: string
  ): Promise<AIResponse> {
    switch (provider) {
      case "openai":
        return this.generateWithOpenAI(messages, model);
      case "anthropic":
        return this.generateWithAnthropic(messages, model);
      case "gemini":
        return this.generateWithGemini(messages, model);
      case "perplexity":
        return this.generateWithPerplexity(messages, model);
      case "grok":
        return this.generateWithGrok(messages, model);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  getAvailableProviders(): AIProvider[] {
    const providers: AIProvider[] = [];
    if (this.openai) providers.push("openai");
    if (this.anthropic) providers.push("anthropic");
    if (this.gemini) providers.push("gemini");
    if (this.perplexity) providers.push("perplexity");
    if (this.grok) providers.push("grok");
    return providers;
  }

  isProviderAvailable(provider: AIProvider): boolean {
    switch (provider) {
      case "openai":
        return this.openai !== null;
      case "anthropic":
        return this.anthropic !== null;
      case "gemini":
        return this.gemini !== null;
      case "perplexity":
        return this.perplexity !== null;
      case "grok":
        return this.grok !== null;
      default:
        return false;
    }
  }
}

export const aiProviderService = new AIProviderService();
