/**
 * PREFERRED FUNDING GROUP BLOG GENERATOR
 * 
 * Generates 50 SEO/AEO-optimized blog posts for startup funding
 * utilizing personal credit across all 50 US states.
 * 
 * Call-to-Action Button: https://preferredfundinggroup.wufoo.com/forms/z84eu6p0dp3x12/
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "./db";
import { blogPosts } from "@shared/schema";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// All 50 US States
const STATES = [
  { name: "Alabama", code: "AL", keywords: ["startup funding alabama", "personal credit business loans AL", "startup capital alabama"] },
  { name: "Alaska", code: "AK", keywords: ["startup funding alaska", "personal credit startup loans AK", "business startup capital alaska"] },
  { name: "Arizona", code: "AZ", keywords: ["startup funding arizona", "personal credit business funding AZ", "startup loans arizona"] },
  { name: "Arkansas", code: "AR", keywords: ["startup funding arkansas", "personal credit startup funding AR", "business loans arkansas"] },
  { name: "California", code: "CA", keywords: ["startup funding california", "personal credit business loans CA", "startup capital california"] },
  { name: "Colorado", code: "CO", keywords: ["startup funding colorado", "personal credit startup loans CO", "business startup funding colorado"] },
  { name: "Connecticut", code: "CT", keywords: ["startup funding connecticut", "personal credit business capital CT", "startup loans connecticut"] },
  { name: "Delaware", code: "DE", keywords: ["startup funding delaware", "personal credit startup funding DE", "business capital delaware"] },
  { name: "Florida", code: "FL", keywords: ["startup funding florida", "personal credit business loans FL", "startup capital florida"] },
  { name: "Georgia", code: "GA", keywords: ["startup funding georgia", "personal credit startup loans GA", "business funding georgia"] },
  { name: "Hawaii", code: "HI", keywords: ["startup funding hawaii", "personal credit business capital HI", "startup loans hawaii"] },
  { name: "Idaho", code: "ID", keywords: ["startup funding idaho", "personal credit startup funding ID", "business loans idaho"] },
  { name: "Illinois", code: "IL", keywords: ["startup funding illinois", "personal credit business loans IL", "startup capital illinois"] },
  { name: "Indiana", code: "IN", keywords: ["startup funding indiana", "personal credit startup loans IN", "business funding indiana"] },
  { name: "Iowa", code: "IA", keywords: ["startup funding iowa", "personal credit business capital IA", "startup loans iowa"] },
  { name: "Kansas", code: "KS", keywords: ["startup funding kansas", "personal credit startup funding KS", "business capital kansas"] },
  { name: "Kentucky", code: "KY", keywords: ["startup funding kentucky", "personal credit business loans KY", "startup funding kentucky"] },
  { name: "Louisiana", code: "LA", keywords: ["startup funding louisiana", "personal credit startup loans LA", "business capital louisiana"] },
  { name: "Maine", code: "ME", keywords: ["startup funding maine", "personal credit business funding ME", "startup loans maine"] },
  { name: "Maryland", code: "MD", keywords: ["startup funding maryland", "personal credit business loans MD", "startup capital maryland"] },
  { name: "Massachusetts", code: "MA", keywords: ["startup funding massachusetts", "personal credit startup loans MA", "business funding massachusetts"] },
  { name: "Michigan", code: "MI", keywords: ["startup funding michigan", "personal credit business capital MI", "startup loans michigan"] },
  { name: "Minnesota", code: "MN", keywords: ["startup funding minnesota", "personal credit startup funding MN", "business loans minnesota"] },
  { name: "Mississippi", code: "MS", keywords: ["startup funding mississippi", "personal credit business loans MS", "startup capital mississippi"] },
  { name: "Missouri", code: "MO", keywords: ["startup funding missouri", "personal credit startup loans MO", "business funding missouri"] },
  { name: "Montana", code: "MT", keywords: ["startup funding montana", "personal credit business capital MT", "startup loans montana"] },
  { name: "Nebraska", code: "NE", keywords: ["startup funding nebraska", "personal credit startup funding NE", "business capital nebraska"] },
  { name: "Nevada", code: "NV", keywords: ["startup funding nevada", "personal credit business loans NV", "startup funding nevada"] },
  { name: "New Hampshire", code: "NH", keywords: ["startup funding new hampshire", "personal credit startup loans NH", "business funding new hampshire"] },
  { name: "New Jersey", code: "NJ", keywords: ["startup funding new jersey", "personal credit business capital NJ", "startup loans new jersey"] },
  { name: "New Mexico", code: "NM", keywords: ["startup funding new mexico", "personal credit startup funding NM", "business loans new mexico"] },
  { name: "New York", code: "NY", keywords: ["startup funding new york", "personal credit business loans NY", "startup capital new york"] },
  { name: "North Carolina", code: "NC", keywords: ["startup funding north carolina", "personal credit startup loans NC", "business funding north carolina"] },
  { name: "North Dakota", code: "ND", keywords: ["startup funding north dakota", "personal credit business capital ND", "startup loans north dakota"] },
  { name: "Ohio", code: "OH", keywords: ["startup funding ohio", "personal credit startup funding OH", "business loans ohio"] },
  { name: "Oklahoma", code: "OK", keywords: ["startup funding oklahoma", "personal credit business loans OK", "startup capital oklahoma"] },
  { name: "Oregon", code: "OR", keywords: ["startup funding oregon", "personal credit startup loans OR", "business funding oregon"] },
  { name: "Pennsylvania", code: "PA", keywords: ["startup funding pennsylvania", "personal credit business capital PA", "startup loans pennsylvania"] },
  { name: "Rhode Island", code: "RI", keywords: ["startup funding rhode island", "personal credit startup funding RI", "business capital rhode island"] },
  { name: "South Carolina", code: "SC", keywords: ["startup funding south carolina", "personal credit business loans SC", "startup funding south carolina"] },
  { name: "South Dakota", code: "SD", keywords: ["startup funding south dakota", "personal credit startup loans SD", "business funding south dakota"] },
  { name: "Tennessee", code: "TN", keywords: ["startup funding tennessee", "personal credit business capital TN", "startup loans tennessee"] },
  { name: "Texas", code: "TX", keywords: ["startup funding texas", "personal credit startup funding TX", "business loans texas"] },
  { name: "Utah", code: "UT", keywords: ["startup funding utah", "personal credit business loans UT", "startup capital utah"] },
  { name: "Vermont", code: "VT", keywords: ["startup funding vermont", "personal credit startup loans VT", "business funding vermont"] },
  { name: "Virginia", code: "VA", keywords: ["startup funding virginia", "personal credit business capital VA", "startup loans virginia"] },
  { name: "Washington", code: "WA", keywords: ["startup funding washington", "personal credit startup funding WA", "business capital washington"] },
  { name: "West Virginia", code: "WV", keywords: ["startup funding west virginia", "personal credit business loans WV", "startup funding west virginia"] },
  { name: "Wisconsin", code: "WI", keywords: ["startup funding wisconsin", "personal credit startup loans WI", "business funding wisconsin"] },
  { name: "Wyoming", code: "WY", keywords: ["startup funding wyoming", "personal credit business capital WY", "startup loans wyoming"] },
];

const CTA_LINK = "https://preferredfundinggroup.wufoo.com/forms/z84eu6p0dp3x12/";

interface BlogGenerationResult {
  success: boolean;
  title: string;
  slug: string;
  state: string;
  error?: string;
}

/**
 * Generate a single SEO/AEO-optimized blog post for startup funding
 */
async function generatePFRGBlog(state: typeof STATES[0]): Promise<BlogGenerationResult> {
  const keywordsStr = state.keywords.join(", ");
  
  const prompt = `Write a 2000+ word supremely SEO/AEO-optimized blog post about startup funding using personal credit in ${state.name}.

**Target Keywords (High Ranking Focus):** ${keywordsStr}

**Requirements:**
1. Use perfect heading hierarchy (H1, H2, H3)
2. Include target keywords naturally throughout (2-3% density)
3. AEO optimization: Answer Engine Optimization for Google SGE, Perplexity, ChatGPT
4. Include specific data points for ${state.name}
5. Write for Answer Engine Optimization (clear, authoritative answers)
6. Short paragraphs (2-3 sentences max)
7. 8th-9th grade reading level
8. Include compelling intro and strong conclusion

**CRITICAL - Include this CTA Button:**
"**[Apply for Startup Funding Now](${CTA_LINK})** - Quick 5-minute application using your personal credit. Get approved today!"

**Structure:**
1. H1: "[State] Startup Funding: Get Business Capital Using Personal Credit"
2. Introduction: Why startups in ${state.name} choose personal credit
3. H2: What is Personal Credit Startup Funding?
4. H2: Benefits of Using Personal Credit for Startup Capital
5. H2: How Startup Funding Works in ${state.name}
6. H2: ${state.name} Startup Statistics & Opportunities
7. H2: Who Qualifies for Personal Credit Startup Funding?
8. H2: Common Startup Funding Mistakes in ${state.name}
9. H2: Why Choose Preferred Funding Group?
   - Fast approval (5 minutes)
   - Use personal credit, not business credit
   - No collateral required
   - Funding in 24 hours
10. Conclusion with strong CTA

**Key Points:**
- $1,000 to $500,000+ startup capital available
- 5-minute online application
- Personal credit accepted (not business credit)
- No collateral required
- 24-hour funding
- Works with startups in ANY industry
- Flexible repayment terms

**AEO Optimization:**
- Answer direct questions clearly in content
- Include statistics specific to ${state.name}
- Use schema markup friendly structure
- Make content quote-worthy for AI engines

Write the complete blog post now, optimizing for both Google Search and Answer Engines:`;
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const content = result.response.text();
    
    // Extract title from content
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : `${state.name} Startup Funding: Get Business Capital Using Personal Credit`;
    
    // Generate slug
    const slug = `pfrg-startup-funding-personal-credit-${state.name.toLowerCase().replace(/\s+/g, "-")}-${state.code.toLowerCase()}`;
    
    // Generate meta description
    const metaDescription = `Get startup funding in ${state.name} using personal credit. Quick 5-minute application, 24-hour funding. Apply with Preferred Funding Group today!`;
    
    // Save to database
    await db.insert(blogPosts).values({
      title,
      slug,
      content,
      excerpt: metaDescription,
      metaTitle: title,
      metaDescription,
      canonicalUrl: `https://preferredfundinggroup.com/blog/${slug}`,
      focusKeyphrases: state.keywords,
      category: "startup_funding",
      market: "usa",
      type: "ai_generated",
      status: "published",
      published: true,
      linkToCleanbi: false,
      ogTitle: title,
      ogDescription: metaDescription,
      twitterTitle: title,
      twitterDescription: metaDescription,
      schemaMarkup: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": metaDescription,
        "author": {
          "@type": "Organization",
          "name": "Preferred Funding Group",
          "url": "https://preferredfundinggroup.com"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Preferred Funding Group"
        }
      }),
    });
    
    console.log(`Created PFRG blog: ${title}`);
    
    return {
      success: true,
      title,
      slug,
      state: state.name,
    };
  } catch (error: any) {
    console.error(`Failed to generate PFRG blog for ${state.name}:`, error.message);
    return {
      success: false,
      title: "",
      slug: "",
      state: state.name,
      error: error.message,
    };
  }
}

/**
 * Generate all 50 state blogs
 */
export async function generateAllPFRGBlogs(): Promise<{
  total: number;
  successful: number;
  failed: number;
  results: BlogGenerationResult[];
}> {
  const results: BlogGenerationResult[] = [];
  let successful = 0;
  let failed = 0;
  
  console.log("Starting Preferred Funding Group blog generation...");
  console.log(`Total states: ${STATES.length}`);
  
  for (let i = 0; i < STATES.length; i++) {
    const state = STATES[i];
    
    console.log(`\nGenerating PFRG blog ${i + 1}/${STATES.length}: ${state.name}`);
    
    const result = await generatePFRGBlog(state);
    results.push(result);
    
    if (result.success) {
      successful++;
    } else {
      failed++;
    }
    
    // Rate limiting - wait 2 seconds between requests
    if (i < STATES.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`\n${"=".repeat(50)}`);
  console.log(`PFRG Blog Generation Complete!`);
  console.log(`Total: ${STATES.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log(`CTA Link: ${CTA_LINK}`);
  console.log(`${"=".repeat(50)}`);
  
  return {
    total: STATES.length,
    successful,
    failed,
    results,
  };
}

/**
 * Get PFRG blog topics info
 */
export function getPFRGBlogTopics() {
  return {
    states: STATES,
    ctaLink: CTA_LINK,
    totalBlogs: STATES.length,
  };
}
