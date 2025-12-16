// Google Drive Integration - Connected via Replit
// Provides access to user's Google Drive documents and files

import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
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
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-drive',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Drive not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
export async function getGoogleDriveClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

// List files in Google Drive
export async function listDriveFiles(options: {
  query?: string;
  folderId?: string;
  mimeType?: string;
  pageSize?: number;
  pageToken?: string;
} = {}) {
  const drive = await getGoogleDriveClient();
  
  let q = options.query || '';
  
  if (options.folderId) {
    q += (q ? ' and ' : '') + `'${options.folderId}' in parents`;
  }
  
  if (options.mimeType) {
    q += (q ? ' and ' : '') + `mimeType='${options.mimeType}'`;
  }
  
  // Exclude trashed files
  q += (q ? ' and ' : '') + 'trashed=false';
  
  const response = await drive.files.list({
    q,
    pageSize: options.pageSize || 50,
    pageToken: options.pageToken,
    fields: 'nextPageToken, files(id, name, mimeType, createdTime, modifiedTime, size, webViewLink, thumbnailLink, parents)',
  });
  
  return {
    files: response.data.files || [],
    nextPageToken: response.data.nextPageToken
  };
}

// Get file content (for text-based files)
export async function getFileContent(fileId: string) {
  const drive = await getGoogleDriveClient();
  
  // First get file metadata to check type
  const file = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType'
  });
  
  const mimeType = file.data.mimeType;
  
  // For Google Docs, Sheets, etc - export as text/html or plain text
  if (mimeType?.startsWith('application/vnd.google-apps.')) {
    let exportMimeType = 'text/plain';
    
    if (mimeType === 'application/vnd.google-apps.document') {
      exportMimeType = 'text/plain'; // or 'text/html' for formatted content
    } else if (mimeType === 'application/vnd.google-apps.spreadsheet') {
      exportMimeType = 'text/csv';
    }
    
    const response = await drive.files.export({
      fileId,
      mimeType: exportMimeType
    }, {
      responseType: 'text'
    });
    
    return {
      content: response.data as string,
      mimeType: exportMimeType,
      name: file.data.name
    };
  }
  
  // For regular files, download content
  const response = await drive.files.get({
    fileId,
    alt: 'media'
  }, {
    responseType: 'text'
  });
  
  return {
    content: response.data as string,
    mimeType,
    name: file.data.name
  };
}

// Search for documents containing specific text in name
export async function searchDocuments(searchText: string, options: {
  pageSize?: number;
  pageToken?: string;
} = {}) {
  const drive = await getGoogleDriveClient();
  
  const response = await drive.files.list({
    q: `name contains '${searchText}' and trashed=false`,
    pageSize: options.pageSize || 20,
    pageToken: options.pageToken,
    fields: 'nextPageToken, files(id, name, mimeType, createdTime, modifiedTime, webViewLink)',
  });
  
  return {
    files: response.data.files || [],
    nextPageToken: response.data.nextPageToken
  };
}

// Get all articles/documents (Google Docs specifically)
export async function getArticles(options: {
  pageSize?: number;
  pageToken?: string;
} = {}) {
  return listDriveFiles({
    mimeType: 'application/vnd.google-apps.document',
    ...options
  });
}

// Get folders
export async function getFolders(parentFolderId?: string) {
  return listDriveFiles({
    mimeType: 'application/vnd.google-apps.folder',
    folderId: parentFolderId
  });
}
