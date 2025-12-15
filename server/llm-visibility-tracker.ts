/**
 * LLM VISIBILITY TRACKER
 * 
 * Track brand mentions across AI platforms:
 * - ChatGPT (OpenAI)
 * - Perplexity
 * - Gemini (Google)
 * - Claude (Anthropic)
 * - Copilot (Microsoft)
 * 
 * Features:
 * - Query AI platforms with industry-specific prompts
 * - Detect brand/domain mentions
 * - Analyze sentiment and context
 * - Track competitor mentions
 * - Historical trend analysis
 */

import { db } from "./db";
import { llmVisibilityTracking, InsertLlmVisibilityTracking, seoProjects } from "@shared/schema";
import { eq, desc, and, sql, gte } from "drizzle-orm";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

// AI Platform clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Query templates for different industries
const QUERY_TEMPLATES = {
  laundromat: [
    "What are the best websites for buying a laundromat?",
    "What tools can help me analyze a laundromat location?",
    "Where can I find laundromats for sale?",
    "What is the best laundromat valuation calculator?",
    "How can I learn about investing in laundromats?",
    "What platforms offer laundromat business intelligence?",
    "What is the best software for laundromat owners?",
    "Where can I find laundromat equipment financing?",
  ],
  general: [
    "What are the best resources for {industry}?",
    "What tools can help with {topic}?",
    "Where can I find information about {subject}?",
  ],
};

// Competitor domains to track
const COMPETITOR_DOMAINS = [
  "searchatlas.com",
  "semrush.com",
  "ahrefs.com",
  "moz.com",
  "brightlocal.com",
  "loopnet.com",
  "bizbuysell.com",
];

export interface LlmQueryResult {
  platform: string;
  query: string;
  response: string;
  mentioned: boolean;
  mentionContext?: string;
  mentionRank?: number;
  recommendedAs?: string;
  competitorsMentioned: string[];
  sentiment: "positive" | "neutral" | "negative";
  confidenceScore: number;
}

/**
 * Query OpenAI ChatGPT for brand mentions
 */
async function queryOpenAI(query: string, domain: string): Promise<LlmQueryResult | null> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant providing recommendations and information. Be specific and mention actual websites and tools when relevant."
        },
        {
          role: "user",
          content: query
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const responseText = response.choices[0]?.message?.content || "";
    return analyzeResponse("chatgpt", query, responseText, domain);
  } catch (error) {
    console.error("OpenAI query error:", error);
    return null;
  }
}

/**
 * Query Anthropic Claude for brand mentions
 */
async function queryClaude(query: string, domain: string): Promise<LlmQueryResult | null> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: query
        }
      ],
    });

    const responseText = response.content[0]?.type === "text" ? response.content[0].text : "";
    return analyzeResponse("claude", query, responseText, domain);
  } catch (error) {
    console.error("Claude query error:", error);
    return null;
  }
}

/**
 * Query Google Gemini for brand mentions
 */
async function queryGemini(query: string, domain: string): Promise<LlmQueryResult | null> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(query);
    const responseText = result.response.text();
    return analyzeResponse("gemini", query, responseText, domain);
  } catch (error) {
    console.error("Gemini query error:", error);
    return null;
  }
}

/**
 * Analyze AI response for mentions
 */
function analyzeResponse(
  platform: string,
  query: string,
  response: string,
  domain: string
): LlmQueryResult {
  const lowerResponse = response.toLowerCase();
  const lowerDomain = domain.toLowerCase().replace("www.", "");
  
  // Check if domain is mentioned
  const mentioned = lowerResponse.includes(lowerDomain) || 
                   lowerResponse.includes(lowerDomain.replace(".com", "")) ||
                   lowerResponse.includes("washbizhub") ||
                   lowerResponse.includes("wash biz hub");
  
  // Find mention context
  let mentionContext: string | undefined;
  let mentionRank: number | undefined;
  let recommendedAs: string | undefined;
  
  if (mentioned) {
    // Extract context around mention
    const index = lowerResponse.indexOf(lowerDomain.split(".")[0]);
    if (index > -1) {
      const start = Math.max(0, index - 100);
      const end = Math.min(response.length, index + 100);
      mentionContext = response.substring(start, end).trim();
    }
    
    // Determine rank (position in response)
    const sentences = response.split(/[.!?]/);
    for (let i = 0; i < sentences.length; i++) {
      if (sentences[i].toLowerCase().includes(lowerDomain.split(".")[0])) {
        mentionRank = i + 1;
        break;
      }
    }
    
    // Determine how it was recommended
    if (lowerResponse.includes("best") || lowerResponse.includes("top")) {
      recommendedAs = "Best/Top recommendation";
    } else if (lowerResponse.includes("recommend")) {
      recommendedAs = "Direct recommendation";
    } else if (lowerResponse.includes("popular") || lowerResponse.includes("leading")) {
      recommendedAs = "Popular/Leading mention";
    } else {
      recommendedAs = "General mention";
    }
  }
  
  // Check for competitor mentions
  const competitorsMentioned: string[] = [];
  for (const competitor of COMPETITOR_DOMAINS) {
    if (lowerResponse.includes(competitor.toLowerCase().replace(".com", ""))) {
      competitorsMentioned.push(competitor);
    }
  }
  
  // Analyze sentiment
  let sentiment: "positive" | "neutral" | "negative" = "neutral";
  const positiveWords = ["excellent", "great", "best", "top", "highly recommend", "comprehensive", "useful", "valuable"];
  const negativeWords = ["avoid", "not recommended", "limited", "poor", "outdated", "problematic"];
  
  if (mentioned) {
    const surroundingContext = mentionContext?.toLowerCase() || "";
    if (positiveWords.some(word => surroundingContext.includes(word))) {
      sentiment = "positive";
    } else if (negativeWords.some(word => surroundingContext.includes(word))) {
      sentiment = "negative";
    }
  }
  
  // Calculate confidence score
  let confidenceScore = 50;
  if (mentioned) {
    confidenceScore = 80;
    if (mentionRank && mentionRank <= 3) confidenceScore += 10;
    if (recommendedAs?.includes("Best")) confidenceScore += 10;
    if (sentiment === "positive") confidenceScore += 5;
  }
  confidenceScore = Math.min(100, confidenceScore);
  
  return {
    platform,
    query,
    response: response.substring(0, 500), // Store first 500 chars
    mentioned,
    mentionContext,
    mentionRank,
    recommendedAs,
    competitorsMentioned,
    sentiment,
    confidenceScore,
  };
}

/**
 * Run visibility check across all AI platforms
 */
export async function runVisibilityCheck(
  domain: string,
  projectId?: string,
  userId?: string,
  customQueries?: string[]
): Promise<{
  results: LlmQueryResult[];
  summary: {
    totalChecks: number;
    mentionCount: number;
    mentionRate: number;
    avgConfidence: number;
    platformBreakdown: Record<string, { mentions: number; total: number }>;
    topCompetitors: Array<{ domain: string; mentions: number }>;
  };
}> {
  const queries = customQueries || QUERY_TEMPLATES.laundromat;
  const results: LlmQueryResult[] = [];
  
  console.log(`🔍 Running LLM visibility check for ${domain}`);
  
  for (const query of queries) {
    // Query each platform
    const [openaiResult, claudeResult, geminiResult] = await Promise.all([
      queryOpenAI(query, domain),
      queryClaude(query, domain),
      queryGemini(query, domain),
    ]);
    
    if (openaiResult) results.push(openaiResult);
    if (claudeResult) results.push(claudeResult);
    if (geminiResult) results.push(geminiResult);
  }
  
  // Save results to database
  for (const result of results) {
    try {
      await db.insert(llmVisibilityTracking).values({
        projectId,
        userId,
        domain,
        platform: result.platform,
        query: result.query,
        mentioned: result.mentioned,
        mentionContext: result.mentionContext,
        mentionRank: result.mentionRank,
        recommendedAs: result.recommendedAs,
        competitorsMentioned: result.competitorsMentioned,
        sentiment: result.sentiment,
        confidenceScore: result.confidenceScore,
        responseSnippet: result.response,
      });
    } catch (error) {
      console.error("Failed to save visibility result:", error);
    }
  }
  
  // Calculate summary
  const mentionCount = results.filter(r => r.mentioned).length;
  const avgConfidence = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.confidenceScore, 0) / results.length)
    : 0;
  
  // Platform breakdown
  const platformBreakdown: Record<string, { mentions: number; total: number }> = {};
  for (const result of results) {
    if (!platformBreakdown[result.platform]) {
      platformBreakdown[result.platform] = { mentions: 0, total: 0 };
    }
    platformBreakdown[result.platform].total++;
    if (result.mentioned) {
      platformBreakdown[result.platform].mentions++;
    }
  }
  
  // Top competitors
  const competitorCounts: Record<string, number> = {};
  for (const result of results) {
    for (const competitor of result.competitorsMentioned) {
      competitorCounts[competitor] = (competitorCounts[competitor] || 0) + 1;
    }
  }
  const topCompetitors = Object.entries(competitorCounts)
    .map(([domain, mentions]) => ({ domain, mentions }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 5);
  
  console.log(`✅ Visibility check complete: ${mentionCount}/${results.length} mentions`);
  
  return {
    results,
    summary: {
      totalChecks: results.length,
      mentionCount,
      mentionRate: results.length > 0 ? Math.round((mentionCount / results.length) * 100) : 0,
      avgConfidence,
      platformBreakdown,
      topCompetitors,
    },
  };
}

/**
 * Get visibility history for a domain
 */
export async function getVisibilityHistory(
  domain: string,
  days: number = 30,
  projectId?: string
): Promise<{
  history: typeof llmVisibilityTracking.$inferSelect[];
  trends: {
    mentionTrend: "up" | "down" | "stable";
    confidenceTrend: "up" | "down" | "stable";
    platformPerformance: Record<string, number>;
  };
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const conditions = [
    eq(llmVisibilityTracking.domain, domain),
    gte(llmVisibilityTracking.checkedAt, startDate),
  ];
  
  if (projectId) {
    conditions.push(eq(llmVisibilityTracking.projectId, projectId));
  }
  
  const history = await db
    .select()
    .from(llmVisibilityTracking)
    .where(and(...conditions))
    .orderBy(desc(llmVisibilityTracking.checkedAt))
    .limit(500);
  
  // Calculate trends
  const halfPoint = Math.floor(history.length / 2);
  const recentHalf = history.slice(0, halfPoint);
  const olderHalf = history.slice(halfPoint);
  
  const recentMentionRate = recentHalf.length > 0
    ? recentHalf.filter(h => h.mentioned).length / recentHalf.length
    : 0;
  const olderMentionRate = olderHalf.length > 0
    ? olderHalf.filter(h => h.mentioned).length / olderHalf.length
    : 0;
  
  let mentionTrend: "up" | "down" | "stable" = "stable";
  if (recentMentionRate > olderMentionRate + 0.1) mentionTrend = "up";
  else if (recentMentionRate < olderMentionRate - 0.1) mentionTrend = "down";
  
  const recentAvgConf = recentHalf.length > 0
    ? recentHalf.reduce((sum, h) => sum + (h.confidenceScore || 0), 0) / recentHalf.length
    : 0;
  const olderAvgConf = olderHalf.length > 0
    ? olderHalf.reduce((sum, h) => sum + (h.confidenceScore || 0), 0) / olderHalf.length
    : 0;
  
  let confidenceTrend: "up" | "down" | "stable" = "stable";
  if (recentAvgConf > olderAvgConf + 5) confidenceTrend = "up";
  else if (recentAvgConf < olderAvgConf - 5) confidenceTrend = "down";
  
  // Platform performance
  const platformPerformance: Record<string, number> = {};
  for (const record of history) {
    if (!platformPerformance[record.platform]) {
      platformPerformance[record.platform] = 0;
    }
    if (record.mentioned) {
      platformPerformance[record.platform]++;
    }
  }
  
  return {
    history,
    trends: {
      mentionTrend,
      confidenceTrend,
      platformPerformance,
    },
  };
}

/**
 * Get visibility dashboard summary
 */
export async function getVisibilityDashboard(userId: string): Promise<{
  domains: Array<{
    domain: string;
    lastCheck: Date | null;
    mentionRate: number;
    topPlatform: string | null;
  }>;
  recentChecks: typeof llmVisibilityTracking.$inferSelect[];
  overallStats: {
    totalDomains: number;
    avgMentionRate: number;
    bestPerformingPlatform: string;
    checksThisMonth: number;
  };
}> {
  // Get unique domains for user
  const domainResults = await db
    .selectDistinct({ domain: llmVisibilityTracking.domain })
    .from(llmVisibilityTracking)
    .where(eq(llmVisibilityTracking.userId, userId));
  
  const domains = [];
  for (const { domain } of domainResults) {
    const domainHistory = await db
      .select()
      .from(llmVisibilityTracking)
      .where(and(
        eq(llmVisibilityTracking.userId, userId),
        eq(llmVisibilityTracking.domain, domain)
      ))
      .orderBy(desc(llmVisibilityTracking.checkedAt))
      .limit(100);
    
    const mentionRate = domainHistory.length > 0
      ? Math.round((domainHistory.filter(h => h.mentioned).length / domainHistory.length) * 100)
      : 0;
    
    // Find top platform
    const platformCounts: Record<string, number> = {};
    for (const h of domainHistory.filter(h => h.mentioned)) {
      platformCounts[h.platform] = (platformCounts[h.platform] || 0) + 1;
    }
    const topPlatform = Object.entries(platformCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    
    domains.push({
      domain,
      lastCheck: domainHistory[0]?.checkedAt || null,
      mentionRate,
      topPlatform,
    });
  }
  
  // Get recent checks
  const recentChecks = await db
    .select()
    .from(llmVisibilityTracking)
    .where(eq(llmVisibilityTracking.userId, userId))
    .orderBy(desc(llmVisibilityTracking.checkedAt))
    .limit(20);
  
  // Calculate overall stats
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  
  const checksThisMonth = await db
    .select({ count: sql<number>`count(*)` })
    .from(llmVisibilityTracking)
    .where(and(
      eq(llmVisibilityTracking.userId, userId),
      gte(llmVisibilityTracking.checkedAt, monthStart)
    ));
  
  const avgMentionRate = domains.length > 0
    ? Math.round(domains.reduce((sum, d) => sum + d.mentionRate, 0) / domains.length)
    : 0;
  
  // Best performing platform
  const platformTotals: Record<string, { mentions: number; total: number }> = {};
  for (const check of recentChecks) {
    if (!platformTotals[check.platform]) {
      platformTotals[check.platform] = { mentions: 0, total: 0 };
    }
    platformTotals[check.platform].total++;
    if (check.mentioned) {
      platformTotals[check.platform].mentions++;
    }
  }
  
  const bestPlatform = Object.entries(platformTotals)
    .map(([platform, { mentions, total }]) => ({
      platform,
      rate: total > 0 ? mentions / total : 0,
    }))
    .sort((a, b) => b.rate - a.rate)[0]?.platform || "chatgpt";
  
  return {
    domains,
    recentChecks,
    overallStats: {
      totalDomains: domains.length,
      avgMentionRate,
      bestPerformingPlatform: bestPlatform,
      checksThisMonth: Number(checksThisMonth[0]?.count || 0),
    },
  };
}

/**
 * Get optimization suggestions based on visibility data
 */
export async function getOptimizationSuggestions(
  domain: string,
  userId: string
): Promise<Array<{
  category: string;
  suggestion: string;
  priority: "high" | "medium" | "low";
  estimatedImpact: string;
}>> {
  const { history, trends } = await getVisibilityHistory(domain, 30);
  
  const suggestions = [];
  
  // Check overall mention rate
  const mentionRate = history.length > 0
    ? history.filter(h => h.mentioned).length / history.length
    : 0;
  
  if (mentionRate < 0.2) {
    suggestions.push({
      category: "Content Authority",
      suggestion: "Create more authoritative, AI-quotable content with clear statistics, unique data, and expert insights that AI models tend to cite.",
      priority: "high" as const,
      estimatedImpact: "Could increase AI visibility by 30-50%",
    });
  }
  
  if (mentionRate < 0.5) {
    suggestions.push({
      category: "Brand Recognition",
      suggestion: "Increase brand mentions across the web through PR, guest posts, and industry publications to improve AI model training data.",
      priority: "high" as const,
      estimatedImpact: "Builds long-term AI visibility foundation",
    });
  }
  
  // Check platform-specific performance
  for (const [platform, data] of Object.entries(trends.platformPerformance)) {
    const platformHistory = history.filter(h => h.platform === platform);
    const platformRate = platformHistory.length > 0
      ? platformHistory.filter(h => h.mentioned).length / platformHistory.length
      : 0;
    
    if (platformRate < 0.3) {
      suggestions.push({
        category: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Optimization`,
        suggestion: `Your visibility on ${platform} is low. Create content that aligns with ${platform}'s training data preferences.`,
        priority: "medium" as const,
        estimatedImpact: `+15-25% visibility on ${platform}`,
      });
    }
  }
  
  // Check competitor mentions
  const competitorMentions: Record<string, number> = {};
  for (const h of history) {
    const competitors = h.competitorsMentioned as string[] || [];
    for (const c of competitors) {
      competitorMentions[c] = (competitorMentions[c] || 0) + 1;
    }
  }
  
  const topCompetitor = Object.entries(competitorMentions)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (topCompetitor && topCompetitor[1] > history.length * 0.3) {
    suggestions.push({
      category: "Competitive Positioning",
      suggestion: `${topCompetitor[0]} is frequently mentioned by AI. Analyze their content strategy and create differentiated, more authoritative content.`,
      priority: "medium" as const,
      estimatedImpact: "Capture share from competitor mentions",
    });
  }
  
  // Trend-based suggestions
  if (trends.mentionTrend === "down") {
    suggestions.push({
      category: "Trend Alert",
      suggestion: "Your AI visibility is declining. Refresh your content, add new data/statistics, and increase publishing frequency.",
      priority: "high" as const,
      estimatedImpact: "Reverse declining visibility trend",
    });
  }
  
  // General best practices
  suggestions.push({
    category: "E-E-A-T Signals",
    suggestion: "Add author bios, expert credentials, citations, and updated dates to content to improve AI trust signals.",
    priority: "low" as const,
    estimatedImpact: "+10-15% trust score in AI responses",
  });
  
  return suggestions.slice(0, 6);
}

export default {
  runVisibilityCheck,
  getVisibilityHistory,
  getVisibilityDashboard,
  getOptimizationSuggestions,
  QUERY_TEMPLATES,
  COMPETITOR_DOMAINS,
};
