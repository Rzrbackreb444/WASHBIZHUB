/**
 * SEO AUTO-FIX ENGINE
 * 
 * 1-click automatic fix execution for SEO issues:
 * - Meta title/description optimization
 * - Alt tag generation
 * - Schema markup injection
 * - Canonical URL fixes
 * - Heading structure optimization
 * - Internal linking suggestions
 * 
 * Features:
 * - AI-powered fix suggestions
 * - Preview before applying
 * - Rollback capability
 * - Batch operations
 */

import { db } from "./db";
import { seoAutoFixes, InsertSeoAutoFix, seoProjects } from "@shared/schema";
import { eq, desc, and, sql, inArray } from "drizzle-orm";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Fix types with their configurations
export const FIX_TYPES = {
  meta_title: {
    label: "Meta Title",
    priority: "high",
    impact: "high",
    estimatedGain: 8,
    description: "Optimize page title for search engines",
  },
  meta_description: {
    label: "Meta Description",
    priority: "high",
    impact: "high",
    estimatedGain: 7,
    description: "Improve meta description for CTR",
  },
  alt_tag: {
    label: "Image Alt Text",
    priority: "medium",
    impact: "medium",
    estimatedGain: 4,
    description: "Add descriptive alt text to images",
  },
  heading: {
    label: "Heading Structure",
    priority: "medium",
    impact: "medium",
    estimatedGain: 5,
    description: "Fix H1-H6 hierarchy",
  },
  schema: {
    label: "Schema Markup",
    priority: "high",
    impact: "high",
    estimatedGain: 6,
    description: "Add JSON-LD structured data",
  },
  canonical: {
    label: "Canonical URL",
    priority: "medium",
    impact: "medium",
    estimatedGain: 5,
    description: "Set proper canonical URL",
  },
  internal_link: {
    label: "Internal Link",
    priority: "low",
    impact: "medium",
    estimatedGain: 3,
    description: "Add relevant internal links",
  },
  open_graph: {
    label: "Open Graph Tags",
    priority: "medium",
    impact: "medium",
    estimatedGain: 4,
    description: "Add social media meta tags",
  },
  robots: {
    label: "Robots Meta",
    priority: "high",
    impact: "high",
    estimatedGain: 5,
    description: "Configure robots directives",
  },
};

export interface SeoIssue {
  type: keyof typeof FIX_TYPES;
  issueDescription: string;
  targetPage: string;
  targetElement?: string;
  originalValue?: string;
  severity: "critical" | "high" | "medium" | "low";
}

export interface FixSuggestion {
  type: keyof typeof FIX_TYPES;
  issueDescription: string;
  targetPage: string;
  targetElement?: string;
  originalValue?: string;
  suggestedValue: string;
  priority: string;
  impact: string;
  estimatedSeoGain: number;
  explanation: string;
}

/**
 * Generate AI-powered fix suggestions for an issue
 */
async function generateFixSuggestion(
  issue: SeoIssue,
  pageContent?: string,
  targetKeywords?: string[]
): Promise<FixSuggestion | null> {
  try {
    const prompt = buildFixPrompt(issue, pageContent, targetKeywords);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an SEO expert. Generate optimal SEO fixes following these guidelines:
          - Meta titles: 50-60 characters, include primary keyword near start
          - Meta descriptions: 150-160 characters, include call-to-action
          - Alt tags: Descriptive, include keyword naturally
          - Headings: Clear hierarchy, H1 unique per page
          - Schema: Valid JSON-LD for the content type
          Respond with JSON only.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const result = JSON.parse(response.choices[0]?.message?.content || "{}");
    
    const fixConfig = FIX_TYPES[issue.type];
    
    return {
      type: issue.type,
      issueDescription: issue.issueDescription,
      targetPage: issue.targetPage,
      targetElement: issue.targetElement,
      originalValue: issue.originalValue,
      suggestedValue: result.suggestedValue || result.suggestion || "",
      priority: fixConfig.priority,
      impact: fixConfig.impact,
      estimatedSeoGain: fixConfig.estimatedGain,
      explanation: result.explanation || result.reason || "AI-optimized suggestion",
    };
  } catch (error) {
    console.error("Failed to generate fix suggestion:", error);
    return null;
  }
}

function buildFixPrompt(
  issue: SeoIssue,
  pageContent?: string,
  targetKeywords?: string[]
): string {
  const keywordContext = targetKeywords?.length
    ? `Target keywords: ${targetKeywords.join(", ")}`
    : "";
  
  switch (issue.type) {
    case "meta_title":
      return `Generate an optimized meta title for this page.
Page: ${issue.targetPage}
Current title: ${issue.originalValue || "No title"}
${keywordContext}
${pageContent ? `Page context: ${pageContent.substring(0, 500)}` : ""}

Respond with JSON: { "suggestedValue": "optimized title", "explanation": "why this is better" }`;

    case "meta_description":
      return `Generate an optimized meta description for this page.
Page: ${issue.targetPage}
Current description: ${issue.originalValue || "No description"}
${keywordContext}
${pageContent ? `Page context: ${pageContent.substring(0, 500)}` : ""}

Respond with JSON: { "suggestedValue": "optimized description", "explanation": "why this is better" }`;

    case "alt_tag":
      return `Generate descriptive alt text for an image.
Page: ${issue.targetPage}
Image context: ${issue.targetElement || "Unknown image"}
Current alt: ${issue.originalValue || "No alt text"}
${keywordContext}

Respond with JSON: { "suggestedValue": "descriptive alt text", "explanation": "why this is better" }`;

    case "schema":
      return `Generate appropriate JSON-LD schema markup.
Page: ${issue.targetPage}
Page type: ${issue.targetElement || "Article/Web Page"}
${keywordContext}
${pageContent ? `Content: ${pageContent.substring(0, 1000)}` : ""}

Respond with JSON: { "suggestedValue": "{...json-ld schema...}", "explanation": "schema type and benefits" }`;

    case "heading":
      return `Suggest heading structure improvements.
Page: ${issue.targetPage}
Current structure: ${issue.originalValue || "Unknown"}
Issue: ${issue.issueDescription}

Respond with JSON: { "suggestedValue": "corrected heading", "explanation": "heading hierarchy fix" }`;

    case "open_graph":
      return `Generate Open Graph meta tags.
Page: ${issue.targetPage}
Title: ${issue.originalValue || "Unknown"}
${keywordContext}

Respond with JSON: { "suggestedValue": "og:title, og:description, og:type", "explanation": "social optimization" }`;

    default:
      return `Provide SEO fix for:
Type: ${issue.type}
Page: ${issue.targetPage}
Issue: ${issue.issueDescription}
Current: ${issue.originalValue || "None"}
${keywordContext}

Respond with JSON: { "suggestedValue": "fix", "explanation": "reason" }`;
  }
}

/**
 * Scan a page for SEO issues
 */
export async function scanPageForIssues(
  url: string,
  html: string
): Promise<SeoIssue[]> {
  const issues: SeoIssue[] = [];
  const lowerHtml = html.toLowerCase();
  
  // Check meta title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (!titleMatch) {
    issues.push({
      type: "meta_title",
      issueDescription: "Missing meta title",
      targetPage: url,
      severity: "critical",
    });
  } else {
    const title = titleMatch[1].trim();
    if (title.length < 30) {
      issues.push({
        type: "meta_title",
        issueDescription: "Meta title too short (< 30 characters)",
        targetPage: url,
        originalValue: title,
        severity: "high",
      });
    } else if (title.length > 60) {
      issues.push({
        type: "meta_title",
        issueDescription: "Meta title too long (> 60 characters)",
        targetPage: url,
        originalValue: title,
        severity: "medium",
      });
    }
  }
  
  // Check meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (!descMatch) {
    issues.push({
      type: "meta_description",
      issueDescription: "Missing meta description",
      targetPage: url,
      severity: "critical",
    });
  } else {
    const desc = descMatch[1].trim();
    if (desc.length < 120) {
      issues.push({
        type: "meta_description",
        issueDescription: "Meta description too short (< 120 characters)",
        targetPage: url,
        originalValue: desc,
        severity: "high",
      });
    } else if (desc.length > 160) {
      issues.push({
        type: "meta_description",
        issueDescription: "Meta description too long (> 160 characters)",
        targetPage: url,
        originalValue: desc,
        severity: "medium",
      });
    }
  }
  
  // Check H1
  const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi);
  if (!h1Matches) {
    issues.push({
      type: "heading",
      issueDescription: "Missing H1 heading",
      targetPage: url,
      severity: "high",
    });
  } else if (h1Matches.length > 1) {
    issues.push({
      type: "heading",
      issueDescription: `Multiple H1 headings found (${h1Matches.length})`,
      targetPage: url,
      originalValue: h1Matches.join(", "),
      severity: "medium",
    });
  }
  
  // Check images for alt text
  const imgMatches = html.match(/<img[^>]*>/gi) || [];
  for (const img of imgMatches) {
    if (!img.includes('alt=') || img.match(/alt=["']\s*["']/)) {
      const srcMatch = img.match(/src=["']([^"']+)["']/);
      issues.push({
        type: "alt_tag",
        issueDescription: "Image missing alt text",
        targetPage: url,
        targetElement: srcMatch?.[1] || "unknown image",
        severity: "medium",
      });
    }
  }
  
  // Check canonical
  if (!lowerHtml.includes('rel="canonical"') && !lowerHtml.includes("rel='canonical'")) {
    issues.push({
      type: "canonical",
      issueDescription: "Missing canonical URL",
      targetPage: url,
      severity: "medium",
    });
  }
  
  // Check Open Graph
  if (!lowerHtml.includes('property="og:')) {
    issues.push({
      type: "open_graph",
      issueDescription: "Missing Open Graph meta tags",
      targetPage: url,
      severity: "medium",
    });
  }
  
  // Check schema
  if (!lowerHtml.includes('application/ld+json')) {
    issues.push({
      type: "schema",
      issueDescription: "No structured data (JSON-LD) found",
      targetPage: url,
      severity: "medium",
    });
  }
  
  return issues;
}

/**
 * Generate fixes for all issues
 */
export async function generateFixesForPage(
  url: string,
  html: string,
  projectId?: string,
  userId?: string,
  targetKeywords?: string[]
): Promise<FixSuggestion[]> {
  const issues = await scanPageForIssues(url, html);
  const fixes: FixSuggestion[] = [];
  
  // Get page content for context
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const pageContent = bodyMatch?.[1]?.replace(/<[^>]+>/g, " ").substring(0, 2000) || "";
  
  for (const issue of issues) {
    const fix = await generateFixSuggestion(issue, pageContent, targetKeywords);
    if (fix) {
      fixes.push(fix);
    }
  }
  
  // Save fixes to database
  for (const fix of fixes) {
    try {
      await db.insert(seoAutoFixes).values({
        projectId,
        userId,
        fixType: fix.type,
        issueDescription: fix.issueDescription,
        targetPage: fix.targetPage,
        targetElement: fix.targetElement,
        originalValue: fix.originalValue,
        suggestedValue: fix.suggestedValue,
        priority: fix.priority,
        impact: fix.impact,
        estimatedSeoGain: fix.estimatedSeoGain,
        status: "pending",
      });
    } catch (error) {
      console.error("Failed to save fix:", error);
    }
  }
  
  return fixes;
}

/**
 * Apply a fix
 */
export async function applyFix(
  fixId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const [fix] = await db
      .select()
      .from(seoAutoFixes)
      .where(eq(seoAutoFixes.id, fixId))
      .limit(1);
    
    if (!fix) {
      return { success: false, message: "Fix not found" };
    }
    
    if (fix.status === "applied") {
      return { success: false, message: "Fix already applied" };
    }
    
    // In a real implementation, this would:
    // 1. Update the actual page content
    // 2. Trigger a rebuild/redeploy
    // 3. Track the change in version history
    
    await db
      .update(seoAutoFixes)
      .set({
        status: "applied",
        appliedValue: fix.suggestedValue,
        approvedBy: userId,
        approvedAt: new Date(),
        appliedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(seoAutoFixes.id, fixId));
    
    console.log(`✅ Applied SEO fix: ${fix.fixType} on ${fix.targetPage}`);
    
    return { success: true, message: `Applied ${fix.fixType} fix successfully` };
  } catch (error) {
    console.error("Failed to apply fix:", error);
    return { success: false, message: "Failed to apply fix" };
  }
}

/**
 * Batch apply multiple fixes
 */
export async function batchApplyFixes(
  fixIds: string[],
  userId: string
): Promise<{ applied: number; failed: number; results: Array<{ id: string; success: boolean }> }> {
  const results = [];
  let applied = 0;
  let failed = 0;
  
  for (const fixId of fixIds) {
    const result = await applyFix(fixId, userId);
    results.push({ id: fixId, success: result.success });
    if (result.success) applied++;
    else failed++;
  }
  
  return { applied, failed, results };
}

/**
 * Revert a fix
 */
export async function revertFix(
  fixId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const [fix] = await db
      .select()
      .from(seoAutoFixes)
      .where(eq(seoAutoFixes.id, fixId))
      .limit(1);
    
    if (!fix) {
      return { success: false, message: "Fix not found" };
    }
    
    if (fix.status !== "applied") {
      return { success: false, message: "Fix not applied, cannot revert" };
    }
    
    // In real implementation, restore original value
    
    await db
      .update(seoAutoFixes)
      .set({
        status: "reverted",
        revertedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(seoAutoFixes.id, fixId));
    
    console.log(`↩️ Reverted SEO fix: ${fix.fixType} on ${fix.targetPage}`);
    
    return { success: true, message: `Reverted ${fix.fixType} fix` };
  } catch (error) {
    console.error("Failed to revert fix:", error);
    return { success: false, message: "Failed to revert fix" };
  }
}

/**
 * Get pending fixes for a project
 */
export async function getPendingFixes(
  projectId?: string,
  userId?: string
): Promise<typeof seoAutoFixes.$inferSelect[]> {
  const conditions = [eq(seoAutoFixes.status, "pending")];
  
  if (projectId) {
    conditions.push(eq(seoAutoFixes.projectId, projectId));
  }
  if (userId) {
    conditions.push(eq(seoAutoFixes.userId, userId));
  }
  
  return db
    .select()
    .from(seoAutoFixes)
    .where(and(...conditions))
    .orderBy(
      sql`CASE 
        WHEN ${seoAutoFixes.priority} = 'critical' THEN 1
        WHEN ${seoAutoFixes.priority} = 'high' THEN 2
        WHEN ${seoAutoFixes.priority} = 'medium' THEN 3
        ELSE 4 
      END`,
      desc(seoAutoFixes.estimatedSeoGain)
    );
}

/**
 * Get fix history for a project
 */
export async function getFixHistory(
  projectId?: string,
  userId?: string,
  limit: number = 50
): Promise<typeof seoAutoFixes.$inferSelect[]> {
  const conditions = [];
  
  if (projectId) {
    conditions.push(eq(seoAutoFixes.projectId, projectId));
  }
  if (userId) {
    conditions.push(eq(seoAutoFixes.userId, userId));
  }
  
  const query = db
    .select()
    .from(seoAutoFixes)
    .orderBy(desc(seoAutoFixes.createdAt))
    .limit(limit);
  
  if (conditions.length > 0) {
    return query.where(and(...conditions));
  }
  
  return query;
}

/**
 * Get fix summary stats
 */
export async function getFixStats(
  projectId?: string,
  userId?: string
): Promise<{
  pending: number;
  applied: number;
  reverted: number;
  totalSeoGain: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}> {
  const conditions = [];
  
  if (projectId) {
    conditions.push(eq(seoAutoFixes.projectId, projectId));
  }
  if (userId) {
    conditions.push(eq(seoAutoFixes.userId, userId));
  }
  
  let allFixes: typeof seoAutoFixes.$inferSelect[];
  
  if (conditions.length > 0) {
    allFixes = await db
      .select()
      .from(seoAutoFixes)
      .where(and(...conditions));
  } else {
    allFixes = await db.select().from(seoAutoFixes);
  }
  
  const pending = allFixes.filter(f => f.status === "pending").length;
  const applied = allFixes.filter(f => f.status === "applied").length;
  const reverted = allFixes.filter(f => f.status === "reverted").length;
  
  const totalSeoGain = allFixes
    .filter(f => f.status === "applied")
    .reduce((sum, f) => sum + (f.estimatedSeoGain || 0), 0);
  
  const byType: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  
  for (const fix of allFixes) {
    byType[fix.fixType] = (byType[fix.fixType] || 0) + 1;
    if (fix.priority) {
      byPriority[fix.priority] = (byPriority[fix.priority] || 0) + 1;
    }
  }
  
  return {
    pending,
    applied,
    reverted,
    totalSeoGain,
    byType,
    byPriority,
  };
}

export default {
  scanPageForIssues,
  generateFixesForPage,
  applyFix,
  batchApplyFixes,
  revertFix,
  getPendingFixes,
  getFixHistory,
  getFixStats,
  FIX_TYPES,
};
