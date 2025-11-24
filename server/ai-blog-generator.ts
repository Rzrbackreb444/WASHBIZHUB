import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ========================================
// MULTI-AI BLOG GENERATION ENGINE
// ========================================

interface BlogGenerationRequest {
  keyword: string;
  category: "business_buying" | "real_estate" | "laundromat";
  subcategory?: string;
  targetWordCount: number;
  tone: "professional" | "conversational" | "authoritative";
}

interface BlogContent {
  title: string;
  content: string; // HTML content
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyphrases: string[];
  provider: string;
  qualityScore: number;
  allProviders?: string[]; // Track all providers that contributed
}

// Initialize AI clients
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ========================================
// ANTHROPIC (CLAUDE) - LONG-FORM EXPERT
// ========================================

async function generateWithAnthropic(request: BlogGenerationRequest): Promise<BlogContent> {
  const prompt = `You are an expert content writer specializing in ${request.category.replace('_', ' ')}. 

Write a comprehensive, SEO-optimized blog post about: "${request.keyword}"

Requirements:
- Target word count: ${request.targetWordCount} words
- Tone: ${request.tone}
- Include actionable insights and data-driven analysis
- Structure: Introduction, 3-5 main sections with H2 headings, Conclusion
- Add internal opportunities to link to a "property analysis tool" (CLEANBI)
- Use semantic HTML tags (h2, h3, p, ul, ol, strong, em)
- Include compelling examples and case studies

Return the response in this EXACT JSON format:
{
  "title": "Main H1 title (50-60 characters)",
  "metaTitle": "SEO meta title with keyword (50-60 chars)",
  "metaDescription": "Compelling meta description with CTA (150-160 chars)",
  "excerpt": "Brief summary for preview (150-160 chars)",
  "content": "Full HTML content with semantic tags",
  "focusKeyphrases": ["primary keyword", "secondary keyword 1", "secondary keyword 2"]
}`;

  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 4000,
    messages: [{
      role: "user",
      content: prompt
    }]
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  
  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse Anthropic response');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  
  return {
    title: parsed.title,
    content: parsed.content,
    excerpt: parsed.excerpt,
    metaTitle: parsed.metaTitle,
    metaDescription: parsed.metaDescription,
    focusKeyphrases: parsed.focusKeyphrases,
    provider: 'anthropic',
    qualityScore: calculateQualityScore(parsed.content, request.targetWordCount)
  };
}

// ========================================
// GEMINI - RESEARCH & DATA ANALYSIS
// ========================================

async function generateWithGemini(request: BlogGenerationRequest): Promise<BlogContent> {
  const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are a research-focused content writer specializing in ${request.category.replace('_', ' ')}.

Write a data-driven, well-researched blog post about: "${request.keyword}"

Requirements:
- Target word count: ${request.targetWordCount} words
- Tone: ${request.tone}
- Include statistics, market data, and factual analysis
- Structure: Introduction, 3-5 main sections with H2 headings, Conclusion
- Mention opportunities to use a "property analysis tool" for due diligence
- Use semantic HTML tags (h2, h3, p, ul, ol, strong, em)
- Focus on accuracy and credibility

Return ONLY valid JSON in this format:
{
  "title": "Main H1 title (50-60 characters)",
  "metaTitle": "SEO meta title with keyword (50-60 chars)",
  "metaDescription": "Compelling meta description with CTA (150-160 chars)",
  "excerpt": "Brief summary for preview (150-160 chars)",
  "content": "Full HTML content with semantic tags",
  "focusKeyphrases": ["primary keyword", "secondary keyword 1", "secondary keyword 2"]
}`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  
  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse Gemini response');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  
  return {
    title: parsed.title,
    content: parsed.content,
    excerpt: parsed.excerpt,
    metaTitle: parsed.metaTitle,
    metaDescription: parsed.metaDescription,
    focusKeyphrases: parsed.focusKeyphrases,
    provider: 'gemini',
    qualityScore: calculateQualityScore(parsed.content, request.targetWordCount)
  };
}

// ========================================
// PERPLEXITY - FACT-BASED ARTICLES
// ========================================

async function generateWithPerplexity(request: BlogGenerationRequest): Promise<BlogContent> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [{
        role: 'user',
        content: `You are a fact-checking content writer specializing in ${request.category.replace('_', ' ')}.

Write a factual, citation-worthy blog post about: "${request.keyword}"

Requirements:
- Target word count: ${request.targetWordCount} words
- Tone: ${request.tone}
- Use current, verifiable information
- Structure: Introduction, 3-5 main sections with H2 headings, Conclusion
- Reference a "property analysis tool" for readers to analyze opportunities
- Use semantic HTML tags (h2, h3, p, ul, ol, strong, em)
- Prioritize accuracy and timeliness

Return ONLY valid JSON:
{
  "title": "Main H1 title (50-60 characters)",
  "metaTitle": "SEO meta title with keyword (50-60 chars)",
  "metaDescription": "Compelling meta description with CTA (150-160 chars)",
  "excerpt": "Brief summary for preview (150-160 chars)",
  "content": "Full HTML content with semantic tags",
  "focusKeyphrases": ["primary keyword", "secondary keyword 1", "secondary keyword 2"]
}`
      }],
      max_tokens: 4000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Handle both string and array content formats
  let responseText: string;
  const messageContent = data.choices[0].message.content;
  
  if (Array.isArray(messageContent)) {
    // Content is array of segments (newer API format with citations)
    responseText = messageContent
      .filter((segment: any) => {
        // Only include text segments, skip citations/references
        if (typeof segment === 'string') return true;
        if (segment.type === 'text') return true;
        // Log skipped segments for debugging
        if (segment.type) {
          console.log(`Skipping Perplexity segment type: ${segment.type}`);
        }
        return false;
      })
      .map((segment: any) => 
        typeof segment === 'string' ? segment : (segment.text || '')
      )
      .join('');
  } else {
    // Content is plain string (older API format)
    responseText = messageContent;
  }
  
  // Validate we have content
  if (!responseText || responseText.trim().length === 0) {
    throw new Error('Perplexity returned empty content');
  }
  
  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse Perplexity response - no JSON found');
  }

  // Validate JSON before parsing
  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (parseError: any) {
    throw new Error(`Perplexity JSON parse failed: ${parseError.message}`);
  }
  
  return {
    title: parsed.title,
    content: parsed.content,
    excerpt: parsed.excerpt,
    metaTitle: parsed.metaTitle,
    metaDescription: parsed.metaDescription,
    focusKeyphrases: parsed.focusKeyphrases,
    provider: 'perplexity',
    qualityScore: calculateQualityScore(parsed.content, request.targetWordCount)
  };
}

// ========================================
// GROK - TRENDING INSIGHTS
// ========================================

async function generateWithGrok(request: BlogGenerationRequest): Promise<BlogContent> {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'grok-beta',
      messages: [{
        role: 'user',
        content: `You are a trend-aware content writer specializing in ${request.category.replace('_', ' ')}.

Write an engaging, current-trend-focused blog post about: "${request.keyword}"

Requirements:
- Target word count: ${request.targetWordCount} words
- Tone: ${request.tone}
- Include latest market trends and emerging patterns
- Structure: Introduction, 3-5 main sections with H2 headings, Conclusion
- Suggest using a "property analysis tool" for data-driven decisions
- Use semantic HTML tags (h2, h3, p, ul, ol, strong, em)
- Be engaging and forward-looking

Return ONLY valid JSON:
{
  "title": "Main H1 title (50-60 characters)",
  "metaTitle": "SEO meta title with keyword (50-60 chars)",
  "metaDescription": "Compelling meta description with CTA (150-160 chars)",
  "excerpt": "Brief summary for preview (150-160 chars)",
  "content": "Full HTML content with semantic tags",
  "focusKeyphrases": ["primary keyword", "secondary keyword 1", "secondary keyword 2"]
}`
      }],
      max_tokens: 4000,
      temperature: 0.8
    })
  });

  if (!response.ok) {
    throw new Error(`Grok API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Handle both string and array content formats
  let responseText: string;
  const messageContent = data.choices[0].message.content;
  
  if (Array.isArray(messageContent)) {
    // Content is array of segments (newer API format with citations)
    responseText = messageContent
      .filter((segment: any) => {
        // Only include text segments, skip citations/references
        if (typeof segment === 'string') return true;
        if (segment.type === 'text') return true;
        // Log skipped segments for debugging
        if (segment.type) {
          console.log(`Skipping Grok segment type: ${segment.type}`);
        }
        return false;
      })
      .map((segment: any) => 
        typeof segment === 'string' ? segment : (segment.text || '')
      )
      .join('');
  } else {
    // Content is plain string (older API format)
    responseText = messageContent;
  }
  
  // Validate we have content
  if (!responseText || responseText.trim().length === 0) {
    throw new Error('Grok returned empty content');
  }
  
  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse Grok response - no JSON found');
  }

  // Validate JSON before parsing
  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (parseError: any) {
    throw new Error(`Grok JSON parse failed: ${parseError.message}`);
  }
  
  return {
    title: parsed.title,
    content: parsed.content,
    excerpt: parsed.excerpt,
    metaTitle: parsed.metaTitle,
    metaDescription: parsed.metaDescription,
    focusKeyphrases: parsed.focusKeyphrases,
    provider: 'grok',
    qualityScore: calculateQualityScore(parsed.content, request.targetWordCount)
  };
}

// ========================================
// QUALITY SCORING ALGORITHM
// ========================================

function calculateQualityScore(content: string, targetWordCount: number): number {
  let score = 100;
  
  // Word count check (±20% tolerance)
  const wordCount = content.split(/\s+/).length;
  const wordCountDiff = Math.abs(wordCount - targetWordCount) / targetWordCount;
  if (wordCountDiff > 0.2) {
    score -= 20;
  } else if (wordCountDiff > 0.1) {
    score -= 10;
  }
  
  // HTML structure check
  if (!content.includes('<h2>')) score -= 15;
  if (!content.includes('<p>')) score -= 10;
  if (!content.includes('<ul>') && !content.includes('<ol>')) score -= 5;
  
  // Content depth check
  const paragraphs = content.split('</p>').length - 1;
  if (paragraphs < 5) score -= 10;
  
  // Readability check (simple heuristic)
  const avgWordLength = content.replace(/<[^>]*>/g, '').split(/\s+/).reduce((sum, word) => sum + word.length, 0) / wordCount;
  if (avgWordLength > 7) score -= 5; // Too complex
  if (avgWordLength < 4) score -= 5; // Too simple
  
  return Math.max(0, Math.min(100, score));
}

// ========================================
// MULTI-AI ORCHESTRATION
// ========================================

export async function generateBlogWithMultiAI(request: BlogGenerationRequest): Promise<BlogContent> {
  console.log(`🤖 Generating blog for keyword: "${request.keyword}" using 4 AI providers...`);
  
  // Generate from all providers in parallel (Promise.allSettled handles failures gracefully)
  const results = await Promise.allSettled([
    generateWithAnthropic(request),
    generateWithGemini(request),
    generateWithPerplexity(request),
    generateWithGrok(request)
  ]);
  
  // Extract successful results and log failures
  const successfulResults: BlogContent[] = [];
  const failedProviders: string[] = [];
  
  results.forEach((result, index) => {
    const providerName = ['anthropic', 'gemini', 'perplexity', 'grok'][index];
    
    if (result.status === 'fulfilled') {
      successfulResults.push(result.value);
    } else {
      console.warn(`⚠️  ${providerName} failed: ${result.reason.message}`);
      failedProviders.push(providerName);
    }
  });
  
  const allProviders = successfulResults.map(r => r.provider);
  
  if (successfulResults.length === 0) {
    throw new Error(`All AI providers failed. Errors: ${failedProviders.join(', ')}`);
  }
  
  // Sort by quality score (highest first)
  successfulResults.sort((a, b) => b.qualityScore - a.qualityScore);
  
  const bestResult = successfulResults[0];
  
  console.log(`✅ Generated ${successfulResults.length}/4 blogs. Best: ${bestResult.provider} (score: ${bestResult.qualityScore})`);
  if (failedProviders.length > 0) {
    console.log(`⚠️  Failed providers: ${failedProviders.join(', ')}`);
  }
  
  // Add all providers metadata to best result
  bestResult.allProviders = allProviders;
  
  return bestResult;
}

// ========================================
// BATCH BLOG GENERATION
// ========================================

export async function generateBlogsInBatch(keywords: string[], category: BlogGenerationRequest['category']): Promise<BlogContent[]> {
  console.log(`📚 Batch generating ${keywords.length} blogs for ${category}...`);
  
  const blogs: BlogContent[] = [];
  
  // Generate 5 at a time to avoid rate limits
  for (let i = 0; i < keywords.length; i += 5) {
    const batch = keywords.slice(i, i + 5);
    
    const batchResults = await Promise.allSettled(
      batch.map(keyword => generateBlogWithMultiAI({
        keyword,
        category,
        targetWordCount: 1500,
        tone: 'professional'
      }))
    );
    
    const successfulBlogs = batchResults
      .filter((result): result is PromiseFulfilledResult<BlogContent> => result.status === 'fulfilled')
      .map(result => result.value);
    
    blogs.push(...successfulBlogs);
    
    console.log(`✅ Batch ${Math.floor(i / 5) + 1} complete: ${successfulBlogs.length}/${batch.length} successful`);
    
    // Rate limit protection: wait 2 seconds between batches
    if (i + 5 < keywords.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return blogs;
}
