/**
 * AUTO-LINKING ENGINE
 * 
 * Features:
 * - Analyze website structure to identify internal linking opportunities
 * - Generate contextual anchor text with AI
 * - Track link equity distribution
 * - Auto-suggest external authoritative links
 * - Monitor for broken links
 * - Optimize anchor text diversity
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export interface InternalLinkOpportunity {
  sourceUrl: string;
  targetUrl: string;
  anchorText: string;
  contextSnippet: string;
  relevanceScore: number; // 0-100
  reasoning: string;
  position: number; // Character position in content
}

export interface ExternalLinkOpportunity {
  anchorText: string;
  targetUrl: string;
  domain: string;
  authorityScore: number; // Domain authority 0-100
  relevance: number; // 0-100
  contextSnippet: string;
  reasoning: string;
  nofollowRecommended: boolean;
}

export interface LinkEquityAnalysis {
  url: string;
  inboundLinks: number;
  outboundLinks: number;
  linkEquity: number; // Calculated score
  orphanPage: boolean;
  hubPage: boolean;
  recommendations: string[];
}

export interface SiteStructure {
  pages: PageInfo[];
  totalPages: number;
  avgInternalLinks: number;
  orphanPages: string[];
  hubPages: string[];
  recommendations: string[];
}

export interface PageInfo {
  url: string;
  title: string;
  keywords: string[];
  headings: string[];
  wordCount: number;
  internalLinks: string[];
  externalLinks: string[];
}

/**
 * Analyze website structure and identify internal linking opportunities
 */
export async function analyzeInternalLinking(
  pages: PageInfo[]
): Promise<{
  opportunities: InternalLinkOpportunity[];
  structure: SiteStructure;
  equity: LinkEquityAnalysis[];
}> {
  // Build link graph
  const linkGraph = new Map<string, Set<string>>();
  const inboundCounts = new Map<string, number>();
  
  pages.forEach(page => {
    linkGraph.set(page.url, new Set(page.internalLinks));
    inboundCounts.set(page.url, 0);
  });
  
  // Count inbound links
  pages.forEach(page => {
    page.internalLinks.forEach(link => {
      inboundCounts.set(link, (inboundCounts.get(link) || 0) + 1);
    });
  });
  
  // Identify orphan and hub pages
  const orphanPages: string[] = [];
  const hubPages: string[] = [];
  
  pages.forEach(page => {
    const inbound = inboundCounts.get(page.url) || 0;
    const outbound = page.internalLinks.length;
    
    if (inbound === 0 && page.url !== "/") {
      orphanPages.push(page.url);
    }
    if (inbound > 10 || outbound > 15) {
      hubPages.push(page.url);
    }
  });
  
  // Find linking opportunities
  const opportunities: InternalLinkOpportunity[] = [];
  
  for (const sourcePage of pages) {
    for (const targetPage of pages) {
      if (sourcePage.url === targetPage.url) continue;
      if (sourcePage.internalLinks.includes(targetPage.url)) continue;
      
      // Calculate relevance based on keyword overlap
      const relevance = calculateRelevance(sourcePage, targetPage);
      
      if (relevance > 60) {
        // Generate anchor text
        const anchorText = generateAnchorText(targetPage);
        
        opportunities.push({
          sourceUrl: sourcePage.url,
          targetUrl: targetPage.url,
          anchorText,
          contextSnippet: `Add link from "${sourcePage.title}" to "${targetPage.title}"`,
          relevanceScore: relevance,
          reasoning: `High keyword overlap (${relevance}% relevance)`,
          position: 0, // Would need content analysis
        });
      }
    }
  }
  
  // Sort by relevance
  opportunities.sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  // Calculate link equity
  const equity: LinkEquityAnalysis[] = pages.map(page => {
    const inbound = inboundCounts.get(page.url) || 0;
    const outbound = page.internalLinks.length;
    const linkEquity = calculateLinkEquity(inbound, outbound);
    
    const recommendations: string[] = [];
    if (inbound === 0 && page.url !== "/") {
      recommendations.push("Orphan page: Add internal links from related pages");
    }
    if (outbound === 0) {
      recommendations.push("Add internal links to related content");
    }
    if (outbound > 100) {
      recommendations.push("Too many outbound links: Consider reducing");
    }
    if (linkEquity > 80) {
      recommendations.push("High-value page: Ensure it's linked from homepage");
    }
    
    return {
      url: page.url,
      inboundLinks: inbound,
      outboundLinks: outbound,
      linkEquity,
      orphanPage: inbound === 0 && page.url !== "/",
      hubPage: inbound > 10 || outbound > 15,
      recommendations,
    };
  });
  
  // Generate structure recommendations
  const avgInternalLinks = pages.reduce((sum, p) => sum + p.internalLinks.length, 0) / pages.length;
  const structureRecommendations: string[] = [];
  
  if (orphanPages.length > 0) {
    structureRecommendations.push(`Fix ${orphanPages.length} orphan pages by adding internal links`);
  }
  if (avgInternalLinks < 3) {
    structureRecommendations.push("Increase internal linking (average < 3 links per page)");
  }
  if (hubPages.length === 0) {
    structureRecommendations.push("Create hub pages to organize content");
  }
  
  return {
    opportunities: opportunities.slice(0, 50), // Top 50
    structure: {
      pages,
      totalPages: pages.length,
      avgInternalLinks,
      orphanPages,
      hubPages,
      recommendations: structureRecommendations,
    },
    equity,
  };
}

/**
 * Calculate relevance between two pages
 */
function calculateRelevance(page1: PageInfo, page2: PageInfo): number {
  // Keyword overlap
  const keywords1 = new Set(page1.keywords.map(k => k.toLowerCase()));
  const keywords2 = new Set(page2.keywords.map(k => k.toLowerCase()));
  
  const overlap = Array.from(keywords1).filter(k => keywords2.has(k)).length;
  const total = Math.max(keywords1.size, keywords2.size);
  
  const keywordScore = total > 0 ? (overlap / total) * 100 : 0;
  
  // Title similarity
  const title1Words = page1.title.toLowerCase().split(/\s+/);
  const title2Words = page2.title.toLowerCase().split(/\s+/);
  const titleOverlap = title1Words.filter(w => title2Words.includes(w)).length;
  const titleScore = (titleOverlap / Math.max(title1Words.length, title2Words.length)) * 100;
  
  // Weighted average
  return Math.round(keywordScore * 0.7 + titleScore * 0.3);
}

/**
 * Calculate link equity score
 */
function calculateLinkEquity(inbound: number, outbound: number): number {
  // More inbound links = higher equity
  // More outbound links = equity is diluted
  const inboundScore = Math.min(100, inbound * 10);
  const dilutionFactor = outbound > 0 ? 1 / Math.log(outbound + 1) : 1;
  
  return Math.round(inboundScore * dilutionFactor);
}

/**
 * Generate anchor text for a page
 */
function generateAnchorText(page: PageInfo): string {
  // Use primary keyword or first heading
  if (page.keywords.length > 0) {
    return page.keywords[0];
  }
  if (page.headings.length > 0) {
    return page.headings[0];
  }
  return page.title;
}

/**
 * Find external linking opportunities
 */
export async function findExternalLinks(
  content: string,
  keywords: string[]
): Promise<ExternalLinkOpportunity[]> {
  const opportunities: ExternalLinkOpportunity[] = [];
  
  // Authoritative domains by topic
  const authoritativeDomains: Record<string, { domain: string; authority: number; topics: string[] }[]> = {
    laundromat: [
      { domain: "coinlaundry.org", authority: 85, topics: ["industry", "association", "standards"] },
      { domain: "laundrytoday.com", authority: 75, topics: ["news", "trends", "equipment"] },
      { domain: "wikipedia.org", authority: 95, topics: ["general", "reference"] },
    ],
    business: [
      { domain: "sba.gov", authority: 95, topics: ["small business", "loans", "grants"] },
      { domain: "forbes.com", authority: 90, topics: ["business", "finance", "entrepreneurship"] },
      { domain: "entrepreneur.com", authority: 85, topics: ["startups", "management", "marketing"] },
    ],
    equipment: [
      { domain: "alliance-laundry.com", authority: 80, topics: ["washers", "dryers", "commercial"] },
      { domain: "dexter.com", authority: 75, topics: ["equipment", "parts", "service"] },
    ],
  };
  
  // Analyze content to find relevant topics
  const contentLower = content.toLowerCase();
  const relevantDomains: typeof authoritativeDomains[string] = [];
  
  Object.entries(authoritativeDomains).forEach(([category, domains]) => {
    domains.forEach(domain => {
      const isRelevant = domain.topics.some(topic => 
        contentLower.includes(topic.toLowerCase())
      );
      if (isRelevant) {
        relevantDomains.push(domain);
      }
    });
  });
  
  // Generate link opportunities
  relevantDomains.forEach(domain => {
    const anchorText = keywords[0] || "Learn more";
    const relevance = calculateDomainRelevance(content, domain.topics);
    
    opportunities.push({
      anchorText,
      targetUrl: `https://${domain.domain}`,
      domain: domain.domain,
      authorityScore: domain.authority,
      relevance,
      contextSnippet: `Link to ${domain.domain} for additional information`,
      reasoning: `Authoritative source (DA: ${domain.authority})`,
      nofollowRecommended: domain.authority < 70,
    });
  });
  
  return opportunities.sort((a, b) => b.authorityScore - a.authorityScore);
}

/**
 * Calculate domain relevance to content
 */
function calculateDomainRelevance(content: string, topics: string[]): number {
  const contentLower = content.toLowerCase();
  const matchedTopics = topics.filter(topic => 
    contentLower.includes(topic.toLowerCase())
  ).length;
  
  return Math.round((matchedTopics / topics.length) * 100);
}

/**
 * Auto-insert internal links into content
 */
export function insertInternalLinks(
  html: string,
  opportunities: InternalLinkOpportunity[]
): string {
  let modifiedHtml = html;
  
  // Sort opportunities by position (insert from end to avoid offset issues)
  const sorted = [...opportunities].sort((a, b) => b.position - a.position);
  
  sorted.forEach(opp => {
    // Find first occurrence of anchor text
    const regex = new RegExp(`\\b${opp.anchorText}\\b`, "i");
    const match = modifiedHtml.match(regex);
    
    if (match && match.index !== undefined) {
      // Don't link if already inside an <a> tag
      const before = modifiedHtml.substring(0, match.index);
      const afterLastLink = before.lastIndexOf("</a>");
      const afterLastLinkStart = before.lastIndexOf("<a ");
      
      if (afterLastLink > afterLastLinkStart) {
        // Not inside a link tag, safe to insert
        const link = `<a href="${opp.targetUrl}" class="internal-link">${opp.anchorText}</a>`;
        modifiedHtml = modifiedHtml.substring(0, match.index) + 
                      link + 
                      modifiedHtml.substring(match.index + match[0].length);
      }
    }
  });
  
  return modifiedHtml;
}

/**
 * Auto-insert external links into content
 */
export function insertExternalLinks(
  html: string,
  opportunities: ExternalLinkOpportunity[]
): string {
  let modifiedHtml = html;
  
  opportunities.forEach(opp => {
    // Find first occurrence of anchor text
    const regex = new RegExp(`\\b${opp.anchorText}\\b`, "i");
    const match = modifiedHtml.match(regex);
    
    if (match && match.index !== undefined) {
      // Don't link if already inside an <a> tag
      const before = modifiedHtml.substring(0, match.index);
      const afterLastLink = before.lastIndexOf("</a>");
      const afterLastLinkStart = before.lastIndexOf("<a ");
      
      if (afterLastLink > afterLastLinkStart) {
        const rel = opp.nofollowRecommended ? ' rel="nofollow noopener"' : ' rel="noopener"';
        const link = `<a href="${opp.targetUrl}" target="_blank"${rel} class="external-link">${opp.anchorText}</a>`;
        modifiedHtml = modifiedHtml.substring(0, match.index) + 
                      link + 
                      modifiedHtml.substring(match.index + match[0].length);
      }
    }
  });
  
  return modifiedHtml;
}

/**
 * Check for broken links
 */
export async function checkBrokenLinks(urls: string[]): Promise<{
  broken: string[];
  redirects: { from: string; to: string }[];
  valid: string[];
}> {
  const broken: string[] = [];
  const redirects: { from: string; to: string }[] = [];
  const valid: string[] = [];
  
  // Would implement actual HTTP checks here
  // For now, just validate URL format
  urls.forEach(url => {
    try {
      new URL(url);
      valid.push(url);
    } catch {
      broken.push(url);
    }
  });
  
  return { broken, redirects, valid };
}

/**
 * Generate link diversity report
 */
export function analyzeLinkDiversity(pages: PageInfo[]): {
  anchorTextVariety: number; // 0-100
  overOptimized: string[];
  recommendations: string[];
} {
  const anchorTexts = new Map<string, number>();
  
  pages.forEach(page => {
    page.internalLinks.forEach(link => {
      // Would extract actual anchor text from HTML
      const text = link; // Simplified
      anchorTexts.set(text, (anchorTexts.get(text) || 0) + 1);
    });
  });
  
  const totalLinks = Array.from(anchorTexts.values()).reduce((a, b) => a + b, 0);
  const uniqueAnchors = anchorTexts.size;
  
  const variety = totalLinks > 0 ? (uniqueAnchors / totalLinks) * 100 : 0;
  
  // Find over-optimized anchor texts (used > 20% of the time)
  const overOptimized: string[] = [];
  anchorTexts.forEach((count, text) => {
    if (count / totalLinks > 0.2) {
      overOptimized.push(text);
    }
  });
  
  const recommendations: string[] = [];
  if (variety < 30) {
    recommendations.push("Increase anchor text diversity to avoid over-optimization");
  }
  if (overOptimized.length > 0) {
    recommendations.push(`Reduce usage of: ${overOptimized.join(", ")}`);
  }
  if (anchorTexts.size < 10) {
    recommendations.push("Use more varied anchor text for better SEO");
  }
  
  return {
    anchorTextVariety: Math.round(variety),
    overOptimized,
    recommendations,
  };
}
