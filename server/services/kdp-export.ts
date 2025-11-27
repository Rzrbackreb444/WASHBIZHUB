/**
 * KDP Book Export Service
 * Exports books to Kindle Direct Publishing (KDP) ready formats
 * 
 * Supports:
 * - PDF with proper KDP formatting (6x9 trim, margins, pagination)
 * - DOCX with heading styles and TOC
 */

import jsPDF from "jspdf";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  PageBreak,
  TableOfContents,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  Tab,
  TabStopPosition,
  TabStopType,
  BorderStyle,
} from "docx";
import type { ContentProject } from "@shared/schema";

// KDP Standard Dimensions
const KDP_CONFIG = {
  // 6x9 inch trim size (standard trade paperback)
  TRIM_WIDTH_INCHES: 6,
  TRIM_HEIGHT_INCHES: 9,
  
  // Minimum margins for KDP (0.5 inch)
  MARGIN_INCHES: 0.5,
  
  // Gutter margin (inside margin, larger for binding)
  GUTTER_INCHES: 0.75,
  
  // Font settings
  BODY_FONT_SIZE: 11,
  HEADING_FONT_SIZE: 18,
  TITLE_FONT_SIZE: 28,
  SUBTITLE_FONT_SIZE: 16,
  
  // Fonts (Georgia-like serif)
  BODY_FONT: "times", // jsPDF built-in serif font
  HEADING_FONT: "times",
  
  // Lines per page estimate (for pagination)
  LINES_PER_PAGE: 35,
  WORDS_PER_LINE: 10,
  WORDS_PER_PAGE: 250,
};

// Convert inches to PDF points (72 points per inch)
const inchesToPoints = (inches: number) => inches * 72;

// Convert inches to DOCX twips (1440 twips per inch)
const inchesToTwips = (inches: number) => Math.round(inches * 1440);

export interface KdpExportOptions {
  includeTableOfContents?: boolean;
  includeCopyrightPage?: boolean;
  includeAuthorBio?: boolean;
  authorBio?: string;
  copyrightYear?: number;
  publisherName?: string;
  isbn?: string;
}

export interface ExportResult {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  pageCount: number;
  wordCount: number;
}

/**
 * Calculate word count from text content
 */
export function calculateWordCount(text: string): number {
  if (!text) return 0;
  // Remove HTML tags and count words
  const cleanText = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return cleanText.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Calculate total word count for a project
 */
export function calculateProjectWordCount(project: ContentProject): number {
  const chapters = project.content?.chapters || [];
  return chapters.reduce((total, chapter) => {
    return total + calculateWordCount(chapter.content);
  }, 0);
}

/**
 * Estimate page count based on word count (KDP standard)
 */
export function estimatePageCount(wordCount: number): number {
  // Approximately 250 words per 6x9 page with standard margins
  const contentPages = Math.ceil(wordCount / KDP_CONFIG.WORDS_PER_PAGE);
  // Add front matter pages (title, copyright, TOC)
  const frontMatter = 4;
  return contentPages + frontMatter;
}

/**
 * Generate ISBN-13 barcode placeholder text
 */
export function generateIsbnPlaceholder(isbn?: string): string {
  if (isbn) {
    // Validate ISBN-13 format
    const cleaned = isbn.replace(/[-\s]/g, "");
    if (cleaned.length === 13 && /^\d+$/.test(cleaned)) {
      return `ISBN-13: ${cleaned.slice(0, 3)}-${cleaned.slice(3, 4)}-${cleaned.slice(4, 9)}-${cleaned.slice(9, 12)}-${cleaned.slice(12)}`;
    }
  }
  return "ISBN-13: [To be assigned by KDP]";
}

/**
 * Format author bio section
 */
export function formatAuthorBio(author: string, bio?: string): string {
  if (!bio) {
    return `${author} is an industry expert and author. Visit their website for more information.`;
  }
  return bio;
}

/**
 * Generate copyright page text
 */
export function generateCopyrightText(
  title: string,
  author: string,
  year?: number,
  isbn?: string,
  publisher?: string
): string[] {
  const copyrightYear = year || new Date().getFullYear();
  const publisherLine = publisher || "Self-Published";
  
  return [
    title,
    "",
    `Copyright © ${copyrightYear} ${author}`,
    "",
    "All rights reserved. No part of this publication may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the publisher, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.",
    "",
    `Published by ${publisherLine}`,
    "",
    generateIsbnPlaceholder(isbn),
    "",
    "First Edition",
    "",
    "Printed in the United States of America",
  ];
}

/**
 * Strip HTML tags from content for PDF/DOCX
 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim();
}

/**
 * Export project to PDF with KDP formatting
 */
export async function exportToPdf(
  project: ContentProject,
  options: KdpExportOptions = {}
): Promise<ExportResult> {
  const {
    includeTableOfContents = true,
    includeCopyrightPage = true,
    includeAuthorBio = false,
    authorBio,
    copyrightYear,
    publisherName,
    isbn,
  } = options;

  const chapters = project.content?.chapters || [];
  const kdpSettings = project.kdpSettings || {};
  const title = project.title;
  const author = kdpSettings.author || "Author";
  const subtitle = kdpSettings.subtitle || "";
  
  // Create PDF with 6x9 inch page size
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt", // points
    format: [inchesToPoints(KDP_CONFIG.TRIM_WIDTH_INCHES), inchesToPoints(KDP_CONFIG.TRIM_HEIGHT_INCHES)],
  });

  const pageWidth = inchesToPoints(KDP_CONFIG.TRIM_WIDTH_INCHES);
  const pageHeight = inchesToPoints(KDP_CONFIG.TRIM_HEIGHT_INCHES);
  const marginTop = inchesToPoints(KDP_CONFIG.MARGIN_INCHES);
  const marginBottom = inchesToPoints(KDP_CONFIG.MARGIN_INCHES);
  const marginOuter = inchesToPoints(KDP_CONFIG.MARGIN_INCHES);
  const marginInner = inchesToPoints(KDP_CONFIG.GUTTER_INCHES);
  
  const contentWidth = pageWidth - marginOuter - marginInner;
  let currentY = marginTop;
  let pageNumber = 1;
  let tocEntries: { title: string; page: number }[] = [];

  // Helper to add new page
  const addNewPage = (isLeftPage: boolean = false) => {
    doc.addPage();
    pageNumber++;
    currentY = marginTop;
    return isLeftPage ? marginInner : marginOuter;
  };

  // Helper to get current left margin (alternates for binding)
  const getLeftMargin = () => {
    return pageNumber % 2 === 0 ? marginInner : marginOuter;
  };

  // Helper to add page number footer
  const addPageNumber = () => {
    doc.setFontSize(10);
    doc.setFont(KDP_CONFIG.BODY_FONT, "normal");
    const pageNumText = pageNumber.toString();
    const textWidth = doc.getTextWidth(pageNumText);
    doc.text(pageNumText, (pageWidth - textWidth) / 2, pageHeight - marginBottom / 2);
  };

  // ============== TITLE PAGE ==============
  doc.setFont(KDP_CONFIG.HEADING_FONT, "bold");
  doc.setFontSize(KDP_CONFIG.TITLE_FONT_SIZE);
  
  // Center title vertically on page
  const titleY = pageHeight / 3;
  doc.text(title, pageWidth / 2, titleY, { align: "center" });
  
  // Subtitle if present
  if (subtitle) {
    doc.setFontSize(KDP_CONFIG.SUBTITLE_FONT_SIZE);
    doc.setFont(KDP_CONFIG.BODY_FONT, "italic");
    doc.text(subtitle, pageWidth / 2, titleY + 40, { align: "center" });
  }
  
  // Author name
  doc.setFontSize(14);
  doc.setFont(KDP_CONFIG.BODY_FONT, "normal");
  doc.text(`By ${author}`, pageWidth / 2, pageHeight * 0.6, { align: "center" });

  // ============== COPYRIGHT PAGE ==============
  if (includeCopyrightPage) {
    addNewPage();
    doc.setFontSize(10);
    doc.setFont(KDP_CONFIG.BODY_FONT, "normal");
    
    const copyrightLines = generateCopyrightText(
      title,
      author,
      copyrightYear,
      isbn || kdpSettings.isbn,
      publisherName
    );
    
    currentY = pageHeight / 3; // Start copyright page in lower third
    
    for (const line of copyrightLines) {
      if (currentY > pageHeight - marginBottom - 20) {
        addNewPage();
      }
      if (line === "") {
        currentY += 12;
      } else {
        const splitLines = doc.splitTextToSize(line, contentWidth);
        for (const splitLine of splitLines) {
          doc.text(splitLine, getLeftMargin(), currentY);
          currentY += 14;
        }
      }
    }
  }

  // ============== TABLE OF CONTENTS ==============
  if (includeTableOfContents && chapters.length > 0) {
    addNewPage();
    const tocStartPage = pageNumber;
    
    doc.setFontSize(KDP_CONFIG.HEADING_FONT_SIZE);
    doc.setFont(KDP_CONFIG.HEADING_FONT, "bold");
    doc.text("Table of Contents", pageWidth / 2, currentY, { align: "center" });
    currentY += 50;
    
    doc.setFontSize(12);
    doc.setFont(KDP_CONFIG.BODY_FONT, "normal");
    
    // We'll come back and fill in page numbers after rendering chapters
    const tocPlaceholderY = currentY;
    
    for (let i = 0; i < chapters.length; i++) {
      if (currentY > pageHeight - marginBottom - 30) {
        addNewPage();
      }
      const chapter = chapters[i];
      const chapterTitle = `Chapter ${i + 1}: ${chapter.title}`;
      doc.text(chapterTitle, getLeftMargin(), currentY);
      currentY += 24;
    }
  }

  // ============== CHAPTERS ==============
  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    
    // Start each chapter on a new page
    const leftMargin = addNewPage(i % 2 === 0);
    tocEntries.push({ title: chapter.title, page: pageNumber });
    
    // Chapter header
    doc.setFontSize(KDP_CONFIG.HEADING_FONT_SIZE);
    doc.setFont(KDP_CONFIG.HEADING_FONT, "bold");
    
    const chapterHeading = `Chapter ${i + 1}`;
    doc.text(chapterHeading, pageWidth / 2, currentY, { align: "center" });
    currentY += 30;
    
    // Chapter title
    doc.text(chapter.title, pageWidth / 2, currentY, { align: "center" });
    currentY += 50;
    
    // Chapter content
    doc.setFontSize(KDP_CONFIG.BODY_FONT_SIZE);
    doc.setFont(KDP_CONFIG.BODY_FONT, "normal");
    
    const cleanContent = stripHtml(chapter.content || "");
    const paragraphs = cleanContent.split(/\n\n+/);
    
    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) continue;
      
      const lines = doc.splitTextToSize(paragraph.trim(), contentWidth);
      
      for (const line of lines) {
        if (currentY > pageHeight - marginBottom - 20) {
          addPageNumber();
          addNewPage();
        }
        doc.text(line, getLeftMargin(), currentY);
        currentY += 16; // Line height
      }
      
      currentY += 8; // Paragraph spacing
    }
    
    addPageNumber();
  }

  // ============== AUTHOR BIO (Optional Back Matter) ==============
  if (includeAuthorBio) {
    addNewPage();
    
    doc.setFontSize(KDP_CONFIG.HEADING_FONT_SIZE);
    doc.setFont(KDP_CONFIG.HEADING_FONT, "bold");
    doc.text("About the Author", pageWidth / 2, currentY, { align: "center" });
    currentY += 40;
    
    doc.setFontSize(KDP_CONFIG.BODY_FONT_SIZE);
    doc.setFont(KDP_CONFIG.BODY_FONT, "normal");
    
    const bioText = formatAuthorBio(author, authorBio);
    const bioLines = doc.splitTextToSize(bioText, contentWidth);
    
    for (const line of bioLines) {
      doc.text(line, getLeftMargin(), currentY);
      currentY += 16;
    }
  }

  // Generate output
  const pdfOutput = doc.output("arraybuffer");
  const buffer = Buffer.from(pdfOutput);
  
  const wordCount = calculateProjectWordCount(project);
  const safeTitle = title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
  
  return {
    buffer,
    filename: `${safeTitle}_KDP.pdf`,
    mimeType: "application/pdf",
    pageCount: pageNumber,
    wordCount,
  };
}

/**
 * Export project to DOCX with KDP formatting
 */
export async function exportToDocx(
  project: ContentProject,
  options: KdpExportOptions = {}
): Promise<ExportResult> {
  const {
    includeTableOfContents = true,
    includeCopyrightPage = true,
    includeAuthorBio = false,
    authorBio,
    copyrightYear,
    publisherName,
    isbn,
  } = options;

  const chapters = project.content?.chapters || [];
  const kdpSettings = project.kdpSettings || {};
  const title = project.title;
  const author = kdpSettings.author || "Author";
  const subtitle = kdpSettings.subtitle || "";

  const sections: any[] = [];
  
  // ============== TITLE PAGE ==============
  const titlePageChildren: Paragraph[] = [];
  
  // Add vertical spacing before title
  for (let i = 0; i < 10; i++) {
    titlePageChildren.push(new Paragraph({ text: "" }));
  }
  
  // Title
  titlePageChildren.push(
    new Paragraph({
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: KDP_CONFIG.TITLE_FONT_SIZE * 2, // Half-points
          font: "Georgia",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );
  
  // Subtitle
  if (subtitle) {
    titlePageChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: subtitle,
            italics: true,
            size: KDP_CONFIG.SUBTITLE_FONT_SIZE * 2,
            font: "Georgia",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 },
      })
    );
  }
  
  // Add more spacing
  for (let i = 0; i < 8; i++) {
    titlePageChildren.push(new Paragraph({ text: "" }));
  }
  
  // Author
  titlePageChildren.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `By ${author}`,
          size: 28,
          font: "Georgia",
        }),
      ],
      alignment: AlignmentType.CENTER,
    })
  );

  sections.push({
    properties: {
      page: {
        size: {
          width: inchesToTwips(KDP_CONFIG.TRIM_WIDTH_INCHES),
          height: inchesToTwips(KDP_CONFIG.TRIM_HEIGHT_INCHES),
        },
        margin: {
          top: inchesToTwips(KDP_CONFIG.MARGIN_INCHES),
          bottom: inchesToTwips(KDP_CONFIG.MARGIN_INCHES),
          left: inchesToTwips(KDP_CONFIG.GUTTER_INCHES),
          right: inchesToTwips(KDP_CONFIG.MARGIN_INCHES),
        },
      },
    },
    children: titlePageChildren,
  });

  // ============== COPYRIGHT PAGE ==============
  if (includeCopyrightPage) {
    const copyrightChildren: Paragraph[] = [];
    
    // Add spacing at top
    for (let i = 0; i < 15; i++) {
      copyrightChildren.push(new Paragraph({ text: "" }));
    }
    
    const copyrightLines = generateCopyrightText(
      title,
      author,
      copyrightYear,
      isbn || kdpSettings.isbn,
      publisherName
    );
    
    for (const line of copyrightLines) {
      copyrightChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              size: 20, // 10pt
              font: "Georgia",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: line === "" ? 200 : 120 },
        })
      );
    }
    
    sections.push({
      properties: {
        page: {
          size: {
            width: inchesToTwips(KDP_CONFIG.TRIM_WIDTH_INCHES),
            height: inchesToTwips(KDP_CONFIG.TRIM_HEIGHT_INCHES),
          },
          margin: {
            top: inchesToTwips(KDP_CONFIG.MARGIN_INCHES),
            bottom: inchesToTwips(KDP_CONFIG.MARGIN_INCHES),
            left: inchesToTwips(KDP_CONFIG.GUTTER_INCHES),
            right: inchesToTwips(KDP_CONFIG.MARGIN_INCHES),
          },
        },
      },
      children: copyrightChildren,
    });
  }

  // ============== TABLE OF CONTENTS ==============
  if (includeTableOfContents && chapters.length > 0) {
    const tocChildren: (Paragraph | TableOfContents)[] = [];
    
    tocChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Table of Contents",
            bold: true,
            size: KDP_CONFIG.HEADING_FONT_SIZE * 2,
            font: "Georgia",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
      })
    );
    
    // Table of Contents placeholder (Word will generate actual TOC from headings)
    tocChildren.push(
      new TableOfContents("Table of Contents", {
        hyperlink: true,
        headingStyleRange: "1-3",
      })
    );
    
    // Manual TOC entries as readable backup
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      tocChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Chapter ${i + 1}: ${chapter.title}`,
              size: 24,
              font: "Georgia",
            }),
          ],
          spacing: { after: 200 },
        })
      );
    }
    
    sections.push({
      properties: {
        page: {
          size: {
            width: inchesToTwips(KDP_CONFIG.TRIM_WIDTH_INCHES),
            height: inchesToTwips(KDP_CONFIG.TRIM_HEIGHT_INCHES),
          },
          margin: {
            top: inchesToTwips(KDP_CONFIG.MARGIN_INCHES),
            bottom: inchesToTwips(KDP_CONFIG.MARGIN_INCHES),
            left: inchesToTwips(KDP_CONFIG.GUTTER_INCHES),
            right: inchesToTwips(KDP_CONFIG.MARGIN_INCHES),
          },
        },
      },
      children: tocChildren,
    });
  }

  // ============== CHAPTERS ==============
  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    const chapterChildren: Paragraph[] = [];
    
    // Chapter number
    chapterChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Chapter ${i + 1}`,
            bold: true,
            size: 32,
            font: "Georgia",
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      })
    );
    
    // Chapter title
    chapterChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: chapter.title,
            bold: true,
            size: KDP_CONFIG.HEADING_FONT_SIZE * 2,
            font: "Georgia",
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
      })
    );
    
    // Chapter content
    const cleanContent = stripHtml(chapter.content || "");
    const paragraphs = cleanContent.split(/\n\n+/);
    
    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) continue;
      
      chapterChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: paragraph.trim(),
              size: KDP_CONFIG.BODY_FONT_SIZE * 2,
              font: "Georgia",
            }),
          ],
          spacing: { after: 200, line: 360 }, // 1.5 line spacing
          indent: { firstLine: 720 }, // First line indent (0.5 inch)
        })
      );
    }
    
    sections.push({
      properties: {
        page: {
          size: {
            width: inchesToTwips(KDP_CONFIG.TRIM_WIDTH_INCHES),
            height: inchesToTwips(KDP_CONFIG.TRIM_HEIGHT_INCHES),
          },
          margin: {
            top: inchesToTwips(KDP_CONFIG.MARGIN_INCHES),
            bottom: inchesToTwips(KDP_CONFIG.MARGIN_INCHES),
            left: inchesToTwips(KDP_CONFIG.GUTTER_INCHES),
            right: inchesToTwips(KDP_CONFIG.MARGIN_INCHES),
          },
          pageNumbers: {
            start: i + 1,
            formatType: NumberFormat.DECIMAL,
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: i % 2 === 0 ? title : chapter.title,
                    italics: true,
                    size: 20,
                    font: "Georgia",
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 20,
                    font: "Georgia",
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
      },
      children: chapterChildren,
    });
  }

  // ============== AUTHOR BIO ==============
  if (includeAuthorBio) {
    const bioChildren: Paragraph[] = [];
    
    bioChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "About the Author",
            bold: true,
            size: KDP_CONFIG.HEADING_FONT_SIZE * 2,
            font: "Georgia",
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );
    
    const bioText = formatAuthorBio(author, authorBio);
    
    bioChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: bioText,
            size: KDP_CONFIG.BODY_FONT_SIZE * 2,
            font: "Georgia",
          }),
        ],
        spacing: { after: 200, line: 360 },
      })
    );
    
    sections.push({
      properties: {
        page: {
          size: {
            width: inchesToTwips(KDP_CONFIG.TRIM_WIDTH_INCHES),
            height: inchesToTwips(KDP_CONFIG.TRIM_HEIGHT_INCHES),
          },
          margin: {
            top: inchesToTwips(KDP_CONFIG.MARGIN_INCHES),
            bottom: inchesToTwips(KDP_CONFIG.MARGIN_INCHES),
            left: inchesToTwips(KDP_CONFIG.GUTTER_INCHES),
            right: inchesToTwips(KDP_CONFIG.MARGIN_INCHES),
          },
        },
      },
      children: bioChildren,
    });
  }

  // Create Document
  const doc = new Document({
    creator: "WashBizHub AI Content Studio",
    title: title,
    subject: subtitle || "Book exported from AI Content Studio",
    sections,
  });

  // Generate buffer
  const buffer = await Packer.toBuffer(doc);
  
  const wordCount = calculateProjectWordCount(project);
  const pageCount = estimatePageCount(wordCount);
  const safeTitle = title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
  
  return {
    buffer: Buffer.from(buffer),
    filename: `${safeTitle}_KDP.docx`,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    pageCount,
    wordCount,
  };
}

/**
 * Get book export metadata (for preview before export)
 */
export function getExportMetadata(project: ContentProject) {
  const chapters = project.content?.chapters || [];
  const kdpSettings = project.kdpSettings || {};
  const wordCount = calculateProjectWordCount(project);
  const pageCount = estimatePageCount(wordCount);
  
  return {
    title: project.title,
    subtitle: kdpSettings.subtitle,
    author: kdpSettings.author || "Author",
    chapterCount: chapters.length,
    wordCount,
    estimatedPageCount: pageCount,
    isbn: kdpSettings.isbn ? generateIsbnPlaceholder(kdpSettings.isbn) : null,
    trimSize: `${KDP_CONFIG.TRIM_WIDTH_INCHES}" x ${KDP_CONFIG.TRIM_HEIGHT_INCHES}"`,
    exportFormats: ["pdf", "docx"],
    kdpReady: wordCount >= 10000 && chapters.length >= 3,
    warnings: [
      ...(wordCount < 10000 ? ["Word count is below KDP minimum recommendation (10,000 words)"] : []),
      ...(chapters.length < 3 ? ["Recommended minimum 3 chapters for books"] : []),
      ...(!kdpSettings.isbn ? ["ISBN not assigned - KDP will assign one automatically"] : []),
    ],
  };
}
