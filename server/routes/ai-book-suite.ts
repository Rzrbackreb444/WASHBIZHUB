/**
 * AI BOOK WRITING SUITE
 * 
 * Multi-AI orchestration for book writing:
 * - Claude (Anthropic): Long-form writing, chapters
 * - Perplexity: Real-time research, citations
 * - GPT-4 (OpenAI): Editing, polishing
 * - Grok: Trending topics, current events
 * - Gemini: Data analysis, structure
 * 
 * Publishing:
 * - Google Blogger API: Auto-publish chapters
 * - Google Drive: Save to vault
 * 
 * © 2025 WashBizHub. All Rights Reserved.
 */

import { Router, Request, Response } from "express";
import { requireAuth } from "../services/unified-auth";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { google } from "googleapis";
import { db } from "../db";
import { eq } from "drizzle-orm";

const router = Router();

// Initialize AI clients
const anthropic = process.env.ANTHROPIC_API_KEY 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Book Writing Types
interface ChapterOutline {
  title: string;
  description: string;
  keyPoints: string[];
  targetWordCount: number;
}

interface BookProject {
  id: string;
  title: string;
  author: string;
  description: string;
  targetAudience: string;
  chapters: ChapterOutline[];
  createdAt: Date;
  updatedAt: Date;
}

interface GeneratedChapter {
  title: string;
  content: string;
  wordCount: number;
  citations: string[];
  researchNotes: string[];
  aiModel: string;
  generatedAt: Date;
}

// Research with Perplexity
async function researchTopic(topic: string, context: string): Promise<{facts: string[], citations: string[]}> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    console.log("⚠️ Perplexity API not configured, using fallback research");
    return { facts: [], citations: [] };
  }

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "You are a research assistant. Provide accurate, up-to-date facts with citations. Focus on the laundromat industry when relevant."
          },
          {
            role: "user",
            content: `Research the following topic for a book chapter:\n\nTopic: ${topic}\n\nContext: ${context}\n\nProvide 5-10 key facts with sources/citations. Format as JSON: {"facts": ["fact1", "fact2"], "citations": ["source1", "source2"]}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error("Perplexity API error:", await response.text());
      return { facts: [], citations: [] };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse Perplexity response");
    }
    
    return { facts: [content], citations: [] };
  } catch (error) {
    console.error("Perplexity research error:", error);
    return { facts: [], citations: [] };
  }
}

// Generate chapter with Claude (best for long-form writing)
async function generateChapterWithClaude(
  chapterTitle: string,
  chapterDescription: string,
  keyPoints: string[],
  bookContext: string,
  researchFacts: string[],
  targetWordCount: number
): Promise<string> {
  if (!anthropic) {
    throw new Error("Anthropic API not configured");
  }

  const prompt = `You are writing a chapter for a professional book about the laundromat industry.

BOOK CONTEXT:
${bookContext}

CHAPTER DETAILS:
Title: ${chapterTitle}
Description: ${chapterDescription}
Key Points to Cover:
${keyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}

RESEARCH FACTS TO INCORPORATE:
${researchFacts.length > 0 ? researchFacts.map((f, i) => `- ${f}`).join("\n") : "No specific research provided - use your knowledge of the industry."}

TARGET LENGTH: ${targetWordCount} words

WRITING GUIDELINES:
1. Write in a professional yet accessible tone
2. Include practical examples and actionable advice
3. Use industry-specific terminology where appropriate
4. Structure with clear subheadings
5. Include real-world scenarios when helpful
6. End with key takeaways or action items

Write the complete chapter now:`;

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 8000,
    messages: [
      { role: "user", content: prompt }
    ],
  });

  const textBlock = response.content.find(block => block.type === "text");
  return textBlock ? textBlock.text : "";
}

// Edit and polish with GPT-4
async function editWithGPT4(content: string, style: string = "professional"): Promise<string> {
  if (!openai) {
    console.log("⚠️ OpenAI not configured, returning unedited content");
    return content;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a professional book editor. Your job is to polish and improve the text while maintaining the author's voice. Style: ${style}. Fix any grammatical issues, improve flow, and enhance clarity. Do NOT change the meaning or remove content.`
      },
      {
        role: "user",
        content: `Please edit and polish this chapter:\n\n${content}`
      }
    ],
    max_tokens: 8000,
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content || content;
}

// Get Google Blogger client
async function getBloggerClient() {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  
  if (!serviceAccountJson) {
    throw new Error("Google Service Account not configured for Blogger API");
  }
  
  const credentials = JSON.parse(serviceAccountJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/blogger"],
  });
  
  return google.blogger({ version: "v3", auth });
}

// Publish to Google Blogger
async function publishToBlogger(
  blogId: string,
  title: string,
  content: string,
  labels: string[] = []
): Promise<{ url: string; postId: string } | null> {
  try {
    const blogger = await getBloggerClient();
    
    const response = await blogger.posts.insert({
      blogId,
      requestBody: {
        title,
        content: `<div class="book-chapter">${content.replace(/\n/g, "<br/>")}</div>`,
        labels,
      },
    });

    return {
      url: response.data.url || "",
      postId: response.data.id || "",
    };
  } catch (error: any) {
    console.error("Blogger publish error:", error.message);
    return null;
  }
}

// ============================================================================
// API ROUTES
// ============================================================================

// Generate chapter outline
router.post("/outline", requireAuth, async (req: Request, res: Response) => {
  try {
    const { bookTitle, bookDescription, chapterCount = 10 } = req.body;

    if (!anthropic) {
      return res.status(503).json({ error: "AI service not available" });
    }

    const prompt = `Create a detailed chapter outline for a book:

BOOK TITLE: ${bookTitle}
BOOK DESCRIPTION: ${bookDescription}
NUMBER OF CHAPTERS: ${chapterCount}

For each chapter, provide:
1. Chapter title
2. Brief description (2-3 sentences)
3. 5-7 key points to cover
4. Target word count

Return as JSON array:
[
  {
    "title": "Chapter 1: Title",
    "description": "Description",
    "keyPoints": ["point1", "point2", ...],
    "targetWordCount": 3000
  }
]`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find(block => block.type === "text");
    const text = textBlock ? textBlock.text : "";
    
    // Parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const chapters = JSON.parse(jsonMatch[0]);
      return res.json({ chapters });
    }

    return res.status(500).json({ error: "Failed to generate outline" });
  } catch (error: any) {
    console.error("Outline generation error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Generate a single chapter
router.post("/generate-chapter", requireAuth, async (req: Request, res: Response) => {
  try {
    const {
      chapterTitle,
      chapterDescription,
      keyPoints,
      bookContext,
      targetWordCount = 3000,
      includeResearch = true,
      editAfterGeneration = true,
    } = req.body;

    // Step 1: Research (if enabled)
    let researchFacts: string[] = [];
    let citations: string[] = [];
    
    if (includeResearch) {
      console.log("📚 Researching topic with Perplexity...");
      const research = await researchTopic(chapterTitle, chapterDescription);
      researchFacts = research.facts;
      citations = research.citations;
    }

    // Step 2: Generate with Claude
    console.log("✍️ Generating chapter with Claude...");
    let content = await generateChapterWithClaude(
      chapterTitle,
      chapterDescription,
      keyPoints || [],
      bookContext || "",
      researchFacts,
      targetWordCount
    );

    // Step 3: Edit with GPT-4 (if enabled)
    if (editAfterGeneration && openai) {
      console.log("✏️ Polishing with GPT-4...");
      content = await editWithGPT4(content);
    }

    // Count words
    const wordCount = content.split(/\s+/).length;

    const result: GeneratedChapter = {
      title: chapterTitle,
      content,
      wordCount,
      citations,
      researchNotes: researchFacts,
      aiModel: editAfterGeneration ? "Claude + GPT-4" : "Claude",
      generatedAt: new Date(),
    };

    console.log(`✅ Chapter generated: ${wordCount} words`);
    return res.json(result);
  } catch (error: any) {
    console.error("Chapter generation error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Publish chapter to Blogger
router.post("/publish-blogger", requireAuth, async (req: Request, res: Response) => {
  try {
    const { blogId, title, content, labels } = req.body;

    if (!blogId) {
      return res.status(400).json({ error: "Blog ID required" });
    }

    const result = await publishToBlogger(blogId, title, content, labels);
    
    if (result) {
      return res.json({
        success: true,
        url: result.url,
        postId: result.postId,
      });
    }

    return res.status(500).json({ error: "Failed to publish to Blogger" });
  } catch (error: any) {
    console.error("Blogger publish error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Save to Google Drive
router.post("/save-drive", requireAuth, async (req: Request, res: Response) => {
  try {
    const { folderId, fileName, content, mimeType = "text/plain" } = req.body;

    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      return res.status(503).json({ error: "Google Drive not configured" });
    }

    const credentials = JSON.parse(serviceAccountJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });
    
    const drive = google.drive({ version: "v3", auth });

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: folderId ? [folderId] : undefined,
        mimeType,
      },
      media: {
        mimeType,
        body: content,
      },
    });

    return res.json({
      success: true,
      fileId: response.data.id,
      fileName: response.data.name,
    });
  } catch (error: any) {
    console.error("Drive save error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get AI capabilities status
router.get("/status", async (req: Request, res: Response) => {
  const status = {
    claude: !!anthropic,
    openai: !!openai,
    perplexity: !!process.env.PERPLEXITY_API_KEY,
    grok: !!process.env.GROK_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    blogger: !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
    drive: !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
  };

  return res.json({
    status,
    available: Object.values(status).filter(Boolean).length,
    total: Object.keys(status).length,
  });
});

export default router;
