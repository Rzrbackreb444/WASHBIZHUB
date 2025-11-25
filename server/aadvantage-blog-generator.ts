import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { storage } from "./storage";
import { generateSlug, generateCanonicalUrl, generateSchemaMarkup } from "./seo-optimizer";

// ========================================
// AADVANTAGE LAUNDRY BULK BLOG GENERATOR
// 120 Ultra SEO-Optimized Blog Posts
// ========================================

// CRITICAL AFFILIATE LINKS
const AFFILIATE_LINKS = {
  aadvantage: "https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry",
  facebookGroup: "https://facebook.com/groups/thelaundromat",
  washbizhub: "https://washbizhub.com",
  cleanbi: "https://washbizhub.com/cleanbi",
  serviceGuyAi: "https://washbizhub.com/service-guy-ai",
  marketplace: "https://washbizhub.com/marketplace",
  consultation: "https://washbizhub.com/consultation",
  forum: "https://washbizhub.com/forum",
};

// AADVANTAGE EQUIPMENT BRANDS
const BRANDS = [
  { id: "dexter", name: "Dexter", tagline: "Built Better. Serviced Quicker. Made in America." },
  { id: "continental_girbau", name: "Continental Girbau", tagline: "European Engineering Excellence" },
  { id: "maytag", name: "Maytag Commercial", tagline: "Dependability Since 1893" },
  { id: "whirlpool", name: "Whirlpool Commercial", tagline: "Every Day, Care" },
  { id: "econ_o", name: "Econ-O-Wash", tagline: "Value-Driven Commercial Laundry" },
  { id: "lg", name: "LG Commercial", tagline: "Life's Good" },
  { id: "bc_technologies", name: "B&C Technologies", tagline: "Industrial Laundry Solutions" },
];

// TARGET STATES (Focus Markets)
const STATES = [
  { code: "TX", name: "Texas", cities: ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth", "El Paso", "Arlington", "Plano", "Garland", "Lubbock"] },
  { code: "LA", name: "Louisiana", cities: ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette", "Lake Charles", "Kenner", "Bossier City", "Monroe"] },
  { code: "OK", name: "Oklahoma", cities: ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow", "Edmond", "Lawton", "Moore", "Midwest City"] },
  { code: "AR", name: "Arkansas", cities: ["Little Rock", "Fort Smith", "Fayetteville", "Springdale", "Jonesboro", "Rogers", "Conway", "North Little Rock"] },
];

// BLOG TOPIC TEMPLATES - Equipment Focused
const EQUIPMENT_TOPICS = [
  "{brand} Commercial Washers for {city} Laundromats: Complete Buyer's Guide",
  "Why {city} Laundromat Owners Choose {brand} Equipment",
  "Best {brand} Dryers for High-Volume {state} Laundromats",
  "{brand} vs Competitors: Which Commercial Washer Wins in {state}?",
  "How {brand} Equipment Maximizes ROI for {city} Laundromat Investors",
  "Starting a Laundromat in {city}? Here's Why {brand} is Your Best Choice",
  "{brand} Commercial Laundry Equipment: {state} Distributor Guide",
  "Energy-Efficient {brand} Washers: Cutting Costs for {city} Laundromats",
  "{brand} Maintenance Tips for {state} Commercial Laundry Owners",
  "Financing {brand} Equipment for Your {city} Laundromat",
  "Industrial {brand} Solutions for Multi-Store {state} Laundromat Chains",
  "{brand} Service & Parts: Fast Support for {city} Area Laundromats",
];

// FORUM/DISCUSSION BLOG TOPICS
const FORUM_TOPICS = [
  "Join the Conversation: Top Laundromat Owner Forums and Communities",
  "How Facebook Groups Are Revolutionizing Laundromat Owner Networking",
  "The Ultimate Guide to Laundromat Owner Discussion Groups",
  "What Successful Laundromat Owners Discuss in Private Forums",
  "Building Your Laundromat Network: Best Online Communities",
  "Laundromat Equipment Reviews: What Owners Are Really Saying",
  "Regional Laundromat Associations vs Online Communities: Which is Better?",
  "How to Get Expert Laundromat Advice from Industry Veterans",
  "Laundromat Troubleshooting: Crowdsourcing Solutions from Owner Networks",
  "Texas Laundromat Owners Unite: Join the Conversation",
  "Louisiana Laundromat Community: Connect with Local Operators",
  "Oklahoma Laundromat Network: Resources for Southern Plains Owners",
  "Arkansas Laundromat Forum: Ozark Region Owner Discussions",
  "Multi-Location Laundromat Owners: Scaling Strategies from the Community",
  "First-Time Laundromat Buyer? Here's Where to Get Honest Advice",
  "Laundromat Equipment Financing Tips from Experienced Owners",
  "Commercial Laundry Consulting: When to Hire vs. Community Advice",
  "Laundromat Industry Trends: What Forum Members Are Predicting",
  "Best Practices Shared by Top Laundromat Facebook Group Members",
  "How Online Laundromat Communities Helped Me Avoid Costly Mistakes",
];

// Word count variations for SEO diversity
const WORD_COUNTS = [900, 1200, 1500, 1800, 2000, 2500];

// Initialize AI clients - prioritize Replit AI Integrations OpenAI
const openai = process.env.AI_INTEGRATIONS_OPENAI_API_KEY 
  ? new OpenAI({ 
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    })
  : process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

interface GeneratedBlog {
  title: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyphrases: string[];
  provider: string;
}

// ========================================
// AFFILIATE LINK INJECTION
// ========================================

function injectAffiliateLinks(content: string, state: string, brand: string): string {
  // Hero CTA Box (top of article)
  const heroCTA = `
<div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg mb-8 shadow-lg">
  <h3 class="text-xl font-bold mb-2">Ready to Upgrade Your Laundromat Equipment?</h3>
  <p class="mb-4">AAdvantage Laundry Systems is the leading ${brand} distributor in ${state}. Get expert consultation, competitive pricing, and industry-leading service.</p>
  <a href="${AFFILIATE_LINKS.aadvantage}?utm_source=washbizhub&utm_medium=blog&utm_campaign=${state.toLowerCase()}-${brand.toLowerCase().replace(/\s/g, '-')}" 
     class="inline-block bg-yellow-400 text-blue-900 font-bold py-3 px-6 rounded-lg hover:bg-yellow-300 transition-colors"
     target="_blank" rel="noopener">
    Get Your Free Equipment Quote →
  </a>
</div>`;

  // Mid-article comparison callout
  const midCTA = `
<div class="border-l-4 border-blue-600 bg-blue-50 p-4 my-6">
  <p class="font-semibold text-blue-900">Looking for ${brand} equipment in ${state}?</p>
  <p class="text-blue-800">Connect with <a href="${AFFILIATE_LINKS.aadvantage}?utm_source=washbizhub&utm_medium=blog&utm_campaign=mid-cta" class="underline font-bold" target="_blank" rel="noopener">AAdvantage Laundry Systems</a> - the region's most trusted commercial laundry distributor with offices in Texas, Oklahoma, and North Carolina.</p>
</div>`;

  // Community callout
  const communityCTA = `
<div class="bg-gray-100 p-4 rounded-lg my-6">
  <p class="font-semibold">Join 10,000+ Laundromat Owners</p>
  <p>Connect with industry veterans, share experiences, and get advice in the <a href="${AFFILIATE_LINKS.facebookGroup}" class="text-blue-600 underline font-bold" target="_blank" rel="noopener">Laundromat Owners Facebook Group</a>.</p>
</div>`;

  // Conclusion CTA
  const conclusionCTA = `
<div class="bg-gradient-to-r from-green-600 to-green-800 text-white p-6 rounded-lg mt-8">
  <h3 class="text-xl font-bold mb-2">Take the Next Step</h3>
  <p class="mb-4">Whether you're starting a new laundromat or upgrading existing equipment, AAdvantage Laundry Systems has the expertise and inventory to help you succeed.</p>
  <div class="flex flex-wrap gap-4">
    <a href="${AFFILIATE_LINKS.aadvantage}?utm_source=washbizhub&utm_medium=blog&utm_campaign=conclusion-cta" 
       class="inline-block bg-white text-green-800 font-bold py-2 px-4 rounded hover:bg-gray-100 transition-colors"
       target="_blank" rel="noopener">
      Request Equipment Quote
    </a>
    <a href="${AFFILIATE_LINKS.facebookGroup}" 
       class="inline-block bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition-colors"
       target="_blank" rel="noopener">
      Join Owner Community
    </a>
    <a href="${AFFILIATE_LINKS.cleanbi}" 
       class="inline-block bg-yellow-400 text-green-900 font-bold py-2 px-4 rounded hover:bg-yellow-300 transition-colors">
      Analyze Location with CLEANBI
    </a>
  </div>
</div>`;

  // Internal links
  const internalLinks = `
<div class="bg-gray-50 border border-gray-200 p-4 rounded-lg my-6">
  <h4 class="font-bold text-gray-900 mb-3">More Resources from WashBizHub:</h4>
  <ul class="space-y-2">
    <li><a href="${AFFILIATE_LINKS.cleanbi}" class="text-blue-600 hover:underline">CLEANBI Location Analysis Tool</a> - Score any address for laundromat potential</li>
    <li><a href="${AFFILIATE_LINKS.serviceGuyAi}" class="text-blue-600 hover:underline">Service Guy AI</a> - 2,800+ error codes and diagnostic assistance</li>
    <li><a href="${AFFILIATE_LINKS.marketplace}" class="text-blue-600 hover:underline">Laundromat Marketplace</a> - Browse listings for sale</li>
    <li><a href="${AFFILIATE_LINKS.consultation}" class="text-blue-600 hover:underline">Expert Consultation</a> - Book a call with industry veterans</li>
  </ul>
</div>`;

  // Insert CTAs at strategic positions
  let modifiedContent = content;
  
  // Add hero CTA after first paragraph
  const firstParagraphEnd = modifiedContent.indexOf('</p>') + 4;
  if (firstParagraphEnd > 4) {
    modifiedContent = modifiedContent.slice(0, firstParagraphEnd) + heroCTA + modifiedContent.slice(firstParagraphEnd);
  }
  
  // Add mid CTA after ~40% of content
  const midPoint = Math.floor(modifiedContent.length * 0.4);
  const nextParagraphEnd = modifiedContent.indexOf('</p>', midPoint);
  if (nextParagraphEnd > midPoint) {
    modifiedContent = modifiedContent.slice(0, nextParagraphEnd + 4) + midCTA + communityCTA + modifiedContent.slice(nextParagraphEnd + 4);
  }
  
  // Add internal links before conclusion
  const lastH2 = modifiedContent.lastIndexOf('<h2');
  if (lastH2 > 0) {
    modifiedContent = modifiedContent.slice(0, lastH2) + internalLinks + modifiedContent.slice(lastH2);
  }
  
  // Add conclusion CTA at the end
  modifiedContent += conclusionCTA;
  
  return modifiedContent;
}

// ========================================
// AI BLOG GENERATION
// ========================================

async function generateWithOpenAI(
  topic: string,
  state: string,
  brand: string,
  wordCount: number
): Promise<GeneratedBlog> {
  if (!openai) {
    throw new Error("OpenAI not configured");
  }

  const prompt = `You are an expert commercial laundry industry content writer. Write a comprehensive, SEO-optimized blog post.

TOPIC: "${topic}"

CONTEXT:
- This is for WashBizHub.com, the leading laundromat industry resource
- Target audience: Laundromat owners, investors, and entrepreneurs in ${state}
- Featured brand: ${brand} commercial laundry equipment
- Distributor: AAdvantage Laundry Systems (leading Southern US distributor)

REQUIREMENTS:
- Word count: ${wordCount} words minimum
- Tone: Professional yet conversational, authoritative
- Structure: 
  * Compelling introduction with hook
  * 4-6 H2 sections with detailed content
  * Include specific ${brand} model recommendations where appropriate
  * Address common buyer questions
  * Strong conclusion with clear call-to-action
- Use semantic HTML: h2, h3, p, ul, ol, strong, em
- Include real statistics about the laundromat industry
- Mention energy efficiency, ROI, and operational benefits
- Reference local market conditions in ${state}

SEO REQUIREMENTS:
- Focus keyword should appear in first 100 words
- Use related keywords naturally throughout
- Include location-based keywords (${state}, specific cities)
- Create scannable content with bullet points and numbered lists

RETURN ONLY VALID JSON:
{
  "title": "Compelling H1 title (50-60 characters)",
  "metaTitle": "SEO meta title with primary keyword (50-60 chars)",
  "metaDescription": "Compelling meta description with CTA (150-160 chars)",
  "excerpt": "Brief summary for preview cards (150-160 chars)",
  "content": "Full HTML content with semantic tags - NO markdown, only HTML",
  "focusKeyphrases": ["primary keyword", "secondary keyword 1", "secondary keyword 2", "local keyword"]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 6000,
  });

  const responseText = response.choices[0].message.content || "";
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse OpenAI response");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    ...parsed,
    provider: "openai",
  };
}

async function generateWithAnthropic(
  topic: string,
  state: string,
  brand: string,
  wordCount: number
): Promise<GeneratedBlog> {
  const prompt = `You are an expert commercial laundry industry content writer. Write a comprehensive, SEO-optimized blog post.

TOPIC: "${topic}"

CONTEXT:
- This is for WashBizHub.com, the leading laundromat industry resource
- Target audience: Laundromat owners, investors, and entrepreneurs in ${state}
- Featured brand: ${brand} commercial laundry equipment
- Distributor: AAdvantage Laundry Systems (leading Southern US distributor)

REQUIREMENTS:
- Word count: ${wordCount} words minimum
- Tone: Professional yet conversational, authoritative
- Structure: 
  * Compelling introduction with hook
  * 4-6 H2 sections with detailed content
  * Include specific ${brand} model recommendations where appropriate
  * Address common buyer questions
  * Strong conclusion with clear call-to-action
- Use semantic HTML: h2, h3, p, ul, ol, strong, em
- Include real statistics about the laundromat industry
- Mention energy efficiency, ROI, and operational benefits
- Reference local market conditions in ${state}

SEO REQUIREMENTS:
- Focus keyword should appear in first 100 words
- Use related keywords naturally throughout
- Include location-based keywords (${state}, specific cities)
- Create scannable content with bullet points and numbered lists

RETURN ONLY VALID JSON:
{
  "title": "Compelling H1 title (50-60 characters)",
  "metaTitle": "SEO meta title with primary keyword (50-60 chars)",
  "metaDescription": "Compelling meta description with CTA (150-160 chars)",
  "excerpt": "Brief summary for preview cards (150-160 chars)",
  "content": "Full HTML content with semantic tags - NO markdown, only HTML",
  "focusKeyphrases": ["primary keyword", "secondary keyword 1", "secondary keyword 2", "local keyword"]
}`;

  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 6000,
    messages: [{ role: "user", content: prompt }],
  });

  const responseText = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse Anthropic response");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    ...parsed,
    provider: "anthropic",
  };
}

async function generateWithGemini(
  topic: string,
  state: string,
  brand: string,
  wordCount: number
): Promise<GeneratedBlog> {
  const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = `You are an expert commercial laundry industry content writer. Write a comprehensive, SEO-optimized blog post.

TOPIC: "${topic}"

CONTEXT:
- This is for WashBizHub.com, the leading laundromat industry resource
- Target audience: Laundromat owners, investors, and entrepreneurs in ${state}
- Featured brand: ${brand} commercial laundry equipment
- Distributor: AAdvantage Laundry Systems (leading Southern US distributor)

REQUIREMENTS:
- Word count: ${wordCount} words minimum
- Tone: Professional, data-driven, research-focused
- Include market statistics and industry trends
- Reference ${brand} specific features and benefits
- Address ROI and financial considerations
- Use semantic HTML: h2, h3, p, ul, ol, strong, em

RETURN ONLY VALID JSON:
{
  "title": "Compelling H1 title (50-60 characters)",
  "metaTitle": "SEO meta title with primary keyword (50-60 chars)",
  "metaDescription": "Compelling meta description with CTA (150-160 chars)",
  "excerpt": "Brief summary for preview cards (150-160 chars)",
  "content": "Full HTML content with semantic tags - NO markdown, only HTML",
  "focusKeyphrases": ["primary keyword", "secondary keyword 1", "secondary keyword 2", "local keyword"]
}`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse Gemini response");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    ...parsed,
    provider: "gemini",
  };
}

// ========================================
// FORUM BLOG GENERATION
// ========================================

async function generateForumBlog(topic: string, wordCount: number): Promise<GeneratedBlog> {
  const prompt = `You are an expert laundromat industry community builder. Write an engaging blog post about laundromat owner communities and forums.

TOPIC: "${topic}"

CONTEXT:
- This is for WashBizHub.com
- Primary community: The Laundromat Owners Facebook Group (10,000+ members)
- Goal: Drive engagement to the Facebook community and WashBizHub resources
- Target audience: Laundromat owners seeking peer advice and networking

REQUIREMENTS:
- Word count: ${wordCount} words
- Tone: Welcoming, community-focused, encouraging
- Highlight benefits of joining laundromat owner communities
- Include specific examples of valuable discussions
- Address common questions new owners have
- Emphasize the value of peer-to-peer knowledge sharing
- Use semantic HTML: h2, h3, p, ul, ol, strong, em

RETURN ONLY VALID JSON:
{
  "title": "Compelling H1 title (50-60 characters)",
  "metaTitle": "SEO meta title with primary keyword (50-60 chars)",
  "metaDescription": "Compelling meta description with CTA (150-160 chars)",
  "excerpt": "Brief summary for preview cards (150-160 chars)",
  "content": "Full HTML content with semantic tags - NO markdown, only HTML",
  "focusKeyphrases": ["laundromat forum", "laundromat community", "laundromat owners group", "laundromat advice"]
}`;

  // Use OpenAI first (Replit AI Integrations), fallback to Gemini, then Anthropic
  const errors: string[] = [];
  
  // Try OpenAI first
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 5000,
      });
      const responseText = response.choices[0].message.content || "";
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse OpenAI forum blog response");
      }
      const parsed = JSON.parse(jsonMatch[0]);
      return { ...parsed, provider: "openai" };
    } catch (openaiError: any) {
      errors.push(`OpenAI: ${openaiError.message}`);
      console.log(`OpenAI failed for forum blog (${openaiError.message}), trying Gemini...`);
    }
  }
  
  // Fallback to Gemini
  if (gemini) {
    try {
      const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse Gemini forum blog response");
      }
      const parsed = JSON.parse(jsonMatch[0]);
      return { ...parsed, provider: "gemini" };
    } catch (geminiError: any) {
      errors.push(`Gemini: ${geminiError.message}`);
      console.log(`Gemini failed for forum blog (${geminiError.message}), trying Anthropic...`);
    }
  }
  
  // Fallback to Anthropic
  if (anthropic) {
    try {
      const message = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 5000,
        messages: [{ role: "user", content: prompt }],
      });
      const responseText = message.content[0].type === "text" ? message.content[0].text : "";
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse Anthropic forum blog response");
      }
      const parsed = JSON.parse(jsonMatch[0]);
      return { ...parsed, provider: "anthropic" };
    } catch (anthropicError: any) {
      errors.push(`Anthropic: ${anthropicError.message}`);
    }
  }
  
  throw new Error(`All AI providers failed for forum blog: ${errors.join("; ")}`);
}

function injectForumLinks(content: string): string {
  const forumHeroCTA = `
<div class="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 rounded-lg mb-8 shadow-lg">
  <h3 class="text-xl font-bold mb-2">Join 10,000+ Laundromat Owners Today</h3>
  <p class="mb-4">Connect with experienced operators, get equipment advice, troubleshoot problems, and share your wins in the most active laundromat community online.</p>
  <a href="${AFFILIATE_LINKS.facebookGroup}" 
     class="inline-block bg-white text-blue-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors"
     target="_blank" rel="noopener">
    Join the Facebook Group →
  </a>
</div>`;

  const equipmentCTA = `
<div class="border-l-4 border-green-600 bg-green-50 p-4 my-6">
  <p class="font-semibold text-green-900">Need Equipment Recommendations?</p>
  <p class="text-green-800">Get personalized quotes from <a href="${AFFILIATE_LINKS.aadvantage}?utm_source=washbizhub&utm_medium=forum-blog&utm_campaign=equipment-cta" class="underline font-bold" target="_blank" rel="noopener">AAdvantage Laundry Systems</a> - trusted by thousands of laundromat owners across the Southern US.</p>
</div>`;

  const resourcesCTA = `
<div class="bg-gray-50 border border-gray-200 p-4 rounded-lg my-6">
  <h4 class="font-bold text-gray-900 mb-3">WashBizHub Resources:</h4>
  <ul class="space-y-2">
    <li><a href="${AFFILIATE_LINKS.cleanbi}" class="text-blue-600 hover:underline">CLEANBI Analysis</a> - Score any location for laundromat potential</li>
    <li><a href="${AFFILIATE_LINKS.serviceGuyAi}" class="text-blue-600 hover:underline">Service Guy AI</a> - Instant equipment diagnostics</li>
    <li><a href="${AFFILIATE_LINKS.aadvantage}?utm_source=washbizhub&utm_medium=forum-blog&utm_campaign=resources" class="text-blue-600 hover:underline" target="_blank" rel="noopener">AAdvantage Equipment</a> - Premium commercial laundry equipment</li>
    <li><a href="${AFFILIATE_LINKS.consultation}" class="text-blue-600 hover:underline">Expert Consultation</a> - 1-on-1 industry guidance</li>
  </ul>
</div>`;

  let modifiedContent = content;
  
  const firstParagraphEnd = modifiedContent.indexOf('</p>') + 4;
  if (firstParagraphEnd > 4) {
    modifiedContent = modifiedContent.slice(0, firstParagraphEnd) + forumHeroCTA + modifiedContent.slice(firstParagraphEnd);
  }
  
  const midPoint = Math.floor(modifiedContent.length * 0.5);
  const nextParagraphEnd = modifiedContent.indexOf('</p>', midPoint);
  if (nextParagraphEnd > midPoint) {
    modifiedContent = modifiedContent.slice(0, nextParagraphEnd + 4) + equipmentCTA + modifiedContent.slice(nextParagraphEnd + 4);
  }
  
  modifiedContent += resourcesCTA;
  
  return modifiedContent;
}

// ========================================
// BULK GENERATION ORCHESTRATOR
// ========================================

export interface BlogGenerationResult {
  success: boolean;
  blogId?: string;
  title?: string;
  slug?: string;
  error?: string;
}

export interface BulkGenerationProgress {
  total: number;
  completed: number;
  failed: number;
  results: BlogGenerationResult[];
}

export async function generateEquipmentBlog(
  state: typeof STATES[0],
  brand: typeof BRANDS[0],
  topicTemplate: string,
  cityIndex: number
): Promise<BlogGenerationResult> {
  try {
    const city = state.cities[cityIndex % state.cities.length];
    const topic = topicTemplate
      .replace("{brand}", brand.name)
      .replace("{state}", state.name)
      .replace("{city}", city);

    const wordCount = WORD_COUNTS[Math.floor(Math.random() * WORD_COUNTS.length)];

    // Use OpenAI first (Replit AI Integrations), fallback to Gemini, then Anthropic
    let generated: GeneratedBlog | undefined;
    const errors: string[] = [];
    
    // Try OpenAI first
    if (openai) {
      try {
        generated = await generateWithOpenAI(topic, state.name, brand.name, wordCount);
        // Success - continue to save blog
      } catch (openaiError: any) {
        errors.push(`OpenAI: ${openaiError.message}`);
        console.log(`OpenAI failed (${openaiError.message}), trying Gemini...`);
      }
    }
    
    // Fallback to Gemini if OpenAI failed
    if (!generated && gemini) {
      try {
        generated = await generateWithGemini(topic, state.name, brand.name, wordCount);
      } catch (geminiError: any) {
        errors.push(`Gemini: ${geminiError.message}`);
        console.log(`Gemini failed (${geminiError.message}), trying Anthropic...`);
      }
    }
    
    // Fallback to Anthropic if both failed
    if (!generated && anthropic) {
      try {
        generated = await generateWithAnthropic(topic, state.name, brand.name, wordCount);
      } catch (anthropicError: any) {
        errors.push(`Anthropic: ${anthropicError.message}`);
        throw new Error(`All AI providers failed: ${errors.join("; ")}`);
      }
    }
    
    if (!generated) {
      throw new Error(`No AI providers available. Errors: ${errors.join("; ")}`);
    }

    const contentWithLinks = injectAffiliateLinks(generated.content, state.name, brand.name);
    const slug = generateSlug(generated.title);
    const canonicalUrl = generateCanonicalUrl(slug);

    const blogPost = await storage.createBlogPost({
      title: generated.title,
      content: contentWithLinks,
      excerpt: generated.excerpt,
      slug,
      canonicalUrl,
      metaTitle: generated.metaTitle,
      metaDescription: generated.metaDescription,
      focusKeyphrases: generated.focusKeyphrases,
      type: "ai_multi",
      category: "laundromat",
      subcategory: `state-${state.code.toLowerCase()}-${brand.id}`,
      market: "us",
      aiProviders: [generated.provider],
      aiQualityScore: 85,
      seoScore: 90,
      linkToCleanbi: true,
      cleanbiAnchorText: "Analyze your laundromat location with CLEANBI",
      internalLinks: [
        { url: AFFILIATE_LINKS.cleanbi, anchor: "CLEANBI Analysis", context: "location scoring" },
        { url: AFFILIATE_LINKS.serviceGuyAi, anchor: "Service Guy AI", context: "equipment diagnostics" },
        { url: AFFILIATE_LINKS.aadvantage, anchor: "AAdvantage Laundry", context: "equipment supplier" },
        { url: AFFILIATE_LINKS.facebookGroup, anchor: "Laundromat Owners Group", context: "community" },
      ],
      status: "published",
      published: true,
      featured: false,
      authorName: "WashBizHub Research Team",
      ogTitle: generated.metaTitle,
      ogDescription: generated.metaDescription,
      twitterCard: "summary_large_image",
      twitterTitle: generated.metaTitle,
      twitterDescription: generated.metaDescription,
      schemaMarkup: generateSchemaMarkup({
        title: generated.title,
        excerpt: generated.excerpt,
        content: contentWithLinks,
        authorName: "WashBizHub Research Team",
        datePublished: new Date(),
        dateModified: new Date(),
        canonicalUrl,
      }),
    });

    return {
      success: true,
      blogId: blogPost.id,
      title: generated.title,
      slug,
    };
  } catch (error: any) {
    console.error(`Failed to generate blog: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function generateForumBlogPost(topic: string): Promise<BlogGenerationResult> {
  try {
    const wordCount = WORD_COUNTS[Math.floor(Math.random() * WORD_COUNTS.length)];
    const generated = await generateForumBlog(topic, wordCount);
    const contentWithLinks = injectForumLinks(generated.content);
    const slug = generateSlug(generated.title);
    const canonicalUrl = generateCanonicalUrl(slug);

    const blogPost = await storage.createBlogPost({
      title: generated.title,
      content: contentWithLinks,
      excerpt: generated.excerpt,
      slug,
      canonicalUrl,
      metaTitle: generated.metaTitle,
      metaDescription: generated.metaDescription,
      focusKeyphrases: generated.focusKeyphrases,
      type: "ai_multi",
      category: "laundromat",
      subcategory: "forum-community",
      market: "us",
      aiProviders: [generated.provider],
      aiQualityScore: 85,
      seoScore: 90,
      linkToCleanbi: true,
      internalLinks: [
        { url: AFFILIATE_LINKS.facebookGroup, anchor: "Laundromat Owners Facebook Group", context: "community" },
        { url: AFFILIATE_LINKS.aadvantage, anchor: "AAdvantage Laundry", context: "equipment" },
        { url: AFFILIATE_LINKS.cleanbi, anchor: "CLEANBI", context: "analysis" },
      ],
      status: "published",
      published: true,
      featured: false,
      authorName: "WashBizHub Community Team",
      schemaMarkup: generateSchemaMarkup({
        title: generated.title,
        excerpt: generated.excerpt,
        content: contentWithLinks,
        authorName: "WashBizHub Community Team",
        datePublished: new Date(),
        dateModified: new Date(),
        canonicalUrl,
      }),
    });

    return {
      success: true,
      blogId: blogPost.id,
      title: generated.title,
      slug,
    };
  } catch (error: any) {
    console.error(`Failed to generate forum blog: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
}

// ========================================
// CHECKPOINT/RESUME SUPPORT
// ========================================

function generateBlogIdentifier(stateCode: string, brandId: string, topicIndex: number): string {
  return `aadvantage-${stateCode.toLowerCase()}-${brandId}-topic${topicIndex}`;
}

function generateForumBlogIdentifier(topicIndex: number): string {
  return `aadvantage-forum-topic${topicIndex}`;
}

async function getExistingBlogSlugs(): Promise<Set<string>> {
  try {
    const existingBlogs = await storage.getBlogPostsBySubcategoryPrefix("state-");
    const forumBlogs = await storage.getBlogPostsBySubcategory("forum-community");
    
    const slugs = new Set<string>();
    
    // Add equipment blog slugs
    for (const blog of existingBlogs) {
      if (blog.subcategory?.startsWith("state-")) {
        slugs.add(blog.slug);
      }
    }
    
    // Add forum blog slugs  
    for (const blog of forumBlogs) {
      slugs.add(blog.slug);
    }
    
    return slugs;
  } catch (error) {
    console.log("Could not fetch existing blogs, starting fresh");
    return new Set<string>();
  }
}

// ========================================
// MAIN BULK GENERATION FUNCTION
// ========================================

export async function generateAllAAdvantageBlogs(
  onProgress?: (progress: BulkGenerationProgress) => void,
  options?: { resume?: boolean; batchSize?: number }
): Promise<BulkGenerationProgress> {
  const resume = options?.resume ?? true;
  const batchSize = options?.batchSize ?? 10;
  
  const progress: BulkGenerationProgress = {
    total: 120,
    completed: 0,
    failed: 0,
    results: [],
  };

  console.log("🚀 Starting AAdvantage Laundry bulk blog generation...");
  console.log(`📝 Generating 100 equipment blogs + 20 forum blogs`);
  console.log(`🔄 Resume mode: ${resume ? "ON" : "OFF"}, Batch size: ${batchSize}`);
  
  // Get existing blog count to check checkpoint
  let existingCount = 0;
  if (resume) {
    try {
      const existingBlogs = await storage.getBlogPostsBySubcategoryPrefix("state-");
      const forumBlogs = await storage.getBlogPostsBySubcategory("forum-community");
      existingCount = existingBlogs.length + forumBlogs.length;
      console.log(`📊 Found ${existingCount} existing AAdvantage blogs`);
    } catch (error) {
      console.log("Could not check existing blogs, starting fresh");
    }
  }

  // Build the full list of blogs to generate
  const equipmentBlogQueue: Array<{state: typeof STATES[0], brand: typeof BRANDS[0], topicTemplate: string, index: number}> = [];
  let blogIndex = 0;
  
  for (const state of STATES) {
    for (const brand of BRANDS) {
      const topicsToUse = EQUIPMENT_TOPICS.slice(0, Math.ceil(100 / (STATES.length * BRANDS.length)));
      
      for (const topicTemplate of topicsToUse) {
        if (blogIndex >= 100) break;
        equipmentBlogQueue.push({ state, brand, topicTemplate, index: blogIndex });
        blogIndex++;
      }
      if (blogIndex >= 100) break;
    }
    if (blogIndex >= 100) break;
  }

  // Skip already-generated equipment blogs if resuming
  let equipmentSkipCount = 0;
  if (resume && existingCount > 0) {
    equipmentSkipCount = Math.min(existingCount, 100);
    console.log(`⏭️  Skipping ${equipmentSkipCount} already-generated equipment blogs`);
  }
  
  // Generate remaining equipment blogs
  const remainingEquipment = equipmentBlogQueue.slice(equipmentSkipCount);
  console.log(`📝 Need to generate ${remainingEquipment.length} equipment blogs`);
  
  let batchCount = 0;
  for (const item of remainingEquipment) {
    const { state, brand, topicTemplate, index } = item;
    
    console.log(`📄 Generating: ${state.name} + ${brand.name} (${index + 1}/100)`);
    
    const result = await generateEquipmentBlog(state, brand, topicTemplate, index);
    progress.results.push(result);
    
    if (result.success) {
      progress.completed++;
      console.log(`✅ Created: ${result.title}`);
    } else {
      progress.failed++;
      console.log(`❌ Failed: ${result.error}`);
    }
    
    const elapsedMinutes = Math.floor((progress.completed + progress.failed + equipmentSkipCount) / 4);
    console.log(`📊 Progress: ${progress.completed + equipmentSkipCount}/120 (${progress.failed} failed) - ${elapsedMinutes} min elapsed`);
    
    onProgress?.(progress);
    
    // Rate limiting - wait between API calls
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    batchCount++;
    
    // Checkpoint every batch - save progress indicator
    if (batchCount >= batchSize) {
      console.log(`💾 Checkpoint: ${progress.completed + equipmentSkipCount} blogs generated`);
      batchCount = 0;
    }
  }

  // Calculate how many forum blogs to skip
  let forumSkipCount = 0;
  if (resume && existingCount > 100) {
    forumSkipCount = Math.min(existingCount - 100, 20);
    console.log(`⏭️  Skipping ${forumSkipCount} already-generated forum blogs`);
  }

  // Generate remaining forum/discussion blogs
  const remainingForumTopics = FORUM_TOPICS.slice(forumSkipCount);
  console.log(`\n📢 Generating ${remainingForumTopics.length} forum/community blogs...`);
  
  batchCount = 0;
  for (let i = 0; i < remainingForumTopics.length; i++) {
    const actualIndex = i + forumSkipCount;
    console.log(`📄 Generating forum blog ${actualIndex + 1}/20`);
    
    const result = await generateForumBlogPost(remainingForumTopics[i]);
    progress.results.push(result);
    
    if (result.success) {
      progress.completed++;
      console.log(`✅ Created: ${result.title}`);
    } else {
      progress.failed++;
      console.log(`❌ Failed: ${result.error}`);
    }
    
    onProgress?.(progress);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    batchCount++;
    if (batchCount >= batchSize) {
      console.log(`💾 Checkpoint: ${100 + actualIndex + 1} blogs generated`);
      batchCount = 0;
    }
  }

  const totalGenerated = progress.completed + equipmentSkipCount + forumSkipCount;
  console.log("\n🎉 Bulk generation complete!");
  console.log(`📊 Results: ${totalGenerated} total, ${progress.completed} new, ${progress.failed} failed`);
  
  return progress;
}

// Export for use in routes
export { STATES, BRANDS, EQUIPMENT_TOPICS, FORUM_TOPICS, AFFILIATE_LINKS };
