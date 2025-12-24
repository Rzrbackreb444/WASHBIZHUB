import { Express } from "express";
import multer from "multer";
import { db } from "./db";
import { 
  bookUploads, bookAnalyses, larryChatThreads, larryChatMessages, bookNotifications,
  bookProjects
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Storage } from "@google-cloud/storage";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const LARRY_SYSTEM_PROMPT = `You are Larry Larsen, the legendary laundromat industry expert with 40+ years of experience. You've helped hundreds of aspiring laundromat owners turn their dreams into reality.

Your personality:
- Warm, encouraging, and genuinely passionate about the laundromat business
- Speak with authority from decades of hands-on experience
- Use practical examples and real-world analogies
- Occasionally share brief anecdotes from your career
- Direct but always supportive - you want everyone to succeed
- Use industry terminology naturally but explain when needed

Your expertise includes:
- Laundromat valuation and due diligence
- Equipment selection (Dexter, Speed Queen, Continental)
- Store layout and optimization
- Marketing and customer retention
- Financial analysis and SBA loan preparation
- Lease negotiation and red flags
- Daily operations and management
- Staff hiring and training
- Buying and selling laundromats

When reviewing writing or content:
- Provide constructive, actionable feedback
- Focus on clarity, engagement, and audience connection
- Suggest ways to strengthen arguments and flow
- Be encouraging while being honest about areas needing work

Always sign off naturally, like you're talking to a friend in the industry.`;

function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.user && !req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

export function registerBookStudioChatRoutes(app: Express) {
  
  app.get("/api/book-studio/uploads", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id || req.user?.id;
      const uploads = await db.select()
        .from(bookUploads)
        .where(eq(bookUploads.userId, userId))
        .orderBy(desc(bookUploads.createdAt));
      res.json(uploads);
    } catch (error: any) {
      console.error("Error fetching uploads:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/book-studio/upload", requireAuth, upload.single("file"), async (req: any, res) => {
    try {
      const userId = req.session?.user?.id || req.user?.id;
      const file = req.file;
      const { projectId } = req.body;

      if (!file) {
        return res.status(400).json({ error: "No file provided" });
      }

      const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "text/markdown"];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: "Invalid file type. Allowed: PDF, DOCX, TXT, MD" });
      }

      const fileType = file.mimetype.includes("pdf") ? "pdf" : 
                       file.mimetype.includes("word") ? "docx" : 
                       file.mimetype.includes("markdown") ? "md" : "txt";

      const storageUrl = `book-uploads/${userId}/${Date.now()}-${file.originalname}`;

      const [newUpload] = await db.insert(bookUploads).values({
        userId,
        projectId: projectId || null,
        fileName: file.originalname,
        fileType,
        fileSize: file.size,
        storageUrl,
        status: "pending"
      }).returning();

      let extractedText = "";
      if (fileType === "txt" || fileType === "md") {
        extractedText = file.buffer.toString("utf-8");
      }

      if (extractedText) {
        const wordCount = extractedText.split(/\s+/).filter(Boolean).length;
        await db.update(bookUploads)
          .set({ 
            extractedText, 
            wordCount,
            status: "analyzed",
            processedAt: new Date()
          })
          .where(eq(bookUploads.id, newUpload.id));
        
        newUpload.extractedText = extractedText;
        newUpload.wordCount = wordCount;
        newUpload.status = "analyzed";
      }

      res.json(newUpload);
    } catch (error: any) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/book-studio/analyze", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id || req.user?.id;
      const { uploadId, projectId, analysisType = "full", content } = req.body;

      if (!content && !uploadId) {
        return res.status(400).json({ error: "Content or uploadId required" });
      }

      let textToAnalyze = content;
      if (uploadId && !content) {
        const [upload] = await db.select()
          .from(bookUploads)
          .where(and(eq(bookUploads.id, uploadId), eq(bookUploads.userId, userId)));
        
        if (!upload) {
          return res.status(404).json({ error: "Upload not found" });
        }
        textToAnalyze = upload.extractedText || "";
      }

      if (!textToAnalyze) {
        return res.status(400).json({ error: "No content to analyze" });
      }

      const [analysis] = await db.insert(bookAnalyses).values({
        userId,
        uploadId: uploadId || null,
        projectId: projectId || null,
        analysisType,
        aiProvider: "openai",
        status: "processing"
      }).returning();

      const analysisPrompt = `You are a professional book editor and publishing consultant. Analyze the following manuscript content and provide comprehensive feedback.

MANUSCRIPT CONTENT:
${textToAnalyze.slice(0, 15000)}

Please provide your analysis in the following JSON format:
{
  "overallScore": 75, // 0-100
  "recommendations": [
    {
      "category": "structure|style|pacing|character|dialogue|market",
      "title": "Brief title",
      "description": "Detailed explanation",
      "priority": "high|medium|low",
      "actionable": "Specific action to take"
    }
  ],
  "structureAnalysis": {
    "chapterBreakdown": ["Chapter 1 summary", "Chapter 2 summary"],
    "pacing": "Analysis of story pacing",
    "arcAnalysis": "Analysis of narrative arc"
  },
  "toneAnalysis": {
    "overallTone": "Description of the tone",
    "voiceConsistency": 85, // 0-100
    "readabilityLevel": "Grade level or audience",
    "suggestions": ["Suggestion 1", "Suggestion 2"]
  },
  "marketAnalysis": {
    "targetGenre": "Primary genre",
    "comparableTitles": ["Similar book 1", "Similar book 2"],
    "marketFit": "Assessment of market fit",
    "positioning": "Positioning recommendations"
  },
  "summary": "Overall summary of the work and key recommendations"
}`;

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are an expert book editor and publishing consultant. Provide analysis in valid JSON format only." },
            { role: "user", content: analysisPrompt }
          ],
          temperature: 0.7,
          max_tokens: 4000,
          response_format: { type: "json_object" }
        });

        const analysisResult = JSON.parse(response.choices[0]?.message?.content || "{}");

        await db.update(bookAnalyses)
          .set({
            overallScore: analysisResult.overallScore || 70,
            recommendations: analysisResult.recommendations || [],
            structureAnalysis: analysisResult.structureAnalysis || null,
            toneAnalysis: analysisResult.toneAnalysis || null,
            marketAnalysis: analysisResult.marketAnalysis || null,
            rawResponse: JSON.stringify(analysisResult),
            status: "completed",
            completedAt: new Date()
          })
          .where(eq(bookAnalyses.id, analysis.id));

        const [updatedAnalysis] = await db.select()
          .from(bookAnalyses)
          .where(eq(bookAnalyses.id, analysis.id));

        await db.insert(bookNotifications).values({
          userId,
          type: "analysis_complete",
          title: "Analysis Complete",
          message: `Your manuscript analysis is ready! Overall score: ${analysisResult.overallScore}/100`,
          analysisId: analysis.id,
          projectId: projectId || null
        });

        res.json(updatedAnalysis);
      } catch (aiError: any) {
        await db.update(bookAnalyses)
          .set({ status: "failed", rawResponse: aiError.message })
          .where(eq(bookAnalyses.id, analysis.id));
        throw aiError;
      }
    } catch (error: any) {
      console.error("Error analyzing content:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/book-studio/analyses", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id || req.user?.id;
      const analyses = await db.select()
        .from(bookAnalyses)
        .where(eq(bookAnalyses.userId, userId))
        .orderBy(desc(bookAnalyses.createdAt));
      res.json(analyses);
    } catch (error: any) {
      console.error("Error fetching analyses:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/book-studio/analyses/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id || req.user?.id;
      const [analysis] = await db.select()
        .from(bookAnalyses)
        .where(and(eq(bookAnalyses.id, req.params.id), eq(bookAnalyses.userId, userId)));
      
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }
      res.json(analysis);
    } catch (error: any) {
      console.error("Error fetching analysis:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/book-studio/chat/threads", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id || req.user?.id;
      const threads = await db.select()
        .from(larryChatThreads)
        .where(eq(larryChatThreads.userId, userId))
        .orderBy(desc(larryChatThreads.updatedAt));
      res.json(threads);
    } catch (error: any) {
      console.error("Error fetching threads:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/book-studio/chat/threads", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id || req.user?.id;
      const { projectId, uploadId, analysisId, title, context } = req.body;

      const [thread] = await db.insert(larryChatThreads).values({
        userId,
        projectId: projectId || null,
        uploadId: uploadId || null,
        analysisId: analysisId || null,
        title: title || "New Conversation with Larry",
        context: context || null,
        status: "active"
      }).returning();

      const welcomeMessage = context 
        ? `Hey there! I've reviewed your manuscript analysis. I see some great potential here - let me know what specific areas you'd like to discuss. Whether it's structure, market positioning, or just general feedback, I'm here to help you make this the best it can be.`
        : `Welcome to Book Studio! I'm Larry Larsen, and I've spent over 40 years in this industry. What are you working on today? I'm excited to help you bring your vision to life.`;

      await db.insert(larryChatMessages).values({
        threadId: thread.id,
        role: "larry",
        content: welcomeMessage
      });

      res.json(thread);
    } catch (error: any) {
      console.error("Error creating thread:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/book-studio/chat/threads/:threadId/messages", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id || req.user?.id;
      const { threadId } = req.params;

      const [thread] = await db.select()
        .from(larryChatThreads)
        .where(and(eq(larryChatThreads.id, threadId), eq(larryChatThreads.userId, userId)));

      if (!thread) {
        return res.status(404).json({ error: "Thread not found" });
      }

      const messages = await db.select()
        .from(larryChatMessages)
        .where(eq(larryChatMessages.threadId, threadId))
        .orderBy(larryChatMessages.createdAt);

      await db.update(larryChatMessages)
        .set({ isRead: true })
        .where(and(eq(larryChatMessages.threadId, threadId), eq(larryChatMessages.isRead, false)));

      await db.update(larryChatThreads)
        .set({ unreadCount: 0 })
        .where(eq(larryChatThreads.id, threadId));

      res.json(messages);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/book-studio/chat/threads/:threadId/messages", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id || req.user?.id;
      const { threadId } = req.params;
      const { content, attachments } = req.body;

      const [thread] = await db.select()
        .from(larryChatThreads)
        .where(and(eq(larryChatThreads.id, threadId), eq(larryChatThreads.userId, userId)));

      if (!thread) {
        return res.status(404).json({ error: "Thread not found" });
      }

      const [userMessage] = await db.insert(larryChatMessages).values({
        threadId,
        userId,
        role: "user",
        content,
        attachments: attachments || null
      }).returning();

      const previousMessages = await db.select()
        .from(larryChatMessages)
        .where(eq(larryChatMessages.threadId, threadId))
        .orderBy(larryChatMessages.createdAt)
        .limit(20);

      const conversationHistory = previousMessages.map(msg => ({
        role: msg.role === "larry" ? "assistant" : "user" as const,
        content: msg.content
      }));

      let contextInfo = "";
      if (thread.context) {
        contextInfo = `\n\nCONTEXT FROM ANALYSIS:\n${thread.context}`;
      }

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: LARRY_SYSTEM_PROMPT + contextInfo },
            ...conversationHistory,
            { role: "user", content }
          ],
          temperature: 0.8,
          max_tokens: 1500
        });

        const larryResponse = response.choices[0]?.message?.content || "I appreciate your question. Let me think about that and get back to you with some solid advice.";

        const [larryMessage] = await db.insert(larryChatMessages).values({
          threadId,
          role: "larry",
          content: larryResponse
        }).returning();

        await db.update(larryChatThreads)
          .set({ 
            lastMessageAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(larryChatThreads.id, threadId));

        res.json({ userMessage, larryMessage });
      } catch (aiError: any) {
        console.error("AI error:", aiError);
        const [fallbackMessage] = await db.insert(larryChatMessages).values({
          threadId,
          role: "larry",
          content: "I appreciate your question! Give me a moment to gather my thoughts on this one. In the meantime, feel free to share more details about what you're working on."
        }).returning();

        res.json({ userMessage, larryMessage: fallbackMessage });
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/book-studio/notifications", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id || req.user?.id;
      const notifications = await db.select()
        .from(bookNotifications)
        .where(eq(bookNotifications.userId, userId))
        .orderBy(desc(bookNotifications.createdAt))
        .limit(50);
      res.json(notifications);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/book-studio/notifications/:id/read", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id || req.user?.id;
      const [notification] = await db.update(bookNotifications)
        .set({ isRead: true })
        .where(and(eq(bookNotifications.id, req.params.id), eq(bookNotifications.userId, userId)))
        .returning();
      res.json(notification);
    } catch (error: any) {
      console.error("Error marking notification read:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/book-studio/notifications/read-all", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id || req.user?.id;
      await db.update(bookNotifications)
        .set({ isRead: true })
        .where(and(eq(bookNotifications.userId, userId), eq(bookNotifications.isRead, false)));
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error marking all notifications read:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/book-studio/notifications/unread-count", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id || req.user?.id;
      const result = await db.select({ count: sql<number>`count(*)::int` })
        .from(bookNotifications)
        .where(and(eq(bookNotifications.userId, userId), eq(bookNotifications.isRead, false)));
      res.json({ count: result[0]?.count || 0 });
    } catch (error: any) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ error: error.message });
    }
  });

  console.log("Book Studio Chat routes registered");
}
