/**
 * LOCAL CITATION MANAGER
 * 
 * Auto-build and manage local business citations:
 * - NAP consistency checking
 * - Citation building automation
 * - Directory submission tracking
 * - Citation health monitoring
 */

import { db } from "./db";
import { localCitations, InsertLocalCitation, seoProjects } from "@shared/schema";
import { eq, desc, and, sql, like } from "drizzle-orm";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Major citation directories
export const CITATION_DIRECTORIES = [
  // Tier 1 - Critical
  { name: "Google Business Profile", url: "google.com/business", tier: 1, domainAuthority: 100 },
  { name: "Yelp", url: "yelp.com", tier: 1, domainAuthority: 94 },
  { name: "Facebook Business", url: "facebook.com", tier: 1, domainAuthority: 96 },
  { name: "Apple Maps", url: "maps.apple.com", tier: 1, domainAuthority: 100 },
  { name: "Bing Places", url: "bingplaces.com", tier: 1, domainAuthority: 93 },
  
  // Tier 2 - Important
  { name: "Yellow Pages", url: "yellowpages.com", tier: 2, domainAuthority: 91 },
  { name: "BBB", url: "bbb.org", tier: 2, domainAuthority: 91 },
  { name: "Foursquare", url: "foursquare.com", tier: 2, domainAuthority: 92 },
  { name: "MapQuest", url: "mapquest.com", tier: 2, domainAuthority: 89 },
  { name: "Superpages", url: "superpages.com", tier: 2, domainAuthority: 86 },
  { name: "Manta", url: "manta.com", tier: 2, domainAuthority: 83 },
  { name: "Hotfrog", url: "hotfrog.com", tier: 2, domainAuthority: 75 },
  
  // Tier 3 - Supplementary
  { name: "CitySearch", url: "citysearch.com", tier: 3, domainAuthority: 74 },
  { name: "Local.com", url: "local.com", tier: 3, domainAuthority: 73 },
  { name: "MerchantCircle", url: "merchantcircle.com", tier: 3, domainAuthority: 68 },
  { name: "ShowMeLocal", url: "showmelocal.com", tier: 3, domainAuthority: 62 },
  { name: "ChamberOfCommerce", url: "chamberofcommerce.com", tier: 3, domainAuthority: 71 },
  
  // Industry-specific for laundromats
  { name: "Laundry Locator", url: "laundrylocator.com", tier: 2, domainAuthority: 42 },
  { name: "Speed Queen Locator", url: "speedqueen.com/locator", tier: 2, domainAuthority: 55 },
];

export interface BusinessNAP {
  name: string;
  address: string;
  phone: string;
  website?: string;
  hours?: string;
  categories?: string[];
  description?: string;
}

export interface CitationStatus {
  directory: string;
  status: "live" | "pending" | "not_found" | "needs_update" | "claimed" | "unclaimed";
  napMatch: {
    name: boolean;
    address: boolean;
    phone: boolean;
    website: boolean;
  };
  consistencyScore: number;
  lastChecked: Date | null;
  listingUrl?: string;
}

/**
 * Check NAP consistency across citations
 */
export async function checkNapConsistency(
  businessNap: BusinessNAP,
  citations: typeof localCitations.$inferSelect[]
): Promise<{
  overallScore: number;
  issues: Array<{
    directory: string;
    field: string;
    expected: string;
    found: string;
    severity: "critical" | "high" | "medium" | "low";
  }>;
  suggestions: string[];
}> {
  const issues: Array<{
    directory: string;
    field: string;
    expected: string;
    found: string;
    severity: "critical" | "high" | "medium" | "low";
  }> = [];
  
  let totalPoints = 0;
  let earnedPoints = 0;
  
  for (const citation of citations) {
    const weights = { name: 30, address: 30, phone: 30, website: 10 };
    
    // Check name
    totalPoints += weights.name;
    if (citation.businessNameOnSite?.toLowerCase() === businessNap.name.toLowerCase()) {
      earnedPoints += weights.name;
    } else if (citation.businessNameOnSite) {
      issues.push({
        directory: citation.directoryName,
        field: "name",
        expected: businessNap.name,
        found: citation.businessNameOnSite,
        severity: "critical",
      });
    }
    
    // Check address
    totalPoints += weights.address;
    const normalizedExpected = normalizeAddress(businessNap.address);
    const normalizedFound = normalizeAddress(citation.addressOnSite || "");
    if (normalizedExpected === normalizedFound) {
      earnedPoints += weights.address;
    } else if (citation.addressOnSite) {
      issues.push({
        directory: citation.directoryName,
        field: "address",
        expected: businessNap.address,
        found: citation.addressOnSite,
        severity: "high",
      });
    }
    
    // Check phone
    totalPoints += weights.phone;
    const normalizedExpectedPhone = normalizePhone(businessNap.phone);
    const normalizedFoundPhone = normalizePhone(citation.phoneOnSite || "");
    if (normalizedExpectedPhone === normalizedFoundPhone) {
      earnedPoints += weights.phone;
    } else if (citation.phoneOnSite) {
      issues.push({
        directory: citation.directoryName,
        field: "phone",
        expected: businessNap.phone,
        found: citation.phoneOnSite,
        severity: "critical",
      });
    }
    
    // Check website
    if (businessNap.website) {
      totalPoints += weights.website;
      const expectedDomain = extractDomain(businessNap.website);
      const foundDomain = extractDomain(citation.websiteOnSite || "");
      if (expectedDomain === foundDomain) {
        earnedPoints += weights.website;
      } else if (citation.websiteOnSite) {
        issues.push({
          directory: citation.directoryName,
          field: "website",
          expected: businessNap.website,
          found: citation.websiteOnSite,
          severity: "medium",
        });
      }
    }
  }
  
  const overallScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  
  // Generate suggestions
  const suggestions: string[] = [];
  
  if (issues.filter(i => i.field === "phone").length > 0) {
    suggestions.push("Critical: Update phone numbers on inconsistent listings to match your primary number.");
  }
  if (issues.filter(i => i.field === "name").length > 0) {
    suggestions.push("Update business name variations to use consistent formatting.");
  }
  if (issues.filter(i => i.field === "address").length > 0) {
    suggestions.push("Standardize address format across all directories (e.g., 'St.' vs 'Street').");
  }
  if (overallScore < 80) {
    suggestions.push("Consider using a citation management service to maintain consistency.");
  }
  
  return {
    overallScore,
    issues,
    suggestions,
  };
}

/**
 * Normalize address for comparison
 */
function normalizeAddress(address: string): string {
  return address
    .toLowerCase()
    .replace(/\b(street|st\.?)\b/g, "st")
    .replace(/\b(avenue|ave\.?)\b/g, "ave")
    .replace(/\b(road|rd\.?)\b/g, "rd")
    .replace(/\b(drive|dr\.?)\b/g, "dr")
    .replace(/\b(boulevard|blvd\.?)\b/g, "blvd")
    .replace(/\b(suite|ste\.?)\b/g, "ste")
    .replace(/\b(apartment|apt\.?)\b/g, "apt")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalize phone for comparison
 */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.replace("www.", "").toLowerCase();
  } catch {
    return url.toLowerCase().replace("www.", "");
  }
}

/**
 * Get citation recommendations
 */
export async function getCitationRecommendations(
  existingCitations: typeof localCitations.$inferSelect[],
  businessNap: BusinessNAP
): Promise<Array<{
  directory: typeof CITATION_DIRECTORIES[0];
  priority: "high" | "medium" | "low";
  reason: string;
  estimatedImpact: string;
}>> {
  const existingDirectories = new Set(
    existingCitations.map(c => c.directoryName.toLowerCase())
  );
  
  const recommendations = [];
  
  for (const directory of CITATION_DIRECTORIES) {
    if (existingDirectories.has(directory.name.toLowerCase())) continue;
    
    let priority: "high" | "medium" | "low";
    let reason: string;
    let estimatedImpact: string;
    
    switch (directory.tier) {
      case 1:
        priority = "high";
        reason = "Top-tier directory essential for local SEO";
        estimatedImpact = "+5-10% local visibility";
        break;
      case 2:
        priority = "medium";
        reason = "Important secondary directory for broader reach";
        estimatedImpact = "+2-5% local visibility";
        break;
      default:
        priority = "low";
        reason = "Supplementary directory for additional citations";
        estimatedImpact = "+1-2% local visibility";
    }
    
    recommendations.push({
      directory,
      priority,
      reason,
      estimatedImpact,
    });
  }
  
  // Sort by tier then DA
  recommendations.sort((a, b) => {
    if (a.directory.tier !== b.directory.tier) {
      return a.directory.tier - b.directory.tier;
    }
    return b.directory.domainAuthority - a.directory.domainAuthority;
  });
  
  return recommendations;
}

/**
 * Create or update citation record
 */
export async function upsertCitation(
  citation: InsertLocalCitation
): Promise<typeof localCitations.$inferSelect> {
  const existing = await db
    .select()
    .from(localCitations)
    .where(and(
      eq(localCitations.projectId, citation.projectId || ""),
      eq(localCitations.directoryName, citation.directoryName)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    await db
      .update(localCitations)
      .set({
        ...citation,
        updatedAt: new Date(),
      })
      .where(eq(localCitations.id, existing[0].id));
    
    return { ...existing[0], ...citation };
  }
  
  const [inserted] = await db
    .insert(localCitations)
    .values(citation)
    .returning();
  
  return inserted;
}

/**
 * Get citation dashboard
 */
export async function getCitationDashboard(
  projectId?: string,
  userId?: string
): Promise<{
  summary: {
    totalCitations: number;
    liveCitations: number;
    pendingCitations: number;
    citationsNeedingUpdate: number;
    avgConsistencyScore: number;
    tier1Coverage: number;
    tier2Coverage: number;
  };
  citationsByTier: Record<string, typeof localCitations.$inferSelect[]>;
  recentUpdates: typeof localCitations.$inferSelect[];
  napIssues: number;
}> {
  const conditions = [];
  if (projectId) {
    conditions.push(eq(localCitations.projectId, projectId));
  }
  if (userId) {
    conditions.push(eq(localCitations.userId, userId));
  }
  
  let allCitations: typeof localCitations.$inferSelect[];
  
  if (conditions.length > 0) {
    allCitations = await db
      .select()
      .from(localCitations)
      .where(and(...conditions))
      .orderBy(desc(localCitations.updatedAt));
  } else {
    allCitations = await db
      .select()
      .from(localCitations)
      .orderBy(desc(localCitations.updatedAt));
  }
  
  const liveCitations = allCitations.filter(c => c.status === "live");
  const pendingCitations = allCitations.filter(c => c.status === "pending");
  const needsUpdateCitations = allCitations.filter(c => c.status === "needs_update");
  
  const consistencyScores = allCitations
    .filter(c => c.napConsistencyScore !== null)
    .map(c => c.napConsistencyScore as number);
  
  const avgConsistency = consistencyScores.length > 0
    ? Math.round(consistencyScores.reduce((a, b) => a + b, 0) / consistencyScores.length)
    : 0;
  
  // Coverage by tier
  const tier1Dirs = CITATION_DIRECTORIES.filter(d => d.tier === 1).map(d => d.name.toLowerCase());
  const tier2Dirs = CITATION_DIRECTORIES.filter(d => d.tier === 2).map(d => d.name.toLowerCase());
  
  const citedDirs = new Set(allCitations.map(c => c.directoryName.toLowerCase()));
  
  const tier1Coverage = tier1Dirs.filter(d => citedDirs.has(d)).length / tier1Dirs.length * 100;
  const tier2Coverage = tier2Dirs.filter(d => citedDirs.has(d)).length / tier2Dirs.length * 100;
  
  // Group by tier
  const citationsByTier: Record<string, typeof localCitations.$inferSelect[]> = {
    "1": [],
    "2": [],
    "3": [],
    "unknown": [],
  };
  
  for (const citation of allCitations) {
    const dir = CITATION_DIRECTORIES.find(
      d => d.name.toLowerCase() === citation.directoryName.toLowerCase()
    );
    const tier = dir?.tier?.toString() || "unknown";
    citationsByTier[tier].push(citation);
  }
  
  // NAP issues count
  const napIssues = allCitations.filter(
    c => !c.napMatch || !(c.napMatch as any).name || !(c.napMatch as any).address || !(c.napMatch as any).phone
  ).length;
  
  return {
    summary: {
      totalCitations: allCitations.length,
      liveCitations: liveCitations.length,
      pendingCitations: pendingCitations.length,
      citationsNeedingUpdate: needsUpdateCitations.length,
      avgConsistencyScore: avgConsistency,
      tier1Coverage: Math.round(tier1Coverage),
      tier2Coverage: Math.round(tier2Coverage),
    },
    citationsByTier,
    recentUpdates: allCitations.slice(0, 10),
    napIssues,
  };
}

/**
 * Generate AI-optimized business description
 */
export async function generateBusinessDescription(
  businessNap: BusinessNAP,
  maxLength: number = 750
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Generate a professional, SEO-optimized business description for local directory listings. Include relevant keywords naturally.",
        },
        {
          role: "user",
          content: `Generate a business description for:
Name: ${businessNap.name}
Address: ${businessNap.address}
Categories: ${businessNap.categories?.join(", ") || "Business"}
Current Description: ${businessNap.description || "None"}

Max length: ${maxLength} characters. Make it engaging and include a call-to-action.`,
        },
      ],
      max_tokens: 500,
    });
    
    return response.choices[0]?.message?.content?.substring(0, maxLength) || "";
  } catch (error) {
    console.error("Failed to generate description:", error);
    return businessNap.description || "";
  }
}

export default {
  CITATION_DIRECTORIES,
  checkNapConsistency,
  getCitationRecommendations,
  upsertCitation,
  getCitationDashboard,
  generateBusinessDescription,
};
