/**
 * BACKLINK BUILDER
 * 
 * Outreach tools and backlink tracking:
 * - Backlink discovery & monitoring
 * - Outreach campaign management
 * - Link quality analysis
 * - Competitor backlink analysis
 */

import { db } from "./db";
import { backlinkOutreach, InsertBacklinkOutreach, seoProjects } from "@shared/schema";
import { eq, desc, and, sql, gte, like } from "drizzle-orm";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface BacklinkData {
  sourceUrl: string;
  sourceDomain: string;
  targetUrl: string;
  anchorText: string;
  domainAuthority: number;
  pageAuthority: number;
  linkType: "dofollow" | "nofollow" | "ugc" | "sponsored";
  firstSeen: Date;
  lastSeen: Date;
  status: "live" | "lost" | "new";
}

export interface OutreachProspect {
  domain: string;
  contactEmail?: string;
  domainAuthority: number;
  relevanceScore: number;
  contentType: string;
  outreachStatus: "not_contacted" | "contacted" | "responded" | "linked" | "rejected";
  notes?: string;
}

export interface OutreachCampaign {
  id: string;
  name: string;
  targetDomain: string;
  status: "draft" | "active" | "paused" | "completed";
  prospectsCount: number;
  contactedCount: number;
  respondedCount: number;
  linkedCount: number;
  createdAt: Date;
}

/**
 * Analyze backlink quality
 */
export function analyzeBacklinkQuality(backlink: BacklinkData): {
  qualityScore: number;
  factors: Record<string, { score: number; weight: number; notes: string }>;
  recommendation: string;
} {
  const factors: Record<string, { score: number; weight: number; notes: string }> = {};
  
  // Domain Authority (40% weight)
  const daScore = Math.min(100, backlink.domainAuthority);
  factors["domainAuthority"] = {
    score: daScore,
    weight: 40,
    notes: daScore >= 60 ? "High authority domain" : daScore >= 30 ? "Medium authority" : "Low authority",
  };
  
  // Link Type (25% weight)
  const linkTypeScore = backlink.linkType === "dofollow" ? 100 : 
                        backlink.linkType === "sponsored" ? 50 :
                        backlink.linkType === "ugc" ? 40 : 20;
  factors["linkType"] = {
    score: linkTypeScore,
    weight: 25,
    notes: backlink.linkType === "dofollow" ? "Passes full link equity" : "Limited link equity",
  };
  
  // Anchor Text (20% weight)
  const anchorScore = backlink.anchorText && backlink.anchorText.length > 0 ? 
                     (backlink.anchorText.length < 50 ? 80 : 60) : 40;
  factors["anchorText"] = {
    score: anchorScore,
    weight: 20,
    notes: backlink.anchorText || "No anchor text",
  };
  
  // Link Freshness (15% weight)
  const daysSinceFirst = Math.floor((Date.now() - backlink.firstSeen.getTime()) / (1000 * 60 * 60 * 24));
  const freshnessScore = daysSinceFirst < 30 ? 100 : daysSinceFirst < 180 ? 70 : 50;
  factors["freshness"] = {
    score: freshnessScore,
    weight: 15,
    notes: daysSinceFirst < 30 ? "New link" : daysSinceFirst < 180 ? "Recent link" : "Established link",
  };
  
  // Calculate weighted average
  const qualityScore = Math.round(
    Object.values(factors).reduce((sum, f) => sum + (f.score * f.weight / 100), 0)
  );
  
  // Generate recommendation
  let recommendation = "";
  if (qualityScore >= 80) {
    recommendation = "Excellent backlink - high value for SEO";
  } else if (qualityScore >= 60) {
    recommendation = "Good backlink - solid contribution to link profile";
  } else if (qualityScore >= 40) {
    recommendation = "Average backlink - consider if worth maintaining";
  } else {
    recommendation = "Low quality - monitor for toxic signals";
  }
  
  return { qualityScore, factors, recommendation };
}

/**
 * Generate outreach email template
 */
export async function generateOutreachEmail(
  prospect: OutreachProspect,
  targetSite: string,
  contentType: "guest_post" | "resource_link" | "broken_link" | "skyscraper"
): Promise<{
  subject: string;
  body: string;
}> {
  const prompts: Record<string, string> = {
    guest_post: `Write a brief, personalized outreach email for guest posting on ${prospect.domain}. 
The sender owns ${targetSite} and wants to contribute valuable content.
Keep it under 150 words, friendly but professional.`,
    
    resource_link: `Write a brief outreach email requesting a resource link from ${prospect.domain}.
The sender owns ${targetSite} which has relevant content.
Keep it under 120 words, focus on mutual value.`,
    
    broken_link: `Write a brief outreach email about a broken link opportunity on ${prospect.domain}.
The sender offers ${targetSite} as a replacement resource.
Keep it under 120 words, be helpful not pushy.`,
    
    skyscraper: `Write a brief skyscraper outreach email to ${prospect.domain}.
The sender has created improved content on ${targetSite} that could replace their current link.
Keep it under 130 words, focus on the improvement.`,
  };
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert link building outreach specialist. Write natural, non-spammy emails that get responses.",
        },
        {
          role: "user",
          content: prompts[contentType] + "\n\nRespond with JSON: { \"subject\": \"...\", \"body\": \"...\" }",
        },
      ],
      response_format: { type: "json_object" },
    });
    
    const result = JSON.parse(response.choices[0]?.message?.content || "{}");
    return {
      subject: result.subject || "Collaboration Opportunity",
      body: result.body || "",
    };
  } catch (error) {
    console.error("Failed to generate outreach email:", error);
    return {
      subject: "Quick Question About Your Site",
      body: `Hi there,\n\nI came across ${prospect.domain} and really enjoyed your content. I run ${targetSite} and think there might be a great opportunity for us to collaborate.\n\nWould you be open to a quick chat?\n\nBest regards`,
    };
  }
}

/**
 * Create or update outreach record
 */
export async function upsertOutreach(
  outreach: InsertBacklinkOutreach
): Promise<typeof backlinkOutreach.$inferSelect> {
  const existing = await db
    .select()
    .from(backlinkOutreach)
    .where(and(
      eq(backlinkOutreach.projectId, outreach.projectId || ""),
      eq(backlinkOutreach.targetDomain, outreach.targetDomain)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    await db
      .update(backlinkOutreach)
      .set({
        ...outreach,
        updatedAt: new Date(),
      })
      .where(eq(backlinkOutreach.id, existing[0].id));
    
    return { ...existing[0], ...outreach };
  }
  
  const [inserted] = await db
    .insert(backlinkOutreach)
    .values(outreach)
    .returning();
  
  return inserted;
}

/**
 * Get outreach dashboard
 */
export async function getOutreachDashboard(
  projectId?: string,
  userId?: string
): Promise<{
  summary: {
    totalProspects: number;
    contacted: number;
    responded: number;
    linked: number;
    responseRate: number;
    conversionRate: number;
    avgDomainAuthority: number;
  };
  byStatus: Record<string, number>;
  recentActivity: typeof backlinkOutreach.$inferSelect[];
  topProspects: typeof backlinkOutreach.$inferSelect[];
}> {
  const conditions = [];
  if (projectId) {
    conditions.push(eq(backlinkOutreach.projectId, projectId));
  }
  if (userId) {
    conditions.push(eq(backlinkOutreach.userId, userId));
  }
  
  let allOutreach: typeof backlinkOutreach.$inferSelect[];
  
  if (conditions.length > 0) {
    allOutreach = await db
      .select()
      .from(backlinkOutreach)
      .where(and(...conditions))
      .orderBy(desc(backlinkOutreach.updatedAt));
  } else {
    allOutreach = await db
      .select()
      .from(backlinkOutreach)
      .orderBy(desc(backlinkOutreach.updatedAt));
  }
  
  const totalProspects = allOutreach.length;
  const contacted = allOutreach.filter(o => o.status !== "not_contacted" && o.status !== "prospect").length;
  const responded = allOutreach.filter(o => o.status === "responded" || o.status === "linked" || o.status === "negotiating").length;
  const linked = allOutreach.filter(o => o.status === "linked").length;
  
  const responseRate = contacted > 0 ? Math.round((responded / contacted) * 100) : 0;
  const conversionRate = contacted > 0 ? Math.round((linked / contacted) * 100) : 0;
  
  const domainAuthorities = allOutreach
    .filter(o => o.domainAuthority !== null)
    .map(o => o.domainAuthority as number);
  const avgDomainAuthority = domainAuthorities.length > 0
    ? Math.round(domainAuthorities.reduce((a, b) => a + b, 0) / domainAuthorities.length)
    : 0;
  
  // Group by status
  const byStatus: Record<string, number> = {};
  for (const outreach of allOutreach) {
    const status = outreach.status || "unknown";
    byStatus[status] = (byStatus[status] || 0) + 1;
  }
  
  // Top prospects by DA
  const topProspects = [...allOutreach]
    .filter(o => o.status !== "rejected" && o.status !== "linked")
    .sort((a, b) => (b.domainAuthority || 0) - (a.domainAuthority || 0))
    .slice(0, 10);
  
  return {
    summary: {
      totalProspects,
      contacted,
      responded,
      linked,
      responseRate,
      conversionRate,
      avgDomainAuthority,
    },
    byStatus,
    recentActivity: allOutreach.slice(0, 10),
    topProspects,
  };
}

/**
 * Get link building opportunities based on competitor analysis
 */
export async function getLinkOpportunities(
  domain: string,
  competitorDomains: string[]
): Promise<Array<{
  opportunityType: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedValue: "high" | "medium" | "low";
  actionSteps: string[];
}>> {
  // This would integrate with backlink analysis APIs in production
  // For now, return strategic opportunities
  
  return [
    {
      opportunityType: "Resource Page Links",
      description: "Get listed on industry resource pages that link to your competitors",
      difficulty: "medium",
      estimatedValue: "high",
      actionSteps: [
        "Find resource pages linking to competitors",
        "Create superior content or tools",
        "Reach out to page owners with value proposition",
      ],
    },
    {
      opportunityType: "Guest Posting",
      description: "Publish guest articles on high-authority industry blogs",
      difficulty: "medium",
      estimatedValue: "high",
      actionSteps: [
        "Identify blogs accepting guest posts",
        "Analyze their content for topic gaps",
        "Pitch unique, valuable article ideas",
        "Include natural contextual links",
      ],
    },
    {
      opportunityType: "Broken Link Building",
      description: "Find broken links on relevant sites and offer your content as replacement",
      difficulty: "easy",
      estimatedValue: "medium",
      actionSteps: [
        "Use tools to find broken links in your niche",
        "Create content that matches the broken resource",
        "Reach out to site owners offering your replacement",
      ],
    },
    {
      opportunityType: "HARO/Journalist Queries",
      description: "Respond to journalist queries for expert quotes and mentions",
      difficulty: "easy",
      estimatedValue: "high",
      actionSteps: [
        "Sign up for HARO and similar services",
        "Monitor for relevant queries daily",
        "Provide quick, valuable expert responses",
      ],
    },
    {
      opportunityType: "Industry Directories",
      description: "Get listed in relevant industry directories and associations",
      difficulty: "easy",
      estimatedValue: "medium",
      actionSteps: [
        "Identify industry-specific directories",
        "Apply for listings with complete profiles",
        "Join industry associations with member directories",
      ],
    },
    {
      opportunityType: "Content Partnerships",
      description: "Partner with complementary businesses for co-created content",
      difficulty: "medium",
      estimatedValue: "high",
      actionSteps: [
        "Identify non-competing businesses in your space",
        "Propose joint content creation",
        "Cross-promote with mutual linking",
      ],
    },
  ];
}

/**
 * Calculate domain link profile health
 */
export async function calculateLinkProfileHealth(
  backlinks: BacklinkData[]
): Promise<{
  healthScore: number;
  metrics: {
    totalBacklinks: number;
    uniqueDomains: number;
    dofollowRatio: number;
    avgDomainAuthority: number;
    newLinksLast30Days: number;
    lostLinksLast30Days: number;
  };
  warnings: string[];
  recommendations: string[];
}> {
  const uniqueDomains = new Set(backlinks.map(b => b.sourceDomain)).size;
  const dofollowLinks = backlinks.filter(b => b.linkType === "dofollow").length;
  const dofollowRatio = backlinks.length > 0 ? dofollowLinks / backlinks.length : 0;
  
  const das = backlinks.map(b => b.domainAuthority);
  const avgDA = das.length > 0 ? das.reduce((a, b) => a + b, 0) / das.length : 0;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const newLinks = backlinks.filter(b => b.firstSeen >= thirtyDaysAgo && b.status === "new").length;
  const lostLinks = backlinks.filter(b => b.status === "lost").length;
  
  // Calculate health score
  let healthScore = 50;
  
  // Domain diversity (max +20)
  healthScore += Math.min(20, (uniqueDomains / Math.max(1, backlinks.length)) * 40);
  
  // Dofollow ratio (max +15, optimal around 70%)
  if (dofollowRatio >= 0.6 && dofollowRatio <= 0.85) {
    healthScore += 15;
  } else if (dofollowRatio >= 0.5 && dofollowRatio <= 0.9) {
    healthScore += 10;
  } else {
    healthScore += 5;
  }
  
  // Average DA (max +10)
  healthScore += Math.min(10, avgDA / 10);
  
  // Link velocity (max +5)
  if (newLinks > lostLinks) {
    healthScore += 5;
  } else if (newLinks === lostLinks) {
    healthScore += 2;
  }
  
  healthScore = Math.min(100, Math.round(healthScore));
  
  // Generate warnings
  const warnings: string[] = [];
  if (dofollowRatio > 0.95) {
    warnings.push("Dofollow ratio unusually high - may appear unnatural to search engines");
  }
  if (lostLinks > newLinks * 2) {
    warnings.push("Losing links faster than gaining - investigate causes");
  }
  if (avgDA < 20) {
    warnings.push("Low average domain authority - focus on quality link building");
  }
  if (uniqueDomains < backlinks.length * 0.5) {
    warnings.push("Low domain diversity - too many links from same domains");
  }
  
  // Generate recommendations
  const recommendations: string[] = [];
  if (avgDA < 40) {
    recommendations.push("Target higher authority sites for new link building efforts");
  }
  if (newLinks < 5) {
    recommendations.push("Increase link building velocity with consistent outreach");
  }
  if (uniqueDomains < 50) {
    recommendations.push("Diversify link sources across more unique domains");
  }
  
  return {
    healthScore,
    metrics: {
      totalBacklinks: backlinks.length,
      uniqueDomains,
      dofollowRatio: Math.round(dofollowRatio * 100),
      avgDomainAuthority: Math.round(avgDA),
      newLinksLast30Days: newLinks,
      lostLinksLast30Days: lostLinks,
    },
    warnings,
    recommendations,
  };
}

export default {
  analyzeBacklinkQuality,
  generateOutreachEmail,
  upsertOutreach,
  getOutreachDashboard,
  getLinkOpportunities,
  calculateLinkProfileHealth,
};
