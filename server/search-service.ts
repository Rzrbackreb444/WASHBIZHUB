import { db } from "./db";
import { searchIndex, searchAnalytics, blogPosts, listings, courses, resources } from "@shared/schema";
import { eq, sql, and, or, desc, asc, ilike, inArray } from "drizzle-orm";
import type { InsertSearchIndex, SearchIndex } from "@shared/schema";

export interface SearchQuery {
  query: string;
  filters?: {
    entityTypes?: string[];
    categories?: string[];
  };
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  id: string;
  entityType: string;
  title: string;
  description: string | null;
  url: string;
  category: string | null;
  relevanceScore: number;
  highlights: {
    title?: string;
    description?: string;
    content?: string;
  };
  metadata?: Record<string, any>;
  imageUrl?: string | null;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  query: string;
  searchTimeMs: number;
  filters: SearchQuery["filters"];
}

const ENTITY_TYPE_WEIGHTS: Record<string, number> = {
  page: 10,
  calculator: 9,
  resource: 8,
  article: 7,
  listing: 6,
  course: 6,
  blog: 5,
  vendor: 4,
};

function highlightText(text: string | null, query: string): string {
  if (!text) return "";
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  if (words.length === 0) return text.slice(0, 200);
  
  let result = text;
  for (const word of words) {
    const regex = new RegExp(`(${word})`, "gi");
    result = result.replace(regex, "<mark>$1</mark>");
  }
  
  const firstMatchIndex = result.toLowerCase().indexOf("<mark>");
  if (firstMatchIndex > 100) {
    const start = Math.max(0, firstMatchIndex - 50);
    result = "..." + result.slice(start);
  }
  
  if (result.length > 300) {
    result = result.slice(0, 300) + "...";
  }
  
  return result;
}

function calculateRelevanceScore(
  item: SearchIndex,
  query: string,
  tsRank: number
): number {
  const queryLower = query.toLowerCase();
  const words = queryLower.split(/\s+/).filter(w => w.length > 2);
  
  let score = tsRank * 100;
  
  const titleLower = item.title?.toLowerCase() || "";
  if (titleLower === queryLower) {
    score += 50;
  } else if (titleLower.includes(queryLower)) {
    score += 30;
  } else {
    for (const word of words) {
      if (titleLower.includes(word)) {
        score += 10;
      }
    }
  }
  
  const keywords = item.keywords || [];
  for (const keyword of keywords) {
    if (keyword.toLowerCase().includes(queryLower)) {
      score += 15;
    }
    for (const word of words) {
      if (keyword.toLowerCase().includes(word)) {
        score += 5;
      }
    }
  }
  
  const typeWeight = ENTITY_TYPE_WEIGHTS[item.entityType] || 5;
  score += typeWeight;
  
  score += (item.searchRank || 0) * 2;
  
  score += Math.min((item.popularity || 0) * 0.1, 10);
  
  return Math.round(score * 100) / 100;
}

export async function performSearch(searchQuery: SearchQuery): Promise<SearchResponse> {
  const startTime = Date.now();
  const { query, filters, limit = 20, offset = 0 } = searchQuery;
  
  if (!query || query.trim().length === 0) {
    return {
      results: [],
      totalCount: 0,
      query: "",
      searchTimeMs: 0,
      filters,
    };
  }
  
  const sanitizedQuery = query.replace(/[^\w\s'-]/g, " ").trim();
  const tsQuery = sanitizedQuery.split(/\s+/).filter(w => w.length > 1).join(" | ");
  
  try {
    const conditions: any[] = [eq(searchIndex.isActive, true)];
    
    if (filters?.entityTypes && filters.entityTypes.length > 0) {
      conditions.push(inArray(searchIndex.entityType, filters.entityTypes));
    }
    
    if (filters?.categories && filters.categories.length > 0) {
      conditions.push(inArray(searchIndex.category, filters.categories));
    }
    
    const searchResults = await db.execute(sql`
      WITH ranked_results AS (
        SELECT 
          *,
          ts_rank(
            setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
            setweight(to_tsvector('english', COALESCE(searchable_content, '')), 'C') ||
            setweight(to_tsvector('english', COALESCE(array_to_string(keywords, ' '), '')), 'B'),
            plainto_tsquery('english', ${sanitizedQuery})
          ) AS ts_rank_score,
          CASE 
            WHEN LOWER(title) = LOWER(${sanitizedQuery}) THEN 100
            WHEN LOWER(title) LIKE LOWER(${`%${sanitizedQuery}%`}) THEN 50
            ELSE 0
          END AS title_match_score
        FROM search_index
        WHERE is_active = true
          ${filters?.entityTypes && filters.entityTypes.length > 0 
            ? sql`AND entity_type = ANY(${filters.entityTypes})` 
            : sql``}
          ${filters?.categories && filters.categories.length > 0 
            ? sql`AND category = ANY(${filters.categories})` 
            : sql``}
          AND (
            to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(searchable_content, '') || ' ' || COALESCE(array_to_string(keywords, ' '), ''))
            @@ plainto_tsquery('english', ${sanitizedQuery})
            OR LOWER(title) LIKE LOWER(${`%${sanitizedQuery}%`})
            OR LOWER(description) LIKE LOWER(${`%${sanitizedQuery}%`})
          )
      )
      SELECT 
        id,
        entity_type,
        content_id,
        url,
        title,
        description,
        keywords,
        searchable_content,
        category,
        search_rank,
        popularity,
        image_url,
        metadata,
        ts_rank_score,
        title_match_score,
        (ts_rank_score * 100 + title_match_score + COALESCE(search_rank, 0) * 2 + LEAST(COALESCE(popularity, 0) * 0.1, 10)) AS combined_score
      FROM ranked_results
      ORDER BY combined_score DESC, ts_rank_score DESC, popularity DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `);
    
    const countResult = await db.execute(sql`
      SELECT COUNT(*) as total
      FROM search_index
      WHERE is_active = true
        ${filters?.entityTypes && filters.entityTypes.length > 0 
          ? sql`AND entity_type = ANY(${filters.entityTypes})` 
          : sql``}
        ${filters?.categories && filters.categories.length > 0 
          ? sql`AND category = ANY(${filters.categories})` 
          : sql``}
        AND (
          to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(searchable_content, '') || ' ' || COALESCE(array_to_string(keywords, ' '), ''))
          @@ plainto_tsquery('english', ${sanitizedQuery})
          OR LOWER(title) LIKE LOWER(${`%${sanitizedQuery}%`})
          OR LOWER(description) LIKE LOWER(${`%${sanitizedQuery}%`})
        )
    `);
    
    const totalCount = Number((countResult.rows[0] as any)?.total || 0);
    
    const results: SearchResult[] = (searchResults.rows as any[]).map((row) => ({
      id: row.id,
      entityType: row.entity_type,
      title: row.title,
      description: row.description,
      url: row.url,
      category: row.category,
      relevanceScore: Number(row.combined_score || 0),
      highlights: {
        title: highlightText(row.title, query),
        description: highlightText(row.description, query),
        content: highlightText(row.searchable_content, query),
      },
      metadata: row.metadata,
      imageUrl: row.image_url,
    }));
    
    const searchTimeMs = Date.now() - startTime;
    
    return {
      results,
      totalCount,
      query,
      searchTimeMs,
      filters,
    };
  } catch (error) {
    console.error("Search error:", error);
    
    const fallbackResults = await db
      .select()
      .from(searchIndex)
      .where(
        and(
          eq(searchIndex.isActive, true),
          or(
            ilike(searchIndex.title, `%${sanitizedQuery}%`),
            ilike(searchIndex.description, `%${sanitizedQuery}%`)
          )
        )
      )
      .orderBy(desc(searchIndex.searchRank), desc(searchIndex.popularity))
      .limit(limit)
      .offset(offset);
    
    const results: SearchResult[] = fallbackResults.map((item) => ({
      id: item.id,
      entityType: item.entityType,
      title: item.title,
      description: item.description,
      url: item.url,
      category: item.category,
      relevanceScore: calculateRelevanceScore(item, query, 0.5),
      highlights: {
        title: highlightText(item.title, query),
        description: highlightText(item.description, query),
        content: highlightText(item.searchableContent, query),
      },
      metadata: item.metadata as Record<string, any> | undefined,
      imageUrl: item.imageUrl,
    }));
    
    return {
      results,
      totalCount: results.length,
      query,
      searchTimeMs: Date.now() - startTime,
      filters,
    };
  }
}

export async function trackSearchAnalytics(
  query: string,
  resultsCount: number,
  userId?: string,
  sessionId?: string,
  clickedResultId?: string,
  clickPosition?: number
): Promise<void> {
  try {
    await db.insert(searchAnalytics).values({
      query,
      resultsCount,
      userId: userId || null,
      sessionId: sessionId || null,
      clickedResult: clickedResultId,
      clickPosition,
    });
  } catch (error) {
    console.error("Failed to track search analytics:", error);
  }
}

export async function incrementPopularity(searchIndexId: string): Promise<void> {
  try {
    await db
      .update(searchIndex)
      .set({
        popularity: sql`COALESCE(popularity, 0) + 1`,
        updatedAt: new Date(),
      })
      .where(eq(searchIndex.id, searchIndexId));
  } catch (error) {
    console.error("Failed to increment popularity:", error);
  }
}

export async function getPopularSearchTerms(limit: number = 20): Promise<{ query: string; count: number }[]> {
  try {
    const results = await db.execute(sql`
      SELECT query, COUNT(*) as count
      FROM search_analytics
      WHERE searched_at > NOW() - INTERVAL '30 days'
      GROUP BY query
      ORDER BY count DESC
      LIMIT ${limit}
    `);
    
    return (results.rows as any[]).map((row) => ({
      query: row.query,
      count: Number(row.count),
    }));
  } catch (error) {
    console.error("Failed to get popular search terms:", error);
    return [];
  }
}

const STATIC_PAGES_DATA = [
  { url: "/", title: "WashBizHub - #1 Laundromat Business Intelligence Platform", description: "The ultimate platform for laundromat owners, investors, and operators. CLEANBI scoring, calculators, marketplace, and educational resources.", category: "Home", keywords: ["laundromat", "business", "intelligence", "CLEANBI", "marketplace", "calculators"] },
  { url: "/pricing", title: "WashBizHub Pricing Plans", description: "Choose the perfect plan for your laundromat business. Free, Starter, Pro, and Enterprise tiers with CLEANBI analyses, calculators, and more.", category: "Pricing", keywords: ["pricing", "plans", "subscription", "pro", "enterprise", "free"] },
  { url: "/cleanbi-auto", title: "CLEANBI Auto - Location Intelligence Scoring", description: "Score any address with our proprietary 17-factor algorithm. Get instant insights on demographics, competition, and business potential.", category: "CLEANBI", keywords: ["cleanbi", "location", "scoring", "intelligence", "demographics", "competition"] },
  { url: "/cleanbi-explorer", title: "CLEANBI Explorer - Map-Based Analysis", description: "Explore laundromat opportunities on an interactive map. Visualize demographics, competition, and scores across any area.", category: "CLEANBI", keywords: ["cleanbi", "explorer", "map", "analysis", "visualization"] },
  { url: "/cleanbi-reports", title: "CLEANBI Premium Reports", description: "Detailed PDF reports with comprehensive location analysis, competitor mapping, demographic data, and AI recommendations.", category: "CLEANBI", keywords: ["cleanbi", "reports", "pdf", "analysis", "recommendations"] },
  { url: "/about-us", title: "About WashBizHub - Our Mission", description: "Learn about WashBizHub's mission to empower laundromat entrepreneurs with data-driven tools and industry expertise.", category: "Company", keywords: ["about", "mission", "team", "company", "laundromat"] },
  { url: "/why-washbizhub", title: "Why Choose WashBizHub", description: "Discover why thousands of laundromat owners trust WashBizHub for business intelligence, valuations, and growth strategies.", category: "Company", keywords: ["why", "features", "benefits", "trust", "platform"] },
  { url: "/help-center", title: "Help Center - Support & FAQs", description: "Get answers to frequently asked questions about CLEANBI, calculators, subscriptions, and using WashBizHub.", category: "Support", keywords: ["help", "support", "faq", "questions", "answers", "guide"] },
  { url: "/blog", title: "WashBizHub Blog - Industry Insights", description: "Expert articles on laundromat operations, marketing, valuations, and industry trends. Stay informed with our latest insights.", category: "Content", keywords: ["blog", "articles", "insights", "news", "industry", "trends"] },
  { url: "/courses", title: "WashBizHub Academy - Courses", description: "Learn laundromat business skills with our comprehensive courses. From beginner guides to advanced strategies.", category: "Education", keywords: ["courses", "academy", "learning", "education", "training"] },
  { url: "/forum", title: "WashBizHub Community Forum", description: "Connect with fellow laundromat owners and operators. Share experiences, ask questions, and get advice.", category: "Community", keywords: ["forum", "community", "discussion", "network", "owners"] },
  { url: "/laundromat-listings", title: "Laundromats for Sale - Marketplace", description: "Browse laundromats for sale across the US. Each listing includes CLEANBI scores and detailed financials.", category: "Marketplace", keywords: ["listings", "sale", "marketplace", "buy", "sell", "laundromats"] },
  { url: "/equipment-marketplace", title: "Equipment Marketplace", description: "Buy and sell commercial laundry equipment. New and used washers, dryers, and accessories.", category: "Marketplace", keywords: ["equipment", "washers", "dryers", "commercial", "buy", "sell"] },
  { url: "/directory", title: "Vendor Directory", description: "Find trusted vendors, distributors, and service providers for your laundromat business.", category: "Directory", keywords: ["vendors", "directory", "suppliers", "services", "distributors"] },
  { url: "/funding", title: "Laundromat Funding Hub - 7 Lending Partners", description: "Compare 7 trusted lending partners for laundromat financing. SBA loans, equipment financing, startup funding, commercial real estate, and fast capital.", category: "Funding", keywords: ["funding", "financing", "loans", "sba", "capital", "investment", "lenders", "equipment financing", "startup funding", "commercial real estate"] },
  { url: "/funding-matcher", title: "Funding Matcher - Finance Options", description: "Find the right financing for your laundromat. Compare SBA loans, equipment financing, and investors.", category: "Funding", keywords: ["funding", "financing", "loans", "sba", "capital", "investment"] },
  { url: "/startup-funding", title: "Startup Funding - No Business History Required", description: "Get startup funding for your first laundromat. Preferred Funding Group and GoKapital offer personal credit-based financing with no business revenue required.", category: "Funding", keywords: ["startup", "funding", "new business", "financing", "capital", "personal credit", "first laundromat", "no experience"] },
  { url: "/sba-readiness", title: "SBA Readiness Assessment", description: "Check if you're ready for an SBA loan. Our assessment helps you understand requirements and improve approval chances.", category: "Funding", keywords: ["sba", "loan", "readiness", "assessment", "approval"] },
  { url: "/gokapital", title: "GoKapital - Commercial Real Estate Financing", description: "Premier commercial real estate lender for laundromat properties. Up to 80% LTV, fast 7-14 day approvals, $100K to $50M financing.", category: "Funding", keywords: ["gokapital", "commercial real estate", "property financing", "bridge loan", "investment property", "ltv", "dscr"] },
  { url: "/equipment-financing", title: "Equipment Financing - Same Day Approval", description: "Finance washers, dryers, and laundry systems. ROK Financial and South End Capital offer same-day to 48-hour equipment loans.", category: "Funding", keywords: ["equipment financing", "washers", "dryers", "equipment loan", "same day funding", "rok financial"] },
  { url: "/acquisitions-funding", title: "Acquisition & SBA Loans", description: "Buy an existing laundromat with SBA 7(a) loans. 10-25 year terms, low down payments, best rates through South End Capital and National Business Capital.", category: "Funding", keywords: ["acquisition", "sba loan", "sba 7a", "buy laundromat", "business acquisition", "south end capital"] },
  { url: "/working-capital-financing", title: "Fast Capital & Merchant Cash Advance", description: "Same-day working capital and MCA funding. Advance Funds Network and David Allen Capital offer emergency financing with no minimum credit.", category: "Funding", keywords: ["working capital", "merchant cash advance", "mca", "fast cash", "emergency funding", "revenue based", "same day funding"] },
  { url: "/real-estate-financing", title: "Commercial Real Estate Loans", description: "Purchase or refinance laundromat property. GoKapital and ROK Financial offer competitive rates on commercial real estate.", category: "Funding", keywords: ["commercial real estate", "property loan", "refinance", "purchase property", "cre loan", "investment property"] },
  { url: "/business-plan-generator", title: "Business Plan Generator", description: "Create a professional laundromat business plan. Perfect for SBA loans, investors, and strategic planning.", category: "Tools", keywords: ["business plan", "generator", "sba", "investors", "planning"] },
  { url: "/design-studio", title: "Design Studio - Layout Planner", description: "Plan your laundromat layout in 2D. Optimize equipment placement and workflow.", category: "Tools", keywords: ["design", "layout", "planner", "equipment", "floor plan"] },
  { url: "/design-studio-pro", title: "Design Studio Pro - 3D Visualization", description: "Create stunning 3D visualizations of your laundromat. See your design come to life before building.", category: "Tools", keywords: ["design", "3d", "visualization", "layout", "professional"] },
  { url: "/service-guy-ai", title: "Service Guy AI - Equipment Diagnostics", description: "AI-powered equipment troubleshooting. Get instant help with error codes and maintenance issues.", category: "Tools", keywords: ["service", "ai", "diagnostics", "equipment", "troubleshooting", "error codes"] },
  { url: "/referral-program", title: "Referral Program", description: "Earn money by referring friends to WashBizHub. Get recurring commissions on paid subscriptions.", category: "Program", keywords: ["referral", "affiliate", "earn", "commission", "rewards"] },
  { url: "/products", title: "WashBizHub Products", description: "Explore all WashBizHub products and services. From analytics to marketplace to education.", category: "Products", keywords: ["products", "services", "features", "tools"] },
];

const CALCULATORS_DATA = [
  { url: "/calculators", title: "Business Calculators Suite", description: "50+ professional calculators for laundromat valuation, ROI, utilities, labor, and more. Make data-driven decisions.", category: "Calculators", keywords: ["calculators", "suite", "business", "analysis", "tools"] },
  { url: "/calculators-suite", title: "Advanced Calculator Suite", description: "Access all WashBizHub calculators in one place. Professional-grade tools for serious operators.", category: "Calculators", keywords: ["calculators", "advanced", "professional", "suite"] },
  { url: "/valuation-calculator", title: "Laundromat Valuation Calculator", description: "Calculate laundromat value using 6 different methods: SDE Multiple, NOI Multiple, Asset-Based, and more.", category: "Calculators", keywords: ["valuation", "calculator", "sde", "noi", "value", "worth", "price"] },
  { url: "/roi-calculator", title: "ROI Calculator", description: "Calculate return on investment for laundromat purchases. Analyze cash flow, payback period, and returns.", category: "Calculators", keywords: ["roi", "return", "investment", "calculator", "analysis"] },
  { url: "/roi-calculator-advanced", title: "Advanced ROI Calculator", description: "Detailed ROI analysis with scenario modeling. Compare different purchase scenarios and financing options.", category: "Calculators", keywords: ["roi", "advanced", "scenarios", "analysis", "modeling"] },
  { url: "/utility-calculator", title: "Utility Cost Calculator", description: "Estimate water, electricity, and gas costs. Optimize utility usage and reduce operating expenses.", category: "Calculators", keywords: ["utility", "water", "electricity", "gas", "costs", "expenses"] },
  { url: "/labor-calculator", title: "Labor Cost Calculator", description: "Calculate staffing costs and optimize scheduling. Understand true labor expenses for your laundromat.", category: "Calculators", keywords: ["labor", "staffing", "wages", "costs", "scheduling", "employees"] },
  { url: "/loan-calculator", title: "Loan Payment Calculator", description: "Calculate monthly payments, interest, and amortization for equipment and business loans.", category: "Calculators", keywords: ["loan", "payment", "interest", "amortization", "financing"] },
  { url: "/tpd-calculator", title: "Turns Per Day (TPD) Calculator", description: "Calculate and optimize your turns per day. Improve equipment utilization and revenue per machine.", category: "Calculators", keywords: ["tpd", "turns", "utilization", "efficiency", "revenue", "machines"] },
];

const HELP_CENTER_ARTICLES = [
  { url: "/help-center#cleanbi", title: "CLEANBI Scoring - How It Works", description: "Learn about our proprietary 17-factor scoring algorithm. Understand grades, factors, and how to use scores for decision-making.", category: "CLEANBI", keywords: ["cleanbi", "scoring", "algorithm", "grades", "factors", "help"] },
  { url: "/help-center#calculators", title: "Calculator Guide - All Tools Explained", description: "Complete guide to using WashBizHub calculators. From valuations to utilities to labor cost analysis.", category: "Calculators", keywords: ["calculators", "guide", "tutorial", "how to", "help"] },
  { url: "/help-center#subscriptions", title: "Subscription Plans & Billing", description: "Information about subscription tiers, pricing, billing, cancellation, and refunds.", category: "Account", keywords: ["subscription", "billing", "pricing", "cancel", "refund", "plans"] },
  { url: "/help-center#marketplace", title: "Marketplace & Listings Guide", description: "How to list your laundromat for sale, browse listings, and connect with buyers or sellers.", category: "Marketplace", keywords: ["marketplace", "listings", "buy", "sell", "guide"] },
  { url: "/help-center#account", title: "Account & Profile Management", description: "Manage your WashBizHub account, update profile, referral program, and preferences.", category: "Account", keywords: ["account", "profile", "settings", "referral", "preferences"] },
];

export async function reindexAllContent(): Promise<{ success: boolean; indexed: number; errors: string[] }> {
  const errors: string[] = [];
  let indexed = 0;
  
  try {
    await db.delete(searchIndex).where(
      inArray(searchIndex.entityType, ["page", "calculator", "article"])
    );
    
    for (const page of STATIC_PAGES_DATA) {
      try {
        await db.insert(searchIndex).values({
          entityType: "page",
          url: page.url,
          title: page.title,
          description: page.description,
          keywords: page.keywords,
          searchableContent: `${page.title} ${page.description} ${page.keywords.join(" ")}`,
          category: page.category,
          searchRank: 8,
          isActive: true,
        }).onConflictDoUpdate({
          target: searchIndex.url,
          set: {
            title: page.title,
            description: page.description,
            keywords: page.keywords,
            searchableContent: `${page.title} ${page.description} ${page.keywords.join(" ")}`,
            category: page.category,
            updatedAt: new Date(),
          },
        });
        indexed++;
      } catch (err: any) {
        errors.push(`Page ${page.url}: ${err.message}`);
      }
    }
    
    for (const calc of CALCULATORS_DATA) {
      try {
        await db.insert(searchIndex).values({
          entityType: "calculator",
          url: calc.url,
          title: calc.title,
          description: calc.description,
          keywords: calc.keywords,
          searchableContent: `${calc.title} ${calc.description} ${calc.keywords.join(" ")}`,
          category: calc.category,
          searchRank: 9,
          isActive: true,
        }).onConflictDoUpdate({
          target: searchIndex.url,
          set: {
            title: calc.title,
            description: calc.description,
            keywords: calc.keywords,
            searchableContent: `${calc.title} ${calc.description} ${calc.keywords.join(" ")}`,
            category: calc.category,
            updatedAt: new Date(),
          },
        });
        indexed++;
      } catch (err: any) {
        errors.push(`Calculator ${calc.url}: ${err.message}`);
      }
    }
    
    for (const article of HELP_CENTER_ARTICLES) {
      try {
        await db.insert(searchIndex).values({
          entityType: "article",
          url: article.url,
          title: article.title,
          description: article.description,
          keywords: article.keywords,
          searchableContent: `${article.title} ${article.description} ${article.keywords.join(" ")}`,
          category: article.category,
          searchRank: 7,
          isActive: true,
        }).onConflictDoUpdate({
          target: searchIndex.url,
          set: {
            title: article.title,
            description: article.description,
            keywords: article.keywords,
            searchableContent: `${article.title} ${article.description} ${article.keywords.join(" ")}`,
            category: article.category,
            updatedAt: new Date(),
          },
        });
        indexed++;
      } catch (err: any) {
        errors.push(`Article ${article.url}: ${err.message}`);
      }
    }
    
    try {
      const blogs = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.status, "published"))
        .limit(500);
      
      for (const blog of blogs) {
        try {
          const content = typeof blog.content === 'string' ? blog.content : '';
          const tags = blog.tags || [];
          
          await db.insert(searchIndex).values({
            entityType: "blog",
            contentId: blog.id,
            url: `/blog/${blog.slug}`,
            title: blog.title,
            description: blog.excerpt || blog.metaDescription || content.slice(0, 200),
            keywords: tags,
            searchableContent: `${blog.title} ${blog.excerpt || ""} ${content.slice(0, 1000)} ${tags.join(" ")}`,
            category: blog.category || "Blog",
            imageUrl: blog.featuredImage,
            searchRank: 5,
            isActive: true,
          }).onConflictDoUpdate({
            target: searchIndex.url,
            set: {
              title: blog.title,
              description: blog.excerpt || blog.metaDescription || content.slice(0, 200),
              keywords: tags,
              searchableContent: `${blog.title} ${blog.excerpt || ""} ${content.slice(0, 1000)} ${tags.join(" ")}`,
              updatedAt: new Date(),
            },
          });
          indexed++;
        } catch (err: any) {
          errors.push(`Blog ${blog.slug}: ${err.message}`);
        }
      }
    } catch (err: any) {
      errors.push(`Blog indexing: ${err.message}`);
    }
    
    try {
      const activeListings = await db
        .select()
        .from(listings)
        .where(eq(listings.status, "active"))
        .limit(500);
      
      for (const listing of activeListings) {
        try {
          const features = listing.features || [];
          
          await db.insert(searchIndex).values({
            entityType: "listing",
            contentId: listing.id,
            url: `/laundromat-listings/${listing.id}`,
            title: listing.title,
            description: listing.description || "",
            keywords: [...features, listing.city || "", listing.state || ""].filter(Boolean),
            searchableContent: `${listing.title} ${listing.description || ""} ${listing.city} ${listing.state} ${features.join(" ")}`,
            category: listing.listingType || "Laundromat",
            imageUrl: listing.primaryImage,
            price: listing.askingPrice,
            searchRank: 6,
            metadata: { city: listing.city, state: listing.state },
            isActive: true,
          }).onConflictDoUpdate({
            target: searchIndex.url,
            set: {
              title: listing.title,
              description: listing.description,
              keywords: [...features, listing.city || "", listing.state || ""].filter(Boolean),
              searchableContent: `${listing.title} ${listing.description || ""} ${listing.city} ${listing.state} ${features.join(" ")}`,
              price: listing.askingPrice,
              updatedAt: new Date(),
            },
          });
          indexed++;
        } catch (err: any) {
          errors.push(`Listing ${listing.id}: ${err.message}`);
        }
      }
    } catch (err: any) {
      errors.push(`Listing indexing: ${err.message}`);
    }
    
    try {
      const publishedCourses = await db
        .select()
        .from(courses)
        .where(eq(courses.isPublished, true))
        .limit(100);
      
      for (const course of publishedCourses) {
        try {
          await db.insert(searchIndex).values({
            entityType: "course",
            contentId: course.id,
            url: `/courses/${course.id}`,
            title: course.title,
            description: course.description || "",
            keywords: (course.tags || []) as string[],
            searchableContent: `${course.title} ${course.description || ""} ${((course.tags || []) as string[]).join(" ")}`,
            category: course.category || "Courses",
            imageUrl: course.thumbnail,
            price: course.price,
            searchRank: 6,
            isActive: true,
          }).onConflictDoUpdate({
            target: searchIndex.url,
            set: {
              title: course.title,
              description: course.description,
              keywords: (course.tags || []) as string[],
              searchableContent: `${course.title} ${course.description || ""} ${((course.tags || []) as string[]).join(" ")}`,
              price: course.price,
              updatedAt: new Date(),
            },
          });
          indexed++;
        } catch (err: any) {
          errors.push(`Course ${course.id}: ${err.message}`);
        }
      }
    } catch (err: any) {
      errors.push(`Course indexing: ${err.message}`);
    }
    
    try {
      const activeResources = await db
        .select()
        .from(resources)
        .where(eq(resources.isPublished, true))
        .limit(200);
      
      for (const resource of activeResources) {
        try {
          await db.insert(searchIndex).values({
            entityType: "resource",
            contentId: resource.id,
            url: `/resources/${resource.slug}`,
            title: resource.title,
            description: resource.description || "",
            keywords: (resource.tags || []) as string[],
            searchableContent: `${resource.title} ${resource.description || ""} ${resource.content || ""} ${((resource.tags || []) as string[]).join(" ")}`,
            category: resource.category || "Resources",
            imageUrl: resource.featuredImage,
            searchRank: 8,
            isActive: true,
          }).onConflictDoUpdate({
            target: searchIndex.url,
            set: {
              title: resource.title,
              description: resource.description,
              keywords: (resource.tags || []) as string[],
              searchableContent: `${resource.title} ${resource.description || ""} ${resource.content || ""} ${((resource.tags || []) as string[]).join(" ")}`,
              updatedAt: new Date(),
            },
          });
          indexed++;
        } catch (err: any) {
          errors.push(`Resource ${resource.slug}: ${err.message}`);
        }
      }
    } catch (err: any) {
      errors.push(`Resource indexing: ${err.message}`);
    }
    
    console.log(`✅ Search index reindexed: ${indexed} items, ${errors.length} errors`);
    
    return { success: errors.length === 0, indexed, errors };
  } catch (error: any) {
    console.error("Reindexing failed:", error);
    return { success: false, indexed, errors: [...errors, error.message] };
  }
}

export async function getSearchIndexStats(): Promise<{
  totalItems: number;
  byEntityType: Record<string, number>;
  lastUpdated: Date | null;
}> {
  try {
    const stats = await db.execute(sql`
      SELECT 
        entity_type,
        COUNT(*) as count,
        MAX(updated_at) as last_updated
      FROM search_index
      WHERE is_active = true
      GROUP BY entity_type
    `);
    
    const byEntityType: Record<string, number> = {};
    let totalItems = 0;
    let lastUpdated: Date | null = null;
    
    for (const row of stats.rows as any[]) {
      byEntityType[row.entity_type] = Number(row.count);
      totalItems += Number(row.count);
      if (row.last_updated && (!lastUpdated || new Date(row.last_updated) > lastUpdated)) {
        lastUpdated = new Date(row.last_updated);
      }
    }
    
    return { totalItems, byEntityType, lastUpdated };
  } catch (error) {
    console.error("Failed to get search index stats:", error);
    return { totalItems: 0, byEntityType: {}, lastUpdated: null };
  }
}

export async function initializeSearchIndex(): Promise<void> {
  try {
    const stats = await getSearchIndexStats();
    
    if (stats.totalItems === 0) {
      console.log("🔍 Search index is empty, populating initial content...");
      const result = await reindexAllContent();
      console.log(`✅ Search index initialized: ${result.indexed} items indexed`);
      if (result.errors.length > 0) {
        console.warn(`⚠️ ${result.errors.length} errors during indexing`);
      }
    } else {
      console.log(`✅ Search index ready: ${stats.totalItems} items indexed`);
    }
  } catch (error) {
    console.error("Failed to initialize search index:", error);
  }
}
