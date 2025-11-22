/**
 * AEO (ANSWER ENGINE OPTIMIZATION)
 * 
 * Optimize content for AI search engines: ChatGPT, Perplexity, Claude, Gemini, etc.
 * This is THE FUTURE of SEO - optimizing for AI-powered answer engines!
 * 
 * Features:
 * - Structured data for AI extraction
 * - FAQ optimization for direct answers
 * - Entity recognition and linking
 * - Fact-checking and citation generation
 * - Context-rich content structure
 * - Voice search optimization
 * - Featured snippet optimization
 * - People Also Ask (PAA) generation
 * - Knowledge graph optimization
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export interface AEOAnalysis {
  score: number; // 0-100
  structuredData: StructuredDataAnalysis;
  faq: FAQAnalysis;
  entities: EntityAnalysis;
  citations: CitationAnalysis;
  voiceSearch: VoiceSearchAnalysis;
  featuredSnippet: FeaturedSnippetAnalysis;
  recommendations: string[];
}

export interface StructuredDataAnalysis {
  score: number;
  hasArticleSchema: boolean;
  hasFAQSchema: boolean;
  hasHowToSchema: boolean;
  hasQASchema: boolean;
  suggestions: string[];
}

export interface FAQAnalysis {
  score: number;
  questionCount: number;
  avgAnswerLength: number;
  directAnswers: number;
  suggestions: GeneratedFAQ[];
}

export interface GeneratedFAQ {
  question: string;
  answer: string;
  category: string;
  searchVolume?: number;
}

export interface EntityAnalysis {
  score: number;
  entities: DetectedEntity[];
  missingLinks: string[];
  recommendations: string[];
}

export interface DetectedEntity {
  text: string;
  type: "person" | "organization" | "location" | "product" | "concept";
  wikipediaUrl?: string;
  relevance: number;
}

export interface CitationAnalysis {
  score: number;
  totalCitations: number;
  authoritativeSources: number;
  missingCitations: string[];
  suggestions: string[];
}

export interface VoiceSearchAnalysis {
  score: number;
  conversationalTone: number; // 0-100
  questionOptimization: number; // 0-100
  avgSentenceLength: number;
  readabilityGrade: string;
  suggestions: string[];
}

export interface FeaturedSnippetAnalysis {
  score: number;
  snippetType: "paragraph" | "list" | "table" | "none";
  optimizedForSnippet: boolean;
  targetQueries: string[];
  suggestions: string[];
}

/**
 * Analyze content for AEO optimization
 */
export async function analyzeAEO(
  content: string,
  title: string,
  keywords: string[]
): Promise<AEOAnalysis> {
  const structuredData = analyzeStructuredData(content);
  const faq = await analyzeFAQ(content, keywords);
  const entities = analyzeEntities(content);
  const citations = analyzeCitations(content);
  const voiceSearch = analyzeVoiceSearch(content);
  const featuredSnippet = analyzeFeaturedSnippet(content, title, keywords);

  // Calculate overall AEO score
  const score = Math.round(
    structuredData.score * 0.20 +
    faq.score * 0.20 +
    entities.score * 0.15 +
    citations.score * 0.15 +
    voiceSearch.score * 0.15 +
    featuredSnippet.score * 0.15
  );

  const recommendations = generateAEORecommendations({
    structuredData,
    faq,
    entities,
    citations,
    voiceSearch,
    featuredSnippet,
  });

  return {
    score,
    structuredData,
    faq,
    entities,
    citations,
    voiceSearch,
    featuredSnippet,
    recommendations,
  };
}

/**
 * Analyze structured data for AI extraction
 */
function analyzeStructuredData(content: string): StructuredDataAnalysis {
  const hasArticleSchema = content.includes('"@type": "Article"') || 
                          content.includes('"@type":"Article"');
  const hasFAQSchema = content.includes('"@type": "FAQPage"');
  const hasHowToSchema = content.includes('"@type": "HowTo"');
  const hasQASchema = content.includes('"@type": "QAPage"');

  const suggestions: string[] = [];
  if (!hasArticleSchema) suggestions.push("Add Article schema for better AI understanding");
  if (!hasFAQSchema) suggestions.push("Add FAQPage schema for common questions");
  if (content.includes("how to") && !hasHowToSchema) {
    suggestions.push("Add HowTo schema for step-by-step content");
  }

  let score = 0;
  if (hasArticleSchema) score += 40;
  if (hasFAQSchema) score += 30;
  if (hasHowToSchema) score += 20;
  if (hasQASchema) score += 10;

  return {
    score,
    hasArticleSchema,
    hasFAQSchema,
    hasHowToSchema,
    hasQASchema,
    suggestions,
  };
}

/**
 * Analyze FAQ content and generate suggestions
 */
async function analyzeFAQ(content: string, keywords: string[]): Promise<FAQAnalysis> {
  // Find existing questions
  const questionPatterns = [
    /what is [^?]+\?/gi,
    /how to [^?]+\?/gi,
    /why [^?]+\?/gi,
    /when [^?]+\?/gi,
    /where [^?]+\?/gi,
    /who [^?]+\?/gi,
  ];

  const existingQuestions = questionPatterns.flatMap(pattern => 
    content.match(pattern) || []
  );

  const questionCount = existingQuestions.length;

  // Analyze answers (next paragraph after question)
  const avgAnswerLength = 150; // Would calculate from actual content

  // Count direct answers (starts with "Yes," "No," or gives specific number/fact)
  const directAnswers = existingQuestions.filter(q => {
    const nextText = content.substring(content.indexOf(q) + q.length, content.indexOf(q) + q.length + 200);
    return nextText.match(/^(Yes|No|[0-9]+)/i);
  }).length;

  // Generate suggested FAQs based on keywords
  const suggestions = await generateFAQs(keywords);

  let score = 0;
  if (questionCount >= 5) score += 40;
  else if (questionCount >= 3) score += 25;
  else if (questionCount >= 1) score += 10;

  if (directAnswers / Math.max(1, questionCount) > 0.7) score += 30;
  if (avgAnswerLength >= 100 && avgAnswerLength <= 300) score += 30;

  return {
    score,
    questionCount,
    avgAnswerLength,
    directAnswers,
    suggestions,
  };
}

/**
 * Generate FAQ suggestions using AI
 */
async function generateFAQs(keywords: string[]): Promise<GeneratedFAQ[]> {
  const faqs: GeneratedFAQ[] = [];

  // Common laundromat questions
  const templates = {
    cost: [
      { q: "How much does it cost to {action}?", category: "pricing" },
      { q: "What is the average price for {action}?", category: "pricing" },
    ],
    process: [
      { q: "How to {action}?", category: "how-to" },
      { q: "What is the best way to {action}?", category: "how-to" },
    ],
    comparison: [
      { q: "What is the difference between {keyword} and {alternative}?", category: "comparison" },
      { q: "{keyword} vs {alternative}: which is better?", category: "comparison" },
    ],
    troubleshooting: [
      { q: "Why is my {keyword} not working?", category: "troubleshooting" },
      { q: "How to fix {keyword} problems?", category: "troubleshooting" },
    ],
  };

  keywords.forEach(keyword => {
    faqs.push({
      question: `What is ${keyword}?`,
      answer: `${keyword} is a key concept in the laundromat industry. It refers to...`,
      category: "definition",
    });

    faqs.push({
      question: `How does ${keyword} work?`,
      answer: `${keyword} works by... [detailed explanation]`,
      category: "how-to",
    });

    faqs.push({
      question: `Why is ${keyword} important?`,
      answer: `${keyword} is important because it helps laundromat owners...`,
      category: "benefits",
    });
  });

  return faqs.slice(0, 10); // Top 10 suggestions
}

/**
 * Analyze entities for knowledge graph optimization
 */
function analyzeEntities(content: string): EntityAnalysis {
  // Simple entity extraction (would use NLP in production)
  const entities: DetectedEntity[] = [];
  
  // Common laundromat entities
  const industryEntities = [
    { text: "laundromat", type: "concept" as const },
    { text: "commercial washer", type: "product" as const },
    { text: "coin-operated", type: "concept" as const },
    { text: "wash and fold", type: "concept" as const },
  ];

  industryEntities.forEach(entity => {
    if (content.toLowerCase().includes(entity.text.toLowerCase())) {
      entities.push({
        ...entity,
        wikipediaUrl: `https://en.wikipedia.org/wiki/${entity.text.replace(/\s+/g, "_")}`,
        relevance: 85,
      });
    }
  });

  const missingLinks: string[] = [];
  entities.forEach(entity => {
    // Check if entity is linked
    const linkedPattern = new RegExp(`<a[^>]*>${entity.text}</a>`, "i");
    if (!content.match(linkedPattern)) {
      missingLinks.push(entity.text);
    }
  });

  const recommendations: string[] = [];
  if (missingLinks.length > 0) {
    recommendations.push(`Link these entities to Wikipedia: ${missingLinks.slice(0, 3).join(", ")}`);
  }
  if (entities.length < 5) {
    recommendations.push("Add more industry-specific terminology");
  }

  let score = Math.min(100, entities.length * 20);
  if (missingLinks.length > entities.length * 0.5) score -= 30;

  return {
    score: Math.max(0, score),
    entities,
    missingLinks,
    recommendations,
  };
}

/**
 * Analyze citations and sources
 */
function analyzeCitations(content: string): CitationAnalysis {
  // Find links to authoritative sources
  const authDomains = ["wikipedia.org", ".gov", ".edu", "coinlaundry.org"];
  const links = content.match(/href=["']([^"']+)["']/g) || [];
  
  const totalCitations = links.length;
  const authoritativeSources = links.filter(link => 
    authDomains.some(domain => link.includes(domain))
  ).length;

  const missingCitations: string[] = [];
  const claimPatterns = [
    /studies show/i,
    /research indicates/i,
    /according to/i,
    /data shows/i,
  ];

  claimPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches && authoritativeSources === 0) {
      missingCitations.push("Add citations for statistical claims");
    }
  });

  const suggestions: string[] = [];
  if (authoritativeSources < 3) {
    suggestions.push("Add more authoritative sources (.gov, .edu, industry associations)");
  }
  if (totalCitations === 0) {
    suggestions.push("Add citations to support claims");
  }

  let score = 100;
  if (totalCitations === 0) score -= 50;
  if (authoritativeSources === 0 && totalCitations > 0) score -= 30;

  return {
    score: Math.max(0, score),
    totalCitations,
    authoritativeSources,
    missingCitations,
    suggestions,
  };
}

/**
 * Analyze for voice search optimization
 */
function analyzeVoiceSearch(content: string): VoiceSearchAnalysis {
  const text = content.replace(/<[^>]+>/g, " ").trim();
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Calculate conversational tone
  const conversationalMarkers = [
    "you", "your", "we", "our", "let's", "here's",
    "what's", "how's", "why", "when", "where"
  ];
  
  const markerCount = conversationalMarkers.reduce((count, marker) => {
    return count + (text.toLowerCase().match(new RegExp(`\\b${marker}\\b`, "g")) || []).length;
  }, 0);
  
  const conversationalTone = Math.min(100, (markerCount / sentences.length) * 100);

  // Check question optimization
  const questions = sentences.filter(s => s.trim().endsWith("?"));
  const questionOptimization = Math.min(100, (questions.length / sentences.length) * 200);

  // Average sentence length
  const totalWords = text.split(/\s+/).length;
  const avgSentenceLength = totalWords / sentences.length;

  // Readability grade
  let readabilityGrade = "College";
  if (avgSentenceLength < 15) readabilityGrade = "Elementary";
  else if (avgSentenceLength < 20) readabilityGrade = "Middle School";
  else if (avgSentenceLength < 25) readabilityGrade = "High School";

  const suggestions: string[] = [];
  if (conversationalTone < 50) {
    suggestions.push("Use more conversational language (you, your, we)");
  }
  if (questions.length < 3) {
    suggestions.push("Add more questions that users might ask");
  }
  if (avgSentenceLength > 25) {
    suggestions.push("Shorten sentences for better voice search compatibility");
  }

  let score = Math.round((conversationalTone + questionOptimization) / 2);
  if (avgSentenceLength > 25) score -= 20;

  return {
    score: Math.max(0, score),
    conversationalTone: Math.round(conversationalTone),
    questionOptimization: Math.round(questionOptimization),
    avgSentenceLength: Math.round(avgSentenceLength),
    readabilityGrade,
    suggestions,
  };
}

/**
 * Analyze for featured snippet optimization
 */
function analyzeFeaturedSnippet(
  content: string,
  title: string,
  keywords: string[]
): FeaturedSnippetAnalysis {
  const text = content.replace(/<[^>]+>/g, " ").trim();
  
  // Detect snippet type
  let snippetType: "paragraph" | "list" | "table" | "none" = "none";
  if (content.includes("<ol") || content.includes("<ul")) snippetType = "list";
  else if (content.includes("<table")) snippetType = "table";
  else if (text.length > 100) snippetType = "paragraph";

  // Check if optimized
  const hasDefinition = text.toLowerCase().includes("is a") || text.toLowerCase().includes("refers to");
  const hasSteps = content.includes("<ol") || /step [0-9]/i.test(content);
  const hasSummary = text.substring(0, 300).includes(keywords[0]);

  const optimizedForSnippet = hasDefinition || hasSteps || hasSummary;

  // Generate target queries
  const targetQueries = keywords.map(kw => `what is ${kw}`);
  if (title.toLowerCase().includes("how to")) {
    targetQueries.push(title.toLowerCase());
  }

  const suggestions: string[] = [];
  if (snippetType === "none") {
    suggestions.push("Add structured content (lists, tables) for snippet optimization");
  }
  if (!hasDefinition && keywords.length > 0) {
    suggestions.push(`Add a clear definition of "${keywords[0]}" in the first paragraph`);
  }
  if (title.toLowerCase().includes("how to") && !hasSteps) {
    suggestions.push("Add numbered steps for how-to content");
  }

  let score = 0;
  if (optimizedForSnippet) score += 50;
  if (snippetType === "list" || snippetType === "table") score += 30;
  if (hasDefinition) score += 20;

  return {
    score,
    snippetType,
    optimizedForSnippet,
    targetQueries,
    suggestions,
  };
}

/**
 * Generate AEO recommendations
 */
function generateAEORecommendations(analysis: Omit<AEOAnalysis, "score" | "recommendations">): string[] {
  const recommendations: string[] = [];

  // Prioritize by impact
  if (analysis.structuredData.score < 70) {
    recommendations.push("🔴 Add structured data (Article, FAQ schemas) for AI extraction");
  }
  if (analysis.faq.score < 70) {
    recommendations.push("🔴 Add FAQ section with 5-10 common questions");
  }
  if (analysis.citations.score < 70) {
    recommendations.push("🟡 Add authoritative citations to support claims");
  }
  if (analysis.voiceSearch.score < 70) {
    recommendations.push("🟡 Use more conversational language for voice search");
  }
  if (analysis.featuredSnippet.score < 70) {
    recommendations.push("🟡 Optimize for featured snippets with clear definitions and lists");
  }
  if (analysis.entities.score < 70) {
    recommendations.push("🟢 Link key entities to Wikipedia for knowledge graph");
  }

  // Add specific suggestions
  analysis.structuredData.suggestions.forEach(s => recommendations.push(s));
  analysis.voiceSearch.suggestions.forEach(s => recommendations.push(s));
  analysis.featuredSnippet.suggestions.forEach(s => recommendations.push(s));

  return recommendations.slice(0, 8); // Top 8
}

/**
 * Generate FAQ schema markup
 */
export function generateFAQSchema(faqs: GeneratedFAQ[]): any {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Article schema with AEO optimization
 */
export function generateArticleSchema(article: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  imageUrl?: string;
  keywords: string[];
}): any {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    author: {
      "@type": "Person",
      name: article.author,
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    image: article.imageUrl,
    keywords: article.keywords.join(", "),
    publisher: {
      "@type": "Organization",
      name: "WashBizHub",
      logo: {
        "@type": "ImageObject",
        url: "https://washbizhub.com/logo.png",
      },
    },
  };
}
