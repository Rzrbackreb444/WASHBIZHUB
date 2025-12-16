// Script to fetch Larry's articles from Google Drive
// Uses the google-drive connection integration

import { google } from 'googleapis';
import * as fs from 'fs';

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

async function getGoogleDriveClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

async function listFolderContents(folderId: string) {
  const drive = await getGoogleDriveClient();
  
  console.log(`\n📁 Fetching contents of folder: ${folderId}\n`);
  
  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, size, createdTime, modifiedTime)',
    pageSize: 100,
    orderBy: 'name'
  });

  const files = response.data.files || [];
  
  console.log(`Found ${files.length} files/folders:\n`);
  
  files.forEach((file, index) => {
    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
    const icon = isFolder ? '📁' : '📄';
    const size = file.size ? `(${Math.round(parseInt(file.size) / 1024)}KB)` : '';
    console.log(`${index + 1}. ${icon} ${file.name} ${size}`);
    console.log(`   ID: ${file.id}`);
    console.log(`   Type: ${file.mimeType}`);
    console.log('');
  });

  return files;
}

async function downloadFile(fileId: string, fileName: string, mimeType: string) {
  const drive = await getGoogleDriveClient();
  
  let exportMimeType = 'text/plain';
  let extension = '.txt';
  
  if (mimeType === 'application/vnd.google-apps.document') {
    exportMimeType = 'text/plain';
    extension = '.txt';
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    // Word docs - download directly
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );
    const outputPath = `attached_assets/larry_articles/${fileName}`;
    fs.writeFileSync(outputPath, Buffer.from(response.data as ArrayBuffer));
    console.log(`Downloaded: ${outputPath}`);
    return outputPath;
  }
  
  // Export Google Docs as text
  if (mimeType.includes('google-apps')) {
    const response = await drive.files.export(
      { fileId, mimeType: exportMimeType },
      { responseType: 'text' }
    );
    
    const cleanName = fileName.replace(/\.[^/.]+$/, '') + extension;
    const outputPath = `attached_assets/larry_articles/${cleanName}`;
    fs.writeFileSync(outputPath, response.data as string);
    console.log(`Exported: ${outputPath}`);
    return outputPath;
  }
  
  return null;
}

async function main() {
  // Larry's articles folder ID from the shared link
  const LARRY_FOLDER_ID = '1_mRW-Bz0Lkb78_KsX3QC_A54o0OvLMwk';
  
  // Ensure output directory exists
  if (!fs.existsSync('attached_assets/larry_articles')) {
    fs.mkdirSync('attached_assets/larry_articles', { recursive: true });
  }
  
  console.log('🔍 Accessing Larry\'s Articles from Google Drive...\n');
  
  const files = await listFolderContents(LARRY_FOLDER_ID);
  
  // Save the file list for reference
  fs.writeFileSync(
    'attached_assets/larry_articles/_file_index.json',
    JSON.stringify(files, null, 2)
  );
  
  console.log('\n✅ File index saved to attached_assets/larry_articles/_file_index.json');
}

main().catch(console.error);
