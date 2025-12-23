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
    const { title, subtitle, author, genre, description } = req.body;

    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `Generate a detailed image prompt for a professional book cover:
Title: ${title}
Subtitle: ${subtitle || "None"}
Author: ${author}
Genre: ${genre}
Description: ${description}

Create a detailed prompt for generating a professional, modern book cover. Include:
- Visual style and mood
- Color palette
- Key imagery or symbols
- Typography suggestions
- Overall composition

Format as a single paragraph image generation prompt.`;

      const result = await model.generateContent(prompt);
      const imagePrompt = result.response.text();

      res.json({ 
        imagePrompt,
        message: "Cover prompt generated. Connect to Vertex AI Imagen for image generation.",
        placeholder: `https://placehold.co/600x900/1e293b/c8a661?text=${encodeURIComponent(title)}`
      });
    } else {
      res.json({ 
        placeholder: `https://placehold.co/600x900/1e293b/c8a661?text=${encodeURIComponent(title)}`,
        message: "Cover generation requires Gemini API"
      });
    }
  } catch (error: any) {
    console.error("Cover generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
