import { google, docs_v1 } from 'googleapis';

let connectionSettings: any;

async function getAccessToken(): Promise<string> {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-docs',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Docs not connected');
  }
  return accessToken;
}

async function getDocsClient(): Promise<docs_v1.Docs> {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.docs({ version: 'v1', auth: oauth2Client });
}

export interface DocumentContent {
  documentId: string;
  title: string;
  content: string;
  lastModified?: string;
}

export async function getDocument(documentId: string): Promise<DocumentContent> {
  try {
    const docs = await getDocsClient();
    
    const response = await docs.documents.get({
      documentId,
    });
    
    const doc = response.data;
    
    let content = '';
    if (doc.body?.content) {
      content = extractTextFromContent(doc.body.content);
    }
    
    return {
      documentId: doc.documentId || documentId,
      title: doc.title || 'Untitled',
      content,
    };
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
}

function extractTextFromContent(content: docs_v1.Schema$StructuralElement[]): string {
  let text = '';
  
  for (const element of content) {
    if (element.paragraph) {
      for (const paragraphElement of element.paragraph.elements || []) {
        if (paragraphElement.textRun?.content) {
          text += paragraphElement.textRun.content;
        }
      }
    } else if (element.table) {
      for (const row of element.table.tableRows || []) {
        for (const cell of row.tableCells || []) {
          if (cell.content) {
            text += extractTextFromContent(cell.content);
          }
        }
      }
    } else if (element.tableOfContents) {
      if (element.tableOfContents.content) {
        text += extractTextFromContent(element.tableOfContents.content);
      }
    }
  }
  
  return text;
}

export async function getDocumentStructure(documentId: string): Promise<{
  title: string;
  headings: Array<{ level: number; text: string; index: number }>;
  wordCount: number;
  paragraphCount: number;
}> {
  try {
    const docs = await getDocsClient();
    
    const response = await docs.documents.get({
      documentId,
    });
    
    const doc = response.data;
    const headings: Array<{ level: number; text: string; index: number }> = [];
    let wordCount = 0;
    let paragraphCount = 0;
    
    if (doc.body?.content) {
      for (const element of doc.body.content) {
        if (element.paragraph) {
          paragraphCount++;
          
          const namedStyleType = element.paragraph.paragraphStyle?.namedStyleType;
          if (namedStyleType?.startsWith('HEADING_')) {
            const level = parseInt(namedStyleType.replace('HEADING_', ''), 10);
            let headingText = '';
            for (const pe of element.paragraph.elements || []) {
              if (pe.textRun?.content) {
                headingText += pe.textRun.content;
              }
            }
            headings.push({
              level,
              text: headingText.trim(),
              index: element.startIndex || 0,
            });
          }
          
          for (const pe of element.paragraph.elements || []) {
            if (pe.textRun?.content) {
              wordCount += pe.textRun.content.split(/\s+/).filter(Boolean).length;
            }
          }
        }
      }
    }
    
    return {
      title: doc.title || 'Untitled',
      headings,
      wordCount,
      paragraphCount,
    };
  } catch (error) {
    console.error('Error getting document structure:', error);
    throw error;
  }
}

export async function createDocument(title: string, content?: string): Promise<string> {
  try {
    const docs = await getDocsClient();
    
    const response = await docs.documents.create({
      requestBody: {
        title,
      },
    });
    
    const documentId = response.data.documentId;
    
    if (content && documentId) {
      await docs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: content,
              },
            },
          ],
        },
      });
    }
    
    return documentId || '';
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
}

export async function appendToDocument(documentId: string, text: string): Promise<void> {
  try {
    const docs = await getDocsClient();
    
    const docResponse = await docs.documents.get({ documentId });
    const endIndex = docResponse.data.body?.content?.slice(-1)[0]?.endIndex || 1;
    
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: { index: endIndex - 1 },
              text: '\n' + text,
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error('Error appending to document:', error);
    throw error;
  }
}
