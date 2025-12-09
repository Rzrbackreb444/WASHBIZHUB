export interface WatermarkOptions {
  userEmail?: string;
  userId?: string;
  licensedTo?: string;
  includeTimestamp?: boolean;
  opacity?: number;
  position?: 'top' | 'bottom' | 'center' | 'diagonal';
}

export function generateWatermarkText(options: WatermarkOptions): string {
  const parts: string[] = [];
  
  if (options.licensedTo) {
    parts.push(`Licensed to: ${options.licensedTo}`);
  } else if (options.userEmail) {
    parts.push(`Licensed to: ${options.userEmail}`);
  } else if (options.userId) {
    parts.push(`License ID: ${options.userId.substring(0, 12)}...`);
  } else {
    parts.push('Licensed Copy');
  }
  
  if (options.includeTimestamp !== false) {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    parts.push(`Generated: ${timestamp} UTC`);
  }
  
  parts.push('WashBizHub.com');
  
  return parts.join(' | ');
}

export function generateWatermarkHtml(options: WatermarkOptions): string {
  const text = generateWatermarkText(options);
  const opacity = options.opacity ?? 0.15;
  
  const positionStyles: Record<string, string> = {
    top: 'top: 20px; left: 50%; transform: translateX(-50%);',
    bottom: 'bottom: 20px; left: 50%; transform: translateX(-50%);',
    center: 'top: 50%; left: 50%; transform: translate(-50%, -50%);',
    diagonal: 'top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg);',
  };
  
  const position = options.position || 'diagonal';
  
  return `
    <div style="
      position: fixed;
      ${positionStyles[position]}
      font-size: ${position === 'diagonal' ? '24px' : '12px'};
      font-family: Arial, sans-serif;
      color: rgba(0, 0, 0, ${opacity});
      pointer-events: none;
      z-index: 9999;
      white-space: nowrap;
      ${position === 'diagonal' ? 'width: 150%; text-align: center;' : ''}
    ">
      ${text}
    </div>
  `;
}

export function addWatermarkToPdfContent(htmlContent: string, options: WatermarkOptions): string {
  const watermarkHtml = generateWatermarkHtml(options);
  
  if (htmlContent.includes('</body>')) {
    return htmlContent.replace('</body>', `${watermarkHtml}</body>`);
  }
  
  return htmlContent + watermarkHtml;
}

export function generatePdfWatermarkStyle(options: WatermarkOptions): string {
  const text = generateWatermarkText(options);
  const opacity = options.opacity ?? 0.1;
  
  return `
    @page {
      @bottom-center {
        content: "${text.replace(/"/g, '\\"')}";
        font-size: 8pt;
        color: rgba(0, 0, 0, ${opacity});
      }
    }
    
    .watermark-overlay {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 48pt;
      color: rgba(0, 0, 0, ${opacity});
      pointer-events: none;
      z-index: 9999;
      white-space: nowrap;
      width: 200%;
      text-align: center;
    }
  `;
}

export function generateWatermarkMetadata(options: WatermarkOptions): Record<string, string> {
  return {
    'X-WatermarkedBy': 'WashBizHub.com',
    'X-LicensedTo': options.licensedTo || options.userEmail || options.userId || 'Anonymous',
    'X-GeneratedAt': new Date().toISOString(),
    'X-DocumentId': generateDocumentId(),
  };
}

function generateDocumentId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `WBH-${timestamp}-${random}`.toUpperCase();
}

export function addInvisibleWatermark(content: string, options: WatermarkOptions): string {
  const metadata = {
    licensedTo: options.licensedTo || options.userEmail || options.userId,
    timestamp: new Date().toISOString(),
    documentId: generateDocumentId(),
    source: 'WashBizHub.com',
  };
  
  const encodedMetadata = Buffer.from(JSON.stringify(metadata)).toString('base64');
  
  const invisibleMark = `<!-- WBH:${encodedMetadata} -->`;
  
  if (content.includes('</body>')) {
    return content.replace('</body>', `${invisibleMark}</body>`);
  }
  
  return content + invisibleMark;
}

export function extractInvisibleWatermark(content: string): Record<string, any> | null {
  const match = content.match(/<!-- WBH:([A-Za-z0-9+/=]+) -->/);
  
  if (!match) return null;
  
  try {
    const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export interface ExportWatermarkResult {
  content: string;
  metadata: Record<string, string>;
  documentId: string;
}

export function watermarkExport(
  htmlContent: string, 
  options: WatermarkOptions
): ExportWatermarkResult {
  const documentId = generateDocumentId();
  const metadata = generateWatermarkMetadata({ ...options });
  metadata['X-DocumentId'] = documentId;
  
  let watermarkedContent = addWatermarkToPdfContent(htmlContent, options);
  
  watermarkedContent = addInvisibleWatermark(watermarkedContent, options);
  
  return {
    content: watermarkedContent,
    metadata,
    documentId,
  };
}
