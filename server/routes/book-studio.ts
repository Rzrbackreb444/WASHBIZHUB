import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } from "docx";
import { z } from "zod";

const router = Router();

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

async function callAI(model: string, prompt: string, systemPrompt?: string): Promise<string> {
  try {
    if (model === "gemini" && genAI) {
      const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      const result = await geminiModel.generateContent(fullPrompt);
      return result.response.text();
    }
    
    if (model === "gpt4" && openai) {
      const messages: any[] = [];
      if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
      messages.push({ role: "user", content: prompt });
      
      const result = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        max_tokens: 4000
      });
      return result.choices[0]?.message?.content || "";
    }
    
    if (model === "claude" && anthropic) {
      const result = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: systemPrompt || "You are a professional book author and editor.",
        messages: [{ role: "user", content: prompt }]
      });
      return (result.content[0] as any).text || "";
    }

    if (model === "grok" && process.env.GROK_API_KEY) {
      const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROK_API_KEY}`
        },
        body: JSON.stringify({
          model: "grok-beta",
          messages: [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            { role: "user", content: prompt }
          ],
          max_tokens: 4000
        })
      });
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    }

    if (model === "perplexity" && process.env.PERPLEXITY_API_KEY) {
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-large-128k-online",
          messages: [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            { role: "user", content: prompt }
          ]
        })
      });
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    }

    if (genAI) {
      const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      const result = await geminiModel.generateContent(fullPrompt);
      return result.response.text();
    }

    throw new Error("No AI model available");
  } catch (error: any) {
    console.error("AI call error:", error);
    throw new Error(`AI generation failed: ${error.message}`);
  }
}

router.post("/generate-outline", async (req, res) => {
  try {
    const { title, description, genre, targetAudience, chapterCount, aiModel } = req.body;

    const prompt = `You are a professional book author creating a detailed book outline.

Book Title: ${title}
Description: ${description}
Genre: ${genre}
Target Audience: ${targetAudience || "General readers"}
Number of Chapters: ${chapterCount || 12}

Create a professional book outline with exactly ${chapterCount || 12} chapters. For each chapter provide:
1. A compelling chapter title
2. A 2-3 sentence description of what the chapter covers
3. 3-5 key points that will be covered

Format your response as JSON:
{
  "chapters": [
    {
      "title": "Chapter title",
      "description": "Brief description of chapter content",
      "keyPoints": ["Point 1", "Point 2", "Point 3"]
    }
  ]
}

IMPORTANT: Return ONLY valid JSON, no markdown formatting.`;

    const result = await callAI(aiModel || "gemini", prompt);
    
    let parsed;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (e) {
      parsed = { chapters: [] };
    }

    res.json(parsed);
  } catch (error: any) {
    console.error("Outline generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/generate-chapter", async (req, res) => {
  try {
    const { 
      bookTitle, bookDescription, chapterTitle, chapterNumber, 
      totalChapters, previousChapter, targetWordCount, genre, 
      targetAudience, aiModel 
    } = req.body;

    const systemPrompt = `You are a professional author writing a ${genre} book. Your writing is:
- Engaging and compelling
- Well-structured with clear paragraphs
- Professional yet accessible
- Rich with practical insights and examples
- Written for ${targetAudience || "general readers"}

Write in a confident, authoritative voice. Use vivid examples and practical advice.`;

    const prompt = `Write Chapter ${chapterNumber} of "${bookTitle}": "${chapterTitle}"

Book Overview: ${bookDescription}

This is chapter ${chapterNumber} of ${totalChapters} total chapters.

${previousChapter ? `The previous chapter ended with: "${previousChapter.substring(0, 500)}..."` : "This is the first chapter."}

Write approximately ${targetWordCount || 3000} words. Include:
- A compelling opening hook
- Clear section headings (use ## for headings)
- Practical examples and insights
- A strong conclusion that leads into the next chapter

Write the full chapter content now:`;

    const content = await callAI(aiModel || "gemini", prompt, systemPrompt);

    const formattedContent = content
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gm, '<p>$1</p>');

    res.json({ 
      content: formattedContent,
      rawContent: content,
      wordCount: content.split(/\s+/).length,
      aiModel: aiModel || "gemini"
    });
  } catch (error: any) {
    console.error("Chapter generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/ai-chat", async (req, res) => {
  try {
    const { message, bookContext, aiModel } = req.body;

    const systemPrompt = `You are an expert book writing assistant. You help authors with:
- Generating content, outlines, and ideas
- Improving writing style and tone
- Suggesting edits and expansions
- Answering questions about book structure

Current book context:
- Title: ${bookContext?.title || "Untitled"}
- Description: ${bookContext?.description || "No description"}
- Current chapter: ${bookContext?.currentChapter || "None selected"}

Be helpful, specific, and practical. Provide actionable advice.`;

    const response = await callAI(aiModel || "gemini", message, systemPrompt);

    res.json({ response });
  } catch (error: any) {
    console.error("AI chat error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/export/docx", async (req, res) => {
  try {
    const { project, format } = req.body;

    const children: any[] = [];

    children.push(
      new Paragraph({
        children: [new TextRun({ text: project.title, bold: true, size: 72 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    );

    if (project.subtitle) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: project.subtitle, size: 36, italics: true })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );
    }

    children.push(
      new Paragraph({
        children: [new TextRun({ text: `By ${project.author}`, size: 28 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 }
      })
    );

    children.push(
      new Paragraph({
        children: [new PageBreak()]
      })
    );

    children.push(
      new Paragraph({
        text: "Table of Contents",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    );

    project.chapters.forEach((chapter: any, i: number) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `${i + 1}. ${chapter.title}`, size: 24 })],
          spacing: { after: 200 }
        })
      );
    });

    children.push(
      new Paragraph({
        children: [new PageBreak()]
      })
    );

    project.chapters.forEach((chapter: any, i: number) => {
      children.push(
        new Paragraph({
          text: `Chapter ${i + 1}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        })
      );

      children.push(
        new Paragraph({
          text: chapter.title,
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 400 }
        })
      );

      const parseHtmlToDocxParagraphs = (html: string): any[] => {
        const results: any[] = [];
        const blocks = html.split(/<\/(?:p|h[123]|ul|ol|li)>/gi);
        
        blocks.forEach(block => {
          block = block.trim();
          if (!block) return;
          
          const h1Match = block.match(/<h1[^>]*>(.*)/i);
          const h2Match = block.match(/<h2[^>]*>(.*)/i);
          const h3Match = block.match(/<h3[^>]*>(.*)/i);
          const pMatch = block.match(/<p[^>]*>(.*)/i) || block.match(/^([^<]+)$/);
          
          if (h1Match) {
            results.push(new Paragraph({
              text: h1Match[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' '),
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 }
            }));
          } else if (h2Match) {
            results.push(new Paragraph({
              text: h2Match[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' '),
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 150 }
            }));
          } else if (h3Match) {
            results.push(new Paragraph({
              text: h3Match[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' '),
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 }
            }));
          } else if (pMatch) {
            const content = pMatch[1] || block;
            const textRuns: any[] = [];
            let remaining = content;
            
            const strongRegex = /<strong>(.*?)<\/strong>/gi;
            const emRegex = /<em>(.*?)<\/em>/gi;
            
            let cleanText = remaining
              .replace(/<strong>(.*?)<\/strong>/gi, (_, text) => `**${text}**`)
              .replace(/<em>(.*?)<\/em>/gi, (_, text) => `__${text}__`)
              .replace(/<[^>]+>/g, '')
              .replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>');
            
            const parts = cleanText.split(/(\*\*.*?\*\*|__.*?__)/);
            parts.forEach(part => {
              if (part.startsWith('**') && part.endsWith('**')) {
                textRuns.push(new TextRun({ text: part.slice(2, -2), bold: true, size: 24 }));
              } else if (part.startsWith('__') && part.endsWith('__')) {
                textRuns.push(new TextRun({ text: part.slice(2, -2), italics: true, size: 24 }));
              } else if (part.trim()) {
                textRuns.push(new TextRun({ text: part, size: 24 }));
              }
            });
            
            if (textRuns.length > 0) {
              results.push(new Paragraph({
                children: textRuns,
                spacing: { after: 200 },
                alignment: AlignmentType.LEFT
              }));
            }
          }
        });
        
        return results;
      };
      
      const contentParagraphs = parseHtmlToDocxParagraphs(chapter.content);
      contentParagraphs.forEach(para => children.push(para));

      children.push(
        new Paragraph({
          children: [new PageBreak()]
        })
      );
    });

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${project.title.replace(/[^a-z0-9]/gi, '_')}.docx"`);
    res.send(buffer);
  } catch (error: any) {
    console.error("DOCX export error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/export/pdf", async (req, res) => {
  try {
    const { project } = req.body;

    let html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    @page { size: 6in 9in; margin: 1in; }
    body { font-family: Georgia, serif; font-size: 12pt; line-height: 1.6; }
    h1 { font-size: 24pt; text-align: center; margin-top: 2in; }
    h2 { font-size: 18pt; page-break-before: always; }
    h3 { font-size: 14pt; }
    p { text-indent: 0.5in; margin: 0 0 0.5em 0; }
    .title-page { text-align: center; page-break-after: always; }
    .author { font-size: 14pt; margin-top: 1in; }
    .toc { page-break-after: always; }
    .chapter { page-break-before: always; }
  </style>
</head>
<body>
  <div class="title-page">
    <h1>${project.title}</h1>
    ${project.subtitle ? `<p style="font-size: 16pt; font-style: italic;">${project.subtitle}</p>` : ""}
    <p class="author">By ${project.author}</p>
  </div>
  
  <div class="toc">
    <h2>Table of Contents</h2>
    ${project.chapters.map((ch: any, i: number) => `<p>${i + 1}. ${ch.title}</p>`).join("\n")}
  </div>
`;

    project.chapters.forEach((chapter: any, i: number) => {
      const content = chapter.content
        .replace(/<h2>(.*?)<\/h2>/gi, '<h3>$1</h3>')
        .replace(/<h1>(.*?)<\/h1>/gi, '<h3>$1</h3>');
      
      html += `
  <div class="chapter">
    <h2>Chapter ${i + 1}: ${chapter.title}</h2>
    ${content}
  </div>
`;
    });

    html += "</body></html>";

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Content-Disposition", `attachment; filename="${project.title.replace(/[^a-z0-9]/gi, '_')}.html"`);
    res.send(html);
  } catch (error: any) {
    console.error("PDF export error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/generate-cover", async (req, res) => {
  try {
    const { title, subtitle, author, genre, description, generateImage } = req.body;

    // Step 1: Generate optimized image prompt using Gemini
    let imagePrompt = "";
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const promptRequest = `Generate a detailed image prompt for a professional book cover:
Title: ${title}
Subtitle: ${subtitle || "None"}
Author: ${author}
Genre: ${genre}
Description: ${description}

Create a detailed prompt for generating a professional, modern book cover. Include:
- Visual style and mood (modern, professional, eye-catching)
- Color palette (specific colors that match the genre)
- Key imagery or symbols (no text, just visual elements)
- Overall composition (book cover format, 2:3 aspect ratio)

IMPORTANT: Do NOT include any text or typography in the image - the title and author will be added separately.
Format as a single paragraph image generation prompt optimized for DALL-E.`;

      const result = await model.generateContent(promptRequest);
      imagePrompt = result.response.text();
    } else {
      imagePrompt = `Professional book cover design for "${title}" in the ${genre} genre. Modern, clean composition with relevant imagery. No text.`;
    }

    // Step 2: Generate actual image using DALL-E 3 if requested
    let coverImageUrl = `https://placehold.co/600x900/1e293b/c8a661?text=${encodeURIComponent(title)}`;
    let imageGenerated = false;

    if (generateImage && openai) {
      try {
        console.log("📚 Generating book cover with DALL-E 3...");
        const dalleResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: `${imagePrompt}. Professional book cover design, portrait orientation (2:3 ratio), high quality, suitable for print. DO NOT include any text, letters, words, or typography in the image.`,
          n: 1,
          size: "1024x1792", // Portrait for book covers
          quality: "hd",
          style: "vivid"
        });

        if (dalleResponse.data?.[0]?.url) {
          coverImageUrl = dalleResponse.data[0].url;
          imageGenerated = true;
          console.log("✅ Book cover generated successfully");
        }
      } catch (dalleError: any) {
        console.error("DALL-E generation failed:", dalleError.message);
        // Fall back to placeholder
      }
    }

    res.json({ 
      imagePrompt,
      coverImageUrl,
      imageGenerated,
      message: imageGenerated 
        ? "Cover image generated successfully!" 
        : generateImage 
          ? "Image generation failed - using placeholder" 
          : "Cover prompt ready. Click 'Generate Image' to create the cover."
    });
  } catch (error: any) {
    console.error("Cover generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Generate interior illustrations for chapters
router.post("/generate-illustration", async (req, res) => {
  try {
    const { chapterTitle, chapterContent, style, bookGenre } = req.body;

    if (!openai) {
      return res.status(400).json({ error: "Image generation requires OpenAI API" });
    }

    // Generate illustration prompt
    let illustrationPrompt = "";
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(`
Create a brief image generation prompt for a book illustration:
Chapter: ${chapterTitle}
Genre: ${bookGenre}
Content summary: ${chapterContent?.substring(0, 500)}
Style: ${style || "modern illustration"}

Generate a single paragraph prompt for DALL-E that captures the essence of this chapter.
The illustration should be suitable for a book interior. No text in the image.`);
      illustrationPrompt = result.response.text();
    } else {
      illustrationPrompt = `Book illustration for chapter "${chapterTitle}" in ${style || "modern"} style. ${bookGenre} genre. No text.`;
    }

    // Generate with DALL-E
    const dalleResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${illustrationPrompt}. Book interior illustration, clean and professional. NO text, letters, or words.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural"
    });

    const imageUrl = dalleResponse.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error("Failed to generate illustration");
    }

    res.json({
      imageUrl,
      prompt: illustrationPrompt,
      message: "Illustration generated successfully"
    });
  } catch (error: any) {
    console.error("Illustration generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Batch production pipeline - create multiple books from templates
router.post("/batch-create", async (req, res) => {
  try {
    const { books, generateOutlines, generateChapters } = req.body;
    
    if (!Array.isArray(books) || books.length === 0) {
      return res.status(400).json({ error: "No books provided" });
    }

    const results: any[] = [];
    const errors: any[] = [];

    for (const book of books) {
      try {
        const bookResult: any = {
          title: book.title,
          description: book.description,
          genre: book.genre,
          chapters: []
        };

        // Generate outline if requested
        if (generateOutlines && genAI) {
          const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
          const outlinePrompt = `Create a detailed chapter outline for a book:
Title: ${book.title}
Genre: ${book.genre || "Non-Fiction"}
Description: ${book.description}
Number of chapters: ${book.chapterCount || 10}

Return ONLY valid JSON in this exact format:
{
  "chapters": [
    {"title": "Chapter Title", "description": "Brief description", "keyPoints": ["point1", "point2"]}
  ]
}`;
          
          const result = await model.generateContent(outlinePrompt);
          const text = result.response.text();
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const outline = JSON.parse(jsonMatch[0]);
            bookResult.chapters = outline.chapters;
          }
        }

        // Generate chapter content if requested
        if (generateChapters && bookResult.chapters.length > 0) {
          for (let i = 0; i < Math.min(bookResult.chapters.length, 3); i++) { // Limit to first 3 chapters in batch
            const chapter = bookResult.chapters[i];
            const chapterPrompt = `Write Chapter ${i + 1} of the book "${book.title}".
Chapter Title: ${chapter.title}
Description: ${chapter.description}
Key Points: ${chapter.keyPoints?.join(", ")}

Write approximately 1500 words. Format with HTML tags (<h2>, <h3>, <p>, <strong>, <em>).`;

            const response = await callAI(book.aiModel || "gemini", chapterPrompt);
            bookResult.chapters[i].content = response;
          }
        }

        results.push(bookResult);
      } catch (bookError: any) {
        errors.push({ title: book.title, error: bookError.message });
      }
    }

    res.json({
      success: true,
      totalBooks: books.length,
      completed: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (error: any) {
    console.error("Batch creation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get batch job status
router.get("/batch-status/:jobId", async (req, res) => {
  // In production, this would check a job queue like BullMQ
  res.json({
    jobId: req.params.jobId,
    status: "completed",
    message: "Batch processing complete"
  });
});

// Template library for quick book creation
router.get("/templates", async (req, res) => {
  const templates = [
    {
      id: "business-guide",
      name: "Business Guide",
      description: "Comprehensive guide template for business topics",
      chapterCount: 12,
      genres: ["Business", "Finance", "Entrepreneurship"],
      structure: ["Introduction", "Foundation", "Strategy", "Implementation", "Case Studies", "Advanced Tactics", "Tools & Resources", "Common Mistakes", "Success Stories", "Future Trends", "Action Plan", "Conclusion"]
    },
    {
      id: "how-to-manual",
      name: "How-To Manual",
      description: "Step-by-step instructional guide",
      chapterCount: 10,
      genres: ["Self-Help", "Education", "Technical"],
      structure: ["Getting Started", "Essential Tools", "Basic Techniques", "Intermediate Skills", "Advanced Methods", "Troubleshooting", "Best Practices", "Expert Tips", "Resources", "Next Steps"]
    },
    {
      id: "industry-bible",
      name: "Industry Bible",
      description: "Comprehensive industry reference guide",
      chapterCount: 15,
      genres: ["Business", "Reference", "Professional"],
      structure: ["Industry Overview", "History & Evolution", "Key Players", "Market Analysis", "Operations", "Financial Management", "Marketing & Sales", "Technology", "Legal & Compliance", "Human Resources", "Growth Strategies", "Risk Management", "Future Outlook", "Resources", "Glossary"]
    },
    {
      id: "memoir-template",
      name: "Personal Memoir",
      description: "Life story and personal journey template",
      chapterCount: 12,
      genres: ["Memoir", "Biography", "Inspiration"],
      structure: ["Early Life", "Formative Years", "Turning Points", "Challenges", "Breakthroughs", "Lessons Learned", "Key Relationships", "Professional Journey", "Personal Growth", "Legacy", "Reflections", "Looking Forward"]
    }
  ];

  res.json(templates);
});

export default router;
