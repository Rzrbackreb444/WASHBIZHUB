/**
 * AI-Powered SEO Metadata Generator
 * Uses Gemini to generate optimal SEO content for any page
 * Includes laundromat industry terminology and high-value keywords
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing required GEMINI_API_KEY");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export type PageType = 'tool' | 'content' | 'marketplace' | 'pricing' | 'blog';
export type Industry = 'laundromat' | 'general';

export interface SEOGenerationParams {
  pageTitle: string;
  pageType: PageType;
  industry: Industry;
  pagePath: string;
  existingContent?: string;
  targetKeywords?: string[];
}

export interface GeneratedSEO {
  title: string;
  description: string;
  keywords: string[];
  faqs: { question: string; answer: string }[];
  features: string[];
  reviewSnippets: { author: string; text: string; rating: number }[];
  ogTitle: string;
  ogDescription: string;
  twitterTitle: string;
  twitterDescription: string;
}

const LAUNDROMAT_KEYWORDS = {
  tool: [
    "laundromat software", "coin laundry analytics", "laundromat management",
    "wash and fold software", "laundry business tools", "laundromat POS",
    "laundry equipment calculator", "laundromat ROI calculator"
  ],
  content: [
    "laundromat tips", "coin laundry business", "laundry industry trends",
    "laundromat success", "self-service laundry", "laundromat operations"
  ],
  marketplace: [
    "laundromats for sale", "buy laundromat", "sell laundromat",
    "coin laundry listings", "laundromat marketplace", "laundry business for sale"
  ],
  pricing: [
    "laundromat software pricing", "laundry management subscription",
    "wash and fold software cost", "laundromat tools pricing"
  ],
  blog: [
    "laundromat blog", "coin laundry news", "laundry industry insights",
    "laundromat owner tips", "laundry business advice"
  ]
};

const LAUNDROMAT_REVIEWER_NAMES = [
  "Mike T., Multi-Unit Owner",
  "Sarah L., Laundromat Investor", 
  "James R., Equipment Specialist",
  "Linda K., Laundry Consultant",
  "Robert M., Franchise Owner",
  "Patricia W., First-Time Buyer",
  "David H., Commercial Laundry Pro",
  "Jennifer S., Operations Manager",
  "William B., Industry Veteran",
  "Elizabeth C., Business Analyst"
];

export async function generatePageSEO(params: SEOGenerationParams): Promise<GeneratedSEO> {
  const { pageTitle, pageType, industry, pagePath, existingContent, targetKeywords } = params;
  
  const industryKeywords = industry === 'laundromat' 
    ? LAUNDROMAT_KEYWORDS[pageType] || LAUNDROMAT_KEYWORDS.content
    : [];

  const allKeywords = [...(targetKeywords || []), ...industryKeywords].slice(0, 10);

  const prompt = `You are an expert SEO specialist for the ${industry === 'laundromat' ? 'laundromat and commercial laundry' : 'business'} industry. Generate comprehensive SEO metadata for a webpage.

PAGE DETAILS:
- Title: ${pageTitle}
- URL Path: ${pagePath}
- Page Type: ${pageType}
- Industry: ${industry}
${existingContent ? `- Content Summary: ${existingContent.substring(0, 500)}...` : ''}
${allKeywords.length > 0 ? `- Target Keywords: ${allKeywords.join(", ")}` : ''}

REQUIREMENTS:
1. Meta Title: 50-60 characters, include primary keyword, compelling and click-worthy
2. Meta Description: 150-160 characters, include CTA, benefit-driven, with keywords
3. Keywords: 5-10 relevant, high-value keywords for this page
4. FAQs: 3-5 frequently asked questions with detailed answers (for FAQ schema)
5. Features: 5-7 key feature highlights or benefits
6. Review Snippets: 3 realistic testimonial-style reviews with:
   - Author names that sound like real ${industry === 'laundromat' ? 'laundromat owners/operators' : 'business professionals'}
   - Genuine-sounding review text (30-60 words each)
   - Rating (4 or 5 stars only)

${industry === 'laundromat' ? `
LAUNDROMAT INDUSTRY CONTEXT:
- Target audience: Laundromat owners, operators, investors, and prospective buyers
- Use terms like: coin laundry, self-service laundry, wash and fold, turns per day (TPD), revenue per square foot
- Emphasize ROI, efficiency, profitability, and industry-specific metrics
- Reference WashBizHub as the #1 laundromat resource platform
` : ''}

Generate content that:
- Drives conversions and clicks
- Sounds professional and authoritative
- Uses natural, non-keyword-stuffed language
- Creates trust and credibility

Return ONLY valid JSON in this exact format:
{
  "title": "SEO Title Here (50-60 chars)",
  "description": "Meta description here with CTA (150-160 chars)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "faqs": [
    {"question": "Question 1?", "answer": "Detailed answer 1"},
    {"question": "Question 2?", "answer": "Detailed answer 2"},
    {"question": "Question 3?", "answer": "Detailed answer 3"}
  ],
  "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
  "reviewSnippets": [
    {"author": "Name, Title", "text": "Review text here", "rating": 5},
    {"author": "Name, Title", "text": "Review text here", "rating": 5},
    {"author": "Name, Title", "text": "Review text here", "rating": 4}
  ],
  "ogTitle": "Open Graph Title for Social",
  "ogDescription": "OG description for social sharing",
  "twitterTitle": "Twitter Card Title",
  "twitterDescription": "Twitter card description"
}`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text() || "";

  try {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                      text.match(/```\n([\s\S]*?)\n```/) || 
                      [null, text];
    const jsonText = jsonMatch[1] || text;
    const parsed = JSON.parse(jsonText.trim());

    return {
      title: parsed.title || pageTitle,
      description: parsed.description || "",
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      faqs: Array.isArray(parsed.faqs) ? parsed.faqs : [],
      features: Array.isArray(parsed.features) ? parsed.features : [],
      reviewSnippets: Array.isArray(parsed.reviewSnippets) ? parsed.reviewSnippets : [],
      ogTitle: parsed.ogTitle || parsed.title || pageTitle,
      ogDescription: parsed.ogDescription || parsed.description || "",
      twitterTitle: parsed.twitterTitle || parsed.title || pageTitle,
      twitterDescription: parsed.twitterDescription || parsed.description || "",
    };
  } catch (error) {
    console.error("Failed to parse Gemini SEO response:", error);
    return generateFallbackSEO(params);
  }
}

function generateFallbackSEO(params: SEOGenerationParams): GeneratedSEO {
  const { pageTitle, pageType, industry, pagePath } = params;
  const isLaundromat = industry === 'laundromat';
  
  const keywords = isLaundromat 
    ? LAUNDROMAT_KEYWORDS[pageType] || LAUNDROMAT_KEYWORDS.content
    : ["business software", "professional tools", "enterprise platform"];

  const reviewerNames = isLaundromat 
    ? LAUNDROMAT_REVIEWER_NAMES.slice(0, 3)
    : ["John D., Business Owner", "Sarah M., Manager", "Mike K., Analyst"];

  return {
    title: `${pageTitle} | WashBizHub`,
    description: `Discover ${pageTitle.toLowerCase()} on WashBizHub - the #1 ${isLaundromat ? 'laundromat' : 'business'} resource platform. Get started today.`,
    keywords: keywords.slice(0, 7),
    faqs: [
      { 
        question: `What is ${pageTitle}?`, 
        answer: `${pageTitle} is a powerful ${isLaundromat ? 'laundromat' : 'business'} tool on WashBizHub designed to help you succeed.` 
      },
      { 
        question: `How do I get started with ${pageTitle}?`, 
        answer: `Simply create a free account on WashBizHub and access ${pageTitle} from your dashboard.` 
      },
      { 
        question: `Is ${pageTitle} free to use?`, 
        answer: `WashBizHub offers both free and premium tiers. Many features are available at no cost.` 
      }
    ],
    features: [
      "Easy-to-use interface",
      "Data-driven insights",
      "Real-time analytics",
      "Professional reports",
      "Expert recommendations"
    ],
    reviewSnippets: reviewerNames.map((author, i) => ({
      author,
      text: `${pageTitle} has transformed how I run my ${isLaundromat ? 'laundromat' : 'business'}. Highly recommend WashBizHub!`,
      rating: i === 2 ? 4 : 5
    })),
    ogTitle: `${pageTitle} - WashBizHub`,
    ogDescription: `${pageTitle} on WashBizHub - Your complete ${isLaundromat ? 'laundromat' : 'business'} solution.`,
    twitterTitle: pageTitle,
    twitterDescription: `Check out ${pageTitle} on WashBizHub!`
  };
}

export const MAJOR_PAGES: SEOGenerationParams[] = [
  {
    pageTitle: "CLEANBI Explorer",
    pageType: "tool",
    industry: "laundromat",
    pagePath: "/cleanbi-explorer",
    existingContent: "Advanced laundromat location analysis tool using AI to score potential sites, analyze demographics, competition, and traffic patterns for optimal investment decisions.",
    targetKeywords: ["laundromat site selection", "laundromat location analysis", "CLEANBI score", "laundromat investment analysis"]
  },
  {
    pageTitle: "Laundromat Marketplace",
    pageType: "marketplace",
    industry: "laundromat",
    pagePath: "/marketplace",
    existingContent: "Browse laundromats for sale across the United States. Find coin laundry businesses, equipment listings, and investment opportunities.",
    targetKeywords: ["laundromats for sale", "buy laundromat", "coin laundry for sale", "laundromat listings"]
  },
  {
    pageTitle: "Laundromat Listings",
    pageType: "marketplace",
    industry: "laundromat",
    pagePath: "/listings",
    existingContent: "Comprehensive directory of laundromats for sale with detailed financials, photos, and seller information.",
    targetKeywords: ["laundromat business for sale", "laundry listings", "coin-op laundry for sale"]
  },
  {
    pageTitle: "ROI Calculator",
    pageType: "tool",
    industry: "laundromat",
    pagePath: "/roi-calculator",
    existingContent: "Calculate your laundromat investment return with our free ROI calculator. Factor in purchase price, operating costs, and revenue projections.",
    targetKeywords: ["laundromat ROI calculator", "coin laundry investment calculator", "laundromat profitability"]
  },
  {
    pageTitle: "Valuation Calculator",
    pageType: "tool",
    industry: "laundromat",
    pagePath: "/valuation-calculator",
    existingContent: "Determine the fair market value of any laundromat using industry-standard valuation methods including cash flow multiples and asset-based approaches.",
    targetKeywords: ["laundromat valuation", "how much is a laundromat worth", "coin laundry business value"]
  },
  {
    pageTitle: "Calculators Suite",
    pageType: "tool",
    industry: "laundromat",
    pagePath: "/calculators",
    existingContent: "Complete suite of laundromat business calculators including ROI, valuation, loan, TPD, and revenue calculators.",
    targetKeywords: ["laundromat calculators", "laundry business tools", "coin laundry analysis"]
  },
  {
    pageTitle: "Laundromat Courses",
    pageType: "content",
    industry: "laundromat",
    pagePath: "/courses",
    existingContent: "Learn how to buy, operate, and scale laundromats with our comprehensive online courses taught by industry experts.",
    targetKeywords: ["laundromat training", "how to start a laundromat", "coin laundry course", "laundromat business course"]
  },
  {
    pageTitle: "Pricing Plans",
    pageType: "pricing",
    industry: "laundromat",
    pagePath: "/pricing",
    existingContent: "Choose the perfect WashBizHub subscription plan for your laundromat business needs. From free tools to enterprise solutions.",
    targetKeywords: ["WashBizHub pricing", "laundromat software cost", "laundry management pricing"]
  },
  {
    pageTitle: "POS Command Center",
    pageType: "tool",
    industry: "laundromat",
    pagePath: "/pos-command-center",
    existingContent: "Complete point-of-sale and business management system for laundromats. Track revenue, manage customers, and optimize operations.",
    targetKeywords: ["laundromat POS", "coin laundry point of sale", "laundromat management software"]
  },
  {
    pageTitle: "Design Studio",
    pageType: "tool",
    industry: "laundromat",
    pagePath: "/design-studio",
    existingContent: "Design your laundromat layout in 2D and 3D. Plan equipment placement, optimize traffic flow, and calculate costs before building.",
    targetKeywords: ["laundromat floor plan", "laundry layout designer", "coin laundry design tool"]
  },
  {
    pageTitle: "Service Guy AI",
    pageType: "tool",
    industry: "laundromat",
    pagePath: "/service-guy-ai",
    existingContent: "AI-powered equipment diagnostics and repair guidance. Get instant error code explanations and troubleshooting steps for all major brands.",
    targetKeywords: ["washer error codes", "laundromat equipment repair", "commercial washer troubleshooting"]
  },
  {
    pageTitle: "Funding Matcher",
    pageType: "tool",
    industry: "laundromat",
    pagePath: "/funding-matcher",
    existingContent: "Find the perfect financing for your laundromat acquisition or expansion. Compare SBA loans, equipment financing, and alternative lenders.",
    targetKeywords: ["laundromat financing", "SBA loan laundromat", "coin laundry business loan"]
  },
  {
    pageTitle: "Vendor Directory",
    pageType: "content",
    industry: "laundromat",
    pagePath: "/vendors",
    existingContent: "Complete directory of laundromat equipment vendors, service providers, and industry suppliers with reviews and contact information.",
    targetKeywords: ["laundromat equipment suppliers", "commercial washer vendors", "laundry equipment distributors"]
  },
  {
    pageTitle: "TPD Calculator",
    pageType: "tool",
    industry: "laundromat",
    pagePath: "/tpd-calculator",
    existingContent: "Calculate turns per day for your laundromat equipment. Optimize machine utilization and project daily revenue potential.",
    targetKeywords: ["turns per day calculator", "laundromat TPD", "machine utilization calculator"]
  },
  {
    pageTitle: "Loan Calculator",
    pageType: "tool",
    industry: "laundromat",
    pagePath: "/loan-calculator",
    existingContent: "Calculate your laundromat loan payments, interest costs, and amortization schedule. Compare different financing scenarios.",
    targetKeywords: ["laundromat loan calculator", "business loan calculator", "equipment financing calculator"]
  }
];

export async function generateAllPagesSEO(): Promise<Map<string, GeneratedSEO>> {
  const results = new Map<string, GeneratedSEO>();
  
  console.log(`🔄 Generating SEO for ${MAJOR_PAGES.length} pages...`);
  
  for (const page of MAJOR_PAGES) {
    try {
      console.log(`📝 Generating SEO for: ${page.pageTitle}`);
      const seo = await generatePageSEO(page);
      results.set(page.pagePath, seo);
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Failed to generate SEO for ${page.pagePath}:`, error);
      results.set(page.pagePath, generateFallbackSEO(page));
    }
  }
  
  console.log(`✅ Generated SEO for ${results.size} pages`);
  return results;
}

export async function regenerateSEOForPage(pagePath: string): Promise<GeneratedSEO | null> {
  const page = MAJOR_PAGES.find(p => p.pagePath === pagePath);
  
  if (!page) {
    return null;
  }
  
  return generatePageSEO(page);
}
