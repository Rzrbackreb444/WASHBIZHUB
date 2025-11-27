/**
 * Gemini Content Studio Service
 * AI-powered content generation using Google's Gemini API (FREE tier)
 * 
 * Uses the user's GEMINI_API_KEY for truly free usage (1,500 requests/day)
 * ALL API calls are server-side only - NEVER expose keys to client
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize Gemini with server-side API key only
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Model configurations
const MODELS = {
  flash: "gemini-2.0-flash-exp", // Fast, high-volume (1,500/day free)
  pro: "gemini-1.5-pro", // Complex reasoning
  flashThinking: "gemini-2.0-flash-thinking-exp", // Advanced reasoning
};

// Safety settings for content generation
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// System prompts for different content types
const SYSTEM_PROMPTS = {
  general: `You are an advanced AI content assistant for WashBizHub, the #1 laundromat industry platform. 
You help create professional content, analyze data, and provide expert advice.
You can discuss topics, generate content, and help with business decisions.
Always be helpful, professional, and thorough in your responses.`,

  blog: `You are an expert SEO blog writer specializing in the laundromat and coin laundry industry.
You create high-ranking, engaging content that drives organic traffic.
Focus on:
- Keyword-rich titles and headers
- Compelling meta descriptions
- Internal linking opportunities to CLEANBI tool
- Long-form, comprehensive content (2000+ words)
- Actionable insights and real-world examples
- Proper heading hierarchy (H1, H2, H3)`,

  book: `You are a professional book author and ghostwriter specializing in business and industry guides.
You write in a clear, engaging style suitable for Kindle Direct Publishing (KDP).
Focus on:
- Proper chapter structure and pacing
- Professional tone with personality
- Actionable advice and case studies
- KDP formatting requirements (proper margins, page breaks)
- Compelling chapter openings and transitions
- 3000-5000 words per chapter for proper book length`,

  newsletter: `You are an email marketing expert creating engaging newsletter content.
You write compelling subject lines and email copy that drives opens and clicks.
Focus on:
- Attention-grabbing subject lines (under 50 chars)
- Engaging preheader text
- Clear value proposition
- Strong call-to-action
- Mobile-friendly formatting
- Personalization opportunities`,

  code: `You are an expert full-stack developer. You can:
- Analyze and explain code
- Suggest improvements and optimizations
- Generate new code based on requirements
- Debug and fix issues
- Create documentation

When generating code:
- Use TypeScript for type safety
- Follow React best practices
- Use existing project patterns and libraries
- Include proper error handling
- Add helpful comments only when necessary`,

  seo: `You are an SEO and Answer Engine Optimization (AEO) expert.
You help discover high-ranking topics and optimize content for search engines and AI answer engines.
Focus on:
- Keyword research and analysis
- Trending topic discovery
- Competition analysis
- Content gap identification
- Featured snippet optimization
- Voice search optimization`,
};

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

export interface GenerationResult {
  content: string;
  tokensUsed?: number;
  model: string;
  processingTimeMs: number;
}

export interface BlogTopicSuggestion {
  title: string;
  keyword: string;
  searchVolume: string;
  difficulty: string;
  outline: string[];
  wordCountTarget: number;
}

/**
 * Generate a chat response with conversation history
 */
export async function generateChatResponse(
  messages: ChatMessage[],
  type: keyof typeof SYSTEM_PROMPTS = "general",
  customSystemPrompt?: string
): Promise<GenerationResult> {
  const startTime = Date.now();
  
  const model = genAI.getGenerativeModel({
    model: MODELS.flash,
    safetySettings,
    systemInstruction: customSystemPrompt || SYSTEM_PROMPTS[type],
  });

  // Convert messages to Gemini format
  const history = messages.slice(0, -1).map(msg => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({
    history: history.filter(m => m.role !== "system") as any,
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.7,
    },
  });

  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessage(lastMessage.content);
  const response = await result.response;

  return {
    content: response.text(),
    tokensUsed: response.usageMetadata?.totalTokenCount,
    model: MODELS.flash,
    processingTimeMs: Date.now() - startTime,
  };
}

/**
 * Generate blog topic suggestions based on industry trends
 */
export async function generateBlogTopics(
  niche: string = "laundromat",
  count: number = 5
): Promise<BlogTopicSuggestion[]> {
  const model = genAI.getGenerativeModel({
    model: MODELS.flash,
    systemInstruction: SYSTEM_PROMPTS.seo,
  });

  const prompt = `Generate ${count} high-ranking blog topic suggestions for the ${niche} industry.

For each topic, provide:
1. A compelling, SEO-optimized title
2. Primary keyword to target
3. Estimated search volume (low/medium/high)
4. Competition difficulty (easy/medium/hard)
5. Detailed outline with 5-7 sections
6. Recommended word count

Format as JSON array with fields: title, keyword, searchVolume, difficulty, outline (array), wordCountTarget (number)

Focus on topics that:
- Have good search volume but manageable competition
- Address common pain points or questions
- Provide unique angles not covered by competitors
- Can naturally include calls-to-action for tools like CLEANBI`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  
  try {
    const text = response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse blog topics:", e);
  }
  
  return [];
}

/**
 * Generate a full blog post
 */
export async function generateBlogPost(
  title: string,
  keyword: string,
  outline: string[],
  targetWordCount: number = 2000
): Promise<GenerationResult> {
  const startTime = Date.now();
  
  const model = genAI.getGenerativeModel({
    model: MODELS.flash,
    systemInstruction: SYSTEM_PROMPTS.blog,
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.7,
    },
  });

  const prompt = `Write a comprehensive, SEO-optimized blog post.

Title: ${title}
Primary Keyword: ${keyword}
Target Word Count: ${targetWordCount}+ words

Outline:
${outline.map((section, i) => `${i + 1}. ${section}`).join("\n")}

Requirements:
- Use the primary keyword naturally 5-10 times
- Include compelling introduction with hook
- Use H2 and H3 headers for structure
- Add bullet points and numbered lists where appropriate
- Include relevant statistics and data points
- Add internal linking suggestions [LINK: anchor text -> /page-path]
- End with strong conclusion and call-to-action for CLEANBI tool
- Write in an engaging, authoritative voice

Format the output as clean HTML with proper heading tags.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return {
    content: response.text(),
    tokensUsed: response.usageMetadata?.totalTokenCount,
    model: MODELS.flash,
    processingTimeMs: Date.now() - startTime,
  };
}

/**
 * Generate a book chapter with proper KDP formatting
 */
export async function generateBookChapter(
  bookTitle: string,
  chapterTitle: string,
  chapterNumber: number,
  outline: string,
  targetWordCount: number = 4000,
  previousChapterSummary?: string
): Promise<GenerationResult> {
  const startTime = Date.now();
  
  const model = genAI.getGenerativeModel({
    model: MODELS.flash,
    systemInstruction: SYSTEM_PROMPTS.book,
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.7,
    },
  });

  const prompt = `Write Chapter ${chapterNumber} for the book "${bookTitle}".

Chapter Title: ${chapterTitle}
Target Word Count: ${targetWordCount}+ words

Chapter Outline:
${outline}

${previousChapterSummary ? `Previous Chapter Summary (for continuity):\n${previousChapterSummary}\n` : ""}

Requirements:
- Write in a professional yet engaging style
- Start with a compelling opening that hooks the reader
- Include practical examples and case studies
- Add actionable takeaways and tips
- Ensure smooth transitions between sections
- End with a summary and bridge to the next chapter
- Format for KDP (proper paragraphs, no excessive formatting)

Write the complete chapter content now.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return {
    content: response.text(),
    tokensUsed: response.usageMetadata?.totalTokenCount,
    model: MODELS.flash,
    processingTimeMs: Date.now() - startTime,
  };
}

/**
 * Generate newsletter content
 */
export async function generateNewsletter(
  topic: string,
  style: "promotional" | "educational" | "news" | "digest" = "educational",
  previousNewsletters?: string[]
): Promise<{ subject: string; preheader: string; htmlContent: string; textContent: string }> {
  const model = genAI.getGenerativeModel({
    model: MODELS.flash,
    systemInstruction: SYSTEM_PROMPTS.newsletter,
  });

  const prompt = `Create a compelling email newsletter about: ${topic}

Style: ${style}
${previousNewsletters?.length ? `Previous newsletter topics (avoid repetition): ${previousNewsletters.join(", ")}` : ""}

Generate:
1. Subject line (under 50 characters, compelling)
2. Preheader text (preview text, under 100 characters)
3. HTML email content (mobile-friendly, with clear sections)
4. Plain text version

Format response as JSON with fields: subject, preheader, htmlContent, textContent`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  
  try {
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse newsletter:", e);
  }
  
  return {
    subject: "Newsletter",
    preheader: "",
    htmlContent: response.text(),
    textContent: response.text().replace(/<[^>]*>/g, ""),
  };
}

/**
 * Analyze and suggest improvements for content
 */
export async function analyzeContent(
  content: string,
  type: "blog" | "book" | "newsletter" | "code"
): Promise<{
  score: number;
  suggestions: string[];
  improvements: { original: string; suggested: string; reason: string }[];
}> {
  const model = genAI.getGenerativeModel({
    model: MODELS.flash,
    systemInstruction: `You are a content analysis expert. Analyze ${type} content and provide actionable improvements.`,
  });

  const prompt = `Analyze this ${type} content and provide:
1. Quality score (1-100)
2. List of suggestions for improvement
3. Specific text improvements with before/after

Content:
${content.substring(0, 10000)}

Format as JSON with fields:
- score (number)
- suggestions (array of strings)
- improvements (array of {original, suggested, reason})`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  
  try {
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse analysis:", e);
  }
  
  return { score: 0, suggestions: [], improvements: [] };
}

/**
 * Generate code or modify files (agent capability)
 */
export async function generateCode(
  request: string,
  existingCode?: string,
  language: string = "typescript"
): Promise<GenerationResult> {
  const startTime = Date.now();
  
  const model = genAI.getGenerativeModel({
    model: MODELS.flash,
    systemInstruction: SYSTEM_PROMPTS.code,
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.3, // Lower temperature for code
    },
  });

  const prompt = existingCode
    ? `Modify this ${language} code based on the request.

Request: ${request}

Existing Code:
\`\`\`${language}
${existingCode}
\`\`\`

Provide the complete modified code with explanations.`
    : `Generate ${language} code for the following request:

${request}

Provide complete, working code with proper error handling.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return {
    content: response.text(),
    tokensUsed: response.usageMetadata?.totalTokenCount,
    model: MODELS.flash,
    processingTimeMs: Date.now() - startTime,
  };
}

/**
 * Get AI quota status
 */
export function getQuotaStatus(): { 
  apiKeyConfigured: boolean;
  model: string;
  dailyLimit: number;
  note: string;
} {
  return {
    apiKeyConfigured: !!process.env.GEMINI_API_KEY,
    model: MODELS.flash,
    dailyLimit: 1500,
    note: "Using Gemini 2.0 Flash with 1,500 free requests/day",
  };
}
